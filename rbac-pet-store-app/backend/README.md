# RBAC Pet Store Backend

This directory contains the backend infrastructure for the RBAC Pet Store application, implemented using AWS CloudFormation.

## Overview

The backend stack provides all the necessary AWS resources for the Pet Store application, including authentication, authorization, API endpoints, and data storage. It implements Role-Based Access Control (RBAC) using Amazon Cognito user groups.

## Key Components

### AWS Resources Created

1. **Amazon Cognito**
   - **CognitoUserPool**: User directory for authentication
   - **CognitoUserPoolClient**: Client application for the user pool
   - **CognitoUserPoolDomain**: Hosted UI domain for sign-in
   - **User Groups**: 'manager' and 'customer' groups with different permissions
   - **CognitoIdentityPool**: For AWS credential federation

2. **AWS Lambda Functions**
   - **CognitoPreSignUp**: Automatically confirms new users and verifies email/phone
   - **CognitoPreTokenGeneration**: Adds custom claims to tokens based on user groups
   - **CognitoAuthorizerLambda**: Custom authorizer that enforces RBAC permissions
   - **LambdaCRUDDynamoDB**: Handles all CRUD operations for the Pet Store API
   - **PopulateDynamoDBLambda**: Seeds the DynamoDB table with initial pet data
   - **SetWebAppEnvironmentVariableLambda**: Configures environment variables for the frontend

3. **Amazon API Gateway**
   - **PetStoreApi**: REST API with the following endpoints:
     - GET /pets: List all pets (accessible to managers and customers)
     - POST /pets: Create a new pet (accessible to managers only)
     - GET /pets/{id}: Get details of a specific pet (accessible to managers and customers)
     - DELETE /pets/{id}: Delete a pet (accessible to managers only)
   - **ApiGatewayCognitoAuthorizer**: Custom authorizer for API Gateway

4. **Amazon DynamoDB**
   - **DynamoDBTable**: NoSQL database table for storing pet information
     - Primary key: petId (Number)
     - Attributes: price, type, name

5. **IAM Roles and Permissions**
   - **CognitoLambdaRole**: For Cognito trigger Lambda functions
   - **LambdaCRUDDynamoDBRole**: For the CRUD Lambda function
   - **PopulateDynamoDBRole**: For the database seeding Lambda
   - **CustomerRole**: Limited permissions for customer users
   - **ManagerRole**: Extended permissions for manager users

## Authorization Flow

The `cognito-authorizer.js` Lambda function implements the RBAC authorization logic:

1. Extracts the JWT token from the Authorization header
2. Decodes the token to get user information, including group membership
3. Determines permissions based on user groups:
   - Managers have full access to all API endpoints
   - Customers have read-only access (GET operations only)
4. Returns an IAM policy document that allows or denies the API Gateway request

## Deployment

This backend stack is deployed as part of the main application deployment process. The CloudFormation template (`backend-stack.yaml`) is referenced by the main template and receives parameters for integration with the frontend.

## Parameters

The backend stack accepts the following parameters:
- **CognitoCallbackURL**: URL for redirecting after authentication
- **PetStoreWebAppURL**: URL of the deployed frontend application
- **WebAppFunctionARN**: ARN of the Lambda function hosting the frontend

## Outputs

The backend stack provides the following outputs:
- **CognitoUserPoolId**: ID of the created Cognito User Pool
- **CognitoClientId**: ID of the Cognito User Pool Client
- **CognitoClientSecret**: Secret for the Cognito User Pool Client
- **PetStoreAPI**: URL of the deployed API Gateway endpoint
- **DynamoDBTable**: ARN of the DynamoDB table