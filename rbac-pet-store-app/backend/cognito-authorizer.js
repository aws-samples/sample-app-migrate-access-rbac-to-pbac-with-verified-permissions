const { CognitoIdentityClient } = require('@aws-sdk/client-cognito-identity');
const { fromCognitoIdentityToken } = require('@aws-sdk/credential-provider-cognito-identity');

async function handler(event, context) {
  let bearerToken =
    event.headers?.Authorization || event.headers?.authorization;
  if (bearerToken?.toLowerCase().startsWith('bearer ')) {
    bearerToken = bearerToken.split(' ')[1];
  }
  
  try {
    // Parse the JWT token to get user information
    const parsedToken = JSON.parse(Buffer.from(bearerToken.split('.')[1], 'base64').toString());
    const userGroups = parsedToken['cognito:groups'] || [];
    
    // Get the action being performed
    const actionId = `${event.requestContext.httpMethod.toLowerCase()} ${event.requestContext.resourcePath}`;
    
    // Determine if user has permission based on their group
    let isAllowed = false;
    
    // Manager group has full access
    if (userGroups.includes('manager')) {
      isAllowed = true;
    } 
    // Customer group has read-only access
    else if (userGroups.includes('customer')) {
      isAllowed = actionId.startsWith('get ');
    }
    
    // Generate policy document
    const principalId = `${parsedToken.iss.split('/')[3]}|${parsedToken.sub}`;
    return {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: isAllowed ? 'Allow' : 'Deny',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        actionId,
      }
    };
  } catch (e) {
    console.log('Error: ', e);
    return {
      principalId: '',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn
          }
        ]
      },
      context: {}
    };
  }
}

module.exports = {
  handler,
};