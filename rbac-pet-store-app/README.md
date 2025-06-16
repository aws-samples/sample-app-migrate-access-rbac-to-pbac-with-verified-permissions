# Wyld Pets Store - with RBAC

A serverless application demonstrating AWS services integration with a pet store frontend and backend using Role-Based Access Control (RBAC).

## Architecture

- **Frontend**: Next.js web application deployed as a Lambda function
- **Backend**: REST API with DynamoDB for data storage
- **Authentication**: Amazon Cognito User Pool
- **Authorization**: Role-Based Access Control (RBAC) with Amazon Cognito Identity Pool

## Repository Structure

```
rbac-pet-store-app/
├── backend/             # Backend API and resources
│   ├── backend-stack.yaml  # Nested CloudFormation template for deploying all backend resources
│   ├── cognito-authorizer.js # Lambda authorizer for API Gateway
│   └── README.md        # Backend scripts documentation
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
│   └── README.md        # Frontend scripts documentation
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
3. **Node.js and npm** - Version 16.x or higher
4. **ZIP utility** - For packaging the frontend application
5. **Bash shell** - For running the deployment script

## How to Deploy

To deploy the application:

1. Ensure you have AWS CLI configured with appropriate permissions
2. Clone the repository in your local
3. Run the deployment script:

```bash
./rbac-pet-store-app/deploy.sh [aws-profile-name]
```
Note: The profile name is optional. If you dont provide any aws profile name, the script will take your default aws profile.

This will:
- Rebuild the Next.js application from source
- Package the CloudFormation templates
- Upload artifacts to S3
- Deploy the complete stack
- Display the application URL when complete

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

## Features

- User authentication with Amazon Cognito
- Role-based access control with AWS Verified Permissions
- CRUD operations for pet store inventory
- Serverless architecture with AWS Lambda and API Gateway

## Development

To make changes to the application:

1. Modify the frontend code in the `frontend/` directory
   - The main application interface is in `frontend/package/frontend-package/pages/index.js`
   - Authentication is handled through NextAuth.js configuration
   - Styling is in `frontend/package/frontend-package/styles/Home.module.css`

2. Modify the backend resources in the `backend/` directory
   - API endpoints are defined in `backend/backend-stack.yaml`
   - Authorization logic is in the Cognito Lambda authorizer

3. Run `./deploy.sh` to deploy your changes
   - The script will automatically rebuild the application with your changes
   - Any changes to the title or UI will be reflected in the deployed application

4. Test your changes by accessing the application URL and signing in with the test credentials

## License

All rights reserved, 2024