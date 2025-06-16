# PBAC Pet Store Frontend

This directory contains the frontend implementation for the PBAC Pet Store application, built with Next.js and deployed as a Lambda function.

## Overview

The frontend provides a web interface for the Pet Store application, allowing users to authenticate and interact with the pet store API based on their permissions. It's packaged and deployed as a serverless application using AWS SAM.

## AWS Resources Created

The `template.yaml` file defines the following AWS resources:

1. **AVPCognitoFunction (AWS::Serverless::Function)**
   - Lambda function that hosts the Next.js application
   - Memory: 256MB
   - Runtime: nodejs20.x
   - Handler: run.sh
   - Uses the Lambda Web Adapter layer for serving HTTP requests
   - Environment variables for configuration:
     - NextAuth settings
     - Cognito integration parameters
     - API endpoint URLs

2. **API Gateway HTTP API**
   - Created implicitly by the SAM template
   - Routes all HTTP requests to the Lambda function:
     - Root path (/) for the main application
     - Proxy path (/{proxy+}) for all other routes

## Frontend Package Structure

The `frontend-package` directory contains a Next.js application with the following key components:

- **components/**: React components
  - `StoreSelector.jsx`: Component for selecting pet stores
  - `passkey-btn.jsx`: Component for passkey authentication

- **pages/**: Next.js page components
  - `index.js`: Main application page
  - `_app.jsx`: Next.js application wrapper
  - `api/`: API routes for authentication and data fetching
  - `logout/`: Logout functionality
  - `passkey/`: Passkey authentication support

- **public/**: Static assets (images, icons)

- **styles/**: CSS stylesheets

- **server.js**: Custom Next.js server configuration

- **run.sh**: Entry point script for the Lambda function

## Deployment

The frontend is packaged and deployed as part of the main application deployment process. The `Makefile` in this directory is used by SAM to build the application.

## Outputs

The CloudFormation template provides the following outputs:

- **PetStoreWebAppURL**: URL of the deployed web application
- **CognitoCallbackURL**: URL for Cognito authentication callbacks
- **WebAppFunctionARN**: ARN of the Lambda function hosting the application