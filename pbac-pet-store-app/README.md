# Wyld Pet Store with PBAC using Amazon Verified Permissions

This repository contains a complete implementation of the Pet Store application using Policy-Based Access Control (PBAC) with AWS Verified Permissions.

## Overview

This Pet Store application demonstrates modern access control using PBAC, which offers fine-grained permissions based on policies rather than traditional roles. This implementation showcases how to build secure, scalable applications with centralized policy management.

## Architecture

- **Frontend**: Next.js web application deployed as a Lambda function
- **Backend**: REST API with DynamoDB for data storage
- **Authentication**: Amazon Cognito User Pool
- **Authorization**: Policy-Based Access Control (PBAC) with Amazon Verified Permissions


## Repository Structure

```
pbac-pet-store-app/
├── backend/             # Backend API and resources
│   ├── backend-stack.yaml  # Nested CloudFormation template for deploying all backend resources
│   ├── lambda-authorizer.js # Lambda authorizer using AWS Verified Permissions
│   ├── schema.json      # Schema definition for AWS Verified Permissions
│   └── README.md        # Backend documentation
├── frontend/            # Next.js frontend application
│   ├── package/         # Frontend package directory
│   │   ├── frontend-package/ # Next.js application source
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Next.js pages and API routes
│   │   │   ├── public/       # Static assets
│   │   │   ├── styles/       # CSS styles
│   │   │   ├── package.json  # Dependencies and scripts
│   │   │   └── server.js     # Custom server configuration
│   │   └── frontend-package.zip # Packaged frontend for deployment (re-built and packaged for every deployment)
│   ├── Makefile         # Build instructions for SAM
│   └── template.yaml    # Nested CloudFormation template for deploying all frontend resources
├── main-template.yaml   # Main CloudFormation template
├── deploy.sh            # Deployment script
└── README.md            # This file
```

## Pre-requisites

Before deploying this application, ensure you have the following:

1. **AWS CLI** - Installed and configured with appropriate permissions
2. **AWS Account** - With permissions to create and manage the following services:
   - AWS Lambda
   - Amazon API Gateway
   - Amazon DynamoDB
   - Amazon Cognito
   - AWS IAM roles and policies
   - Amazon S3
   - AWS CloudFormation
   - AWS Verified Permissions (key requirement for PBAC implementation)
3. **Node.js and npm** - Version 16.x or higher
4. **ZIP utility** - For packaging the frontend application
5. **Bash shell** - For running the deployment script
6. **AWS SDK for JavaScript** - The application uses AWS SDK v3 modules:
   - @aws-sdk/client-verifiedpermissions
   - @aws-sdk/client-dynamodb
   - @aws-sdk/lib-dynamodb

## How to Deploy

1. Ensure you have met all the pre-requisites above
2. Clone the repository in your local 
3. Navigate to your desired application code:
   - If you want to deploy the application with traditional RBAC approach, navigate to the rbac-pet-store-app folder
   - If you want to deploy the application with future-proof policy based access control (PBAC) approach, navigate to the pbac-pet-store-app folder
4. Run the deployment script in your choosen folder:

### For Mac / Linux Users
```bash
git clone <repo link>
cd sample-migrate-app-access-rbac-to-pbac-with-verified-permissions
./pbac-pet-store-app/deploy.sh <aws-profile-name> <aws-region>
```
Eg - `./pbac-pet-store-app/deploy.sh account1 us-west-2`

### Windows Users

Use the powershell script
```bash
git clone <repo link>
cd sample-migrate-app-access-rbac-to-pbac-with-verified-permissions
./pbac-pet-store-app/pshell-deploy.sh <aws-profile-name> <aws-region>
```


> Note: The profile and region names are optional. If you dont provide any aws profile name or region, the script will take your default aws profile and region.

The deploymentscript will:
- Create/clean necessary S3 buckets
- Build and package the frontend application
- Deploy the CloudFormation stack with all required resources
- Output the web application URL upon completion

## Key Components

### Lambda Authorizer
The `lambda-authorizer.js` integrates with AWS Verified Permissions to make authorization decisions based on policies. It:
- Extracts tokens from API requests
- Determines the resource and action being accessed
- Makes authorization calls to Verified Permissions
- Returns appropriate IAM policies for API Gateway

### Policy Schema
The schema defines the entities, actions, and relationships for the policy store, enabling fine-grained access control based on:
- User attributes
- Resource properties
- Context information

### Frontend Application
The Next.js application provides:
- User authentication
- Store and pet management interface
- Integration with the backend API

## How to Test Access
1. After deployment, access the application using the displayed URL
2. Try to access any of the APIs on the "Wyld Pets" webpage. Your access should be denied as you are not logged into the application
3. Sign in with Cognito 
4. For the first time, you will need to choose the option to "Create an account"
5. After creating an account, logout.
6. Then login to your AWS management console for the same account
7. Navigate to AWS Cognito
8. Under User Pools, your should be able to see a User pool - `App-Auth-Workshop`
9. Inside this selected user pool, go to `Groups`
10. Select your preferred user group and `customer` or `manager`
11. Under the user group, click on `Add user to group`. The user you created on the Cognito web page should be listed for addition to your preferred group.

The current code is designed to allow permissions in the following manner:

| Role / User Group | List Pets | Get Pet Details | Create Pets | Delete Pets |
|------------------|-----------|----------------|-------------|-------------|
| Customer         | Yes       | Yes            | No          | No          |
| Manager          | Yes       | Yes            | Yes         | Yes         |

**Any user account created need to be added to either of the abover user group to get access to the Wyld Pet Store according to the permissions defined above.**

## Benefits of PBAC Implementation

- **Fine-grained control**: Authorization decisions based on multiple attributes
- **Centralized policy management**: All access policies maintained in AWS Verified Permissions
- **Dynamic authorization**: Access decisions adapt based on context
- **Simplified maintenance**: Policies can be updated without code changes
- **Audit-friendly**: Clear visibility into authorization decisions