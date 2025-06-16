#!/bin/bash
# Error handling function
handle_error() {
  local exit_code=$?
  local line_number=$1
  echo "ERROR: Command failed at line $line_number with exit code $exit_code"
  case $line_number in
    *s3*rm*)
      echo "Failed to empty S3 bucket. Check your permissions and bucket existence."
      ;;
    *s3*cp*)
      echo "Failed to upload to S3. Check your permissions and bucket configuration."
      ;;
    *cloudformation*)
      echo "CloudFormation operation failed. Check your template and permissions."
      ;;
    *npm*)
      echo "NPM operation failed. Check your Node.js environment."
      ;;
    *)
      echo "Check the command output above for specific error details."
      ;;
  esac
  exit $exit_code
}

# Enable error trapping
trap 'handle_error $LINENO' ERR
set -e

# Check if AWS profile and region are provided as arguments
AWS_PROFILE_PARAM=""
AWS_REGION_PARAM=""

if [[ $# -ge 1 && $# -le 2 ]]; then
  # First parameter is always the profile
  AWS_PROFILE=$1
  AWS_PROFILE_PARAM="--profile $AWS_PROFILE"
  echo "=== PetStore App Deployment (PBAC Version) using AWS profile: $AWS_PROFILE ==="
  
  # Second parameter is the region (if provided)
  if [ $# -eq 2 ]; then
    REGION=$2
    AWS_REGION_PARAM="--region $REGION"
    echo "Using AWS Region: $REGION"
  else
    # Get region from the specified profile
    REGION=$(aws $AWS_PROFILE_PARAM configure get region 2>/dev/null || echo "us-east-1")
    echo "Using AWS Region from profile: $REGION"
  fi
else
  echo "=== PetStore App Deployment (PBAC Version) using default AWS profile ==="
  # Get region from default profile
  REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")
  echo "Using AWS Region from default profile: $REGION"
fi

echo "This script will deploy the complete PetStore application stack with PBAC and Amazon Verified Permission"

# Set variables
STACK_NAME="PetStore-PBAC-App"

echo "Retrieving AWS account ID..."
if ! ACCOUNT_ID=$(aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM sts get-caller-identity --query 'Account' --output text 2>&1); then
  echo "ERROR: Failed to get AWS account ID. Please check your AWS credentials and profile."
  echo "Error details: $ACCOUNT_ID"
  exit 1
fi
echo "Using AWS Account ID: $ACCOUNT_ID"

# Use account and region specific bucket name
S3_BUCKET="petstore-pbac-${REGION}-${ACCOUNT_ID}"
TIMESTAMP=$(date +%s)

# Clean up existing petstore buckets in the current region
echo "Looking for existing petstore-pbac buckets to clean up in region $REGION..."
# Check if the bucket already exists
BUCKETS=$(aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3api list-buckets --query "Buckets[?Name=='${S3_BUCKET}'].Name" --output text)

# If the bucket exists, empty it
if [ -n "$BUCKETS" ]; then
  echo "Emptying bucket: $S3_BUCKET"
  if ! aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3 rm s3://$S3_BUCKET --recursive --quiet; then
    echo "WARNING: Failed to empty bucket $S3_BUCKET. This may be due to permissions or the bucket being already empty."
    echo "Continuing with deployment..."
  else
    echo "Bucket emptied successfully"
  fi
fi

# Create S3 bucket if it doesn't exist
echo "Creating/checking S3 bucket: $S3_BUCKET"
if ! aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3api head-bucket --bucket $S3_BUCKET 2>/dev/null; then
  echo "Bucket doesn't exist, creating it in region $REGION..."
  if [ "$REGION" = "us-east-1" ]; then
    aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3api create-bucket --bucket $S3_BUCKET
  else
    aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3api create-bucket --bucket $S3_BUCKET --create-bucket-configuration LocationConstraint=$REGION
  fi
  
  # No bucket policies - rely on default permissions
  echo "Using default bucket permissions"
fi

# Delete the existing stack to ensure a clean deployment
echo "Checking if stack exists..."
if aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation describe-stacks --stack-name $STACK_NAME 2>/dev/null; then
  echo "Deleting existing stack: $STACK_NAME"
  aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation delete-stack --stack-name $STACK_NAME
  echo "Waiting for stack deletion to complete..."
  aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation wait stack-delete-complete --stack-name $STACK_NAME
  echo "Stack deletion complete."
fi

# Rebuild and repackage the frontend code
echo "Rebuilding and repackaging frontend code..."
cd frontend/package/frontend-package
echo "Installing only production dependencies with legacy-peer-deps..."
npm ci --quiet --production --legacy-peer-deps || npm install --quiet --production --legacy-peer-deps

echo "Building Next.js application..."
npm run build
# Clean up unnecessary files
echo "Cleaning up unnecessary files..."
rm -rf .git .github tests test coverage docs examples *.md
find . -name "*.ts" -not -path "./node_modules/*" -delete
find . -name "*.map" -delete
find . -name "*.log" -delete
# Remove only clearly unnecessary files
echo "Removing only unnecessary files..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
cd ..
# Delete any existing frontend package zip file
rm -f frontend-package.zip
echo "Creating new package zip with only necessary files..."
cd frontend-package
# Create a clean zip with all necessary files
zip -r ../frontend-package.zip . \
  -x ".git/*" \
  -x "*.log" \
  -x "*.map" \
  -x "tests/*" \
  -x "test/*" \
  -x ".github/*" \
  -x "*.md"
cd ../../..

# Upload the frontend package directly to S3 with cache-busting metadata
echo "Uploading frontend package to S3..."
if ! aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM s3 cp frontend/package/frontend-package.zip s3://$S3_BUCKET/petstore-app/frontend-package.zip \
  --metadata "{\"timestamp\":\"$TIMESTAMP\"}" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-disposition "attachment; filename=\"frontend-package-${TIMESTAMP}.zip\""; then
  echo "ERROR: Failed to upload frontend package to S3 bucket $S3_BUCKET"
  echo "This is likely due to insufficient permissions or bucket configuration issues."
  echo "Please check your IAM permissions and S3 bucket settings."
  exit 1
fi
echo "Frontend package uploaded successfully"

# Package the CloudFormation template
echo "Packaging CloudFormation template..."
aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation package \
  --template-file main-template.yaml \
  --s3-bucket $S3_BUCKET \
  --s3-prefix petstore-app-$TIMESTAMP \
  --output-template-file packaged-main-template.yaml \
  --force-upload

# Deploy the CloudFormation stack
echo "Deploying CloudFormation stack..."
aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation deploy \
  --template-file packaged-main-template.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --no-fail-on-empty-changeset

# Get the outputs
echo "Deployment complete! Stack outputs:"
aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs" \
  --output table

# Get the web app URL
WEBAPP_URL=$(aws $AWS_PROFILE_PARAM $AWS_REGION_PARAM cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='PetStoreWebAppURL'].OutputValue" \
  --output text)

echo "PetStore application with PBAC is now available at:"
echo "${WEBAPP_URL}?v=${TIMESTAMP}"
echo ""
echo "NOTE: Use the URL with the version parameter to bypass browser caching."
echo "If you still see the old version, try clearing your browser cache or opening in an incognito/private window."