# PBAC Pet Store Backend

This directory contains the backend infrastructure for the PBAC Pet Store application, implemented using AWS CloudFormation and AWS Verified Permissions.

## Overview

The backend stack provides all the necessary AWS resources for the Pet Store application, including authentication, authorization, API endpoints, and data storage. It implements Policy-Based Access Control (PBAC) using AWS Verified Permissions for fine-grained authorization.

## Key Components

### AWS Resources Created

1. **Amazon Cognito**
   - **CognitoUserPool**: User directory for authentication
   - **CognitoUserPoolClient**: Client application for the user pool
   - **CognitoUserPoolDomain**: Hosted UI domain for sign-in
   - **User Groups**: 'manager' and 'customer' groups with different permissions

2. **AWS Verified Permissions**
   - **PolicyStore**: Central repository for authorization policies
   - **IdentitySource**: Integration with Cognito User Pool
   - **Policies**: Declarative policies defining access rules:
     - CustomerPolicy: Read-only access to pets
     - ManagerPolicyRead: Read access to pets
     - ManagerPolicyWrite: Write/delete access to pets

3. **AWS Lambda Functions**
   - **CognitoPreSignUp**: Automatically confirms new users and verifies email/phone
   - **CognitoPreTokenGeneration**: Adds custom claims to tokens based on user groups
   - **AVPAuthorizerLambda**: Custom authorizer that uses AWS Verified Permissions
   - **LambdaCRUDDynamoDB**: Handles all CRUD operations for the Pet Store API
   - **PopulateDynamoDBLambda**: Seeds the DynamoDB table with initial pet data
   - **SetWebAppEnvironmentVariableLambda**: Configures environment variables for the frontend

4. **Amazon API Gateway**
   - **PetStoreApi**: REST API with the following endpoints:
     - GET /stores/{storeid}/pets: List all pets in a store
     - POST /stores/{storeid}/pets: Create a new pet in a store
     - GET /stores/{storeid}/pets/{id}: Get details of a specific pet
     - DELETE /stores/{storeid}/pets/{id}: Delete a pet
   - **ApiGatewayAVPAuthorizer2**: Custom authorizer for API Gateway using Verified Permissions

5. **Amazon DynamoDB**
   - **DynamoDBTable**: NoSQL database table for storing pet information
     - Composite key: storeId (HASH) and petId (RANGE)
     - Attributes: price, type

6. **IAM Roles and Permissions**
   - **CognitoLambdaRole**: For Cognito trigger Lambda functions
   - **AVPAuthorizerLambdaRole**: For the Verified Permissions authorizer Lambda
   - **LambdaCRUDDynamoDBRole**: For the CRUD Lambda function
   - **PopulateDynamoDBRole**: For the database seeding Lambda

## Authorization Flow

The `lambda-authorizer.js` Lambda function implements the PBAC authorization logic:

1. Extracts the JWT token from the Authorization header
2. Decodes the token to get user information
3. Determines the resource and action being accessed
4. Queries DynamoDB to get additional resource attributes if needed
5. Makes an authorization request to AWS Verified Permissions
6. Returns an IAM policy document based on the authorization decision

## Schema Definition

The `schema.json` file defines the Cedar schema for AWS Verified Permissions, including:

1. **Entity Types**:
   - User: Represents authenticated users
   - UserGroup: Represents user groups (manager, customer)
   - Store: Represents pet stores with storeId attribute
   - Pet: Represents pets with storeId and type attributes

2. **Actions**:
   - get /stores/{storeid}/pets
   - post /stores/{storeid}/pets
   - get /stores/{storeid}/pets/{id}
   - delete /stores/{storeid}/pets/{id}

3. **Relationships**: Defines which principals can perform which actions on which resources

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