const { VerifiedPermissions } = require('@aws-sdk/client-verifiedpermissions');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

const policyStoreId = process.env.POLICY_STORE_ID;
const namespace = process.env.NAMESPACE;
const tokenType = process.env.TOKEN_TYPE;
const resourceTypePrefix = `${namespace}::`;
const resourceId = namespace;
const actionType = `${namespace}::Action`;


function getReversedRouteAndPathFragments(event) {
    console.log(event);
    let routeUrl = (event.domainName + event.requestContext.resourcePath).replace(/\/$/, '');
    let pathUrl = (event.domainName + event.path).replace(/\/$/, '');

    let rarr = routeUrl.split('/').slice(1).reverse();
    let parr = pathUrl.split('/').slice(1).reverse();

    console.log(rarr);
    console.log(parr);

    return {
        route: rarr,
        path: parr
    }
};
var x=0;
function getResourceFromFragments(frags) {
    console.log(x++);
    console.log(frags);
    if (/^\{.*\}$/.test(frags.route[0])) {
        return {
            entityId : frags.path[0], 
            entityType : resourceTypePrefix + frags.path[1].replace(/^./, frags.path[1][0].toUpperCase())
        }
        
    } else if (frags.route.length > 1) {
        return getResourceFromFragments({
            route: frags.route.slice(1, frags.route.length),
            path: frags.path.slice(1, frags.path.length)
        });
    }
    else {
        // Not an ID, so points to an entity type
        return { 
            entityId : 'Application',
            entityType : resourceTypePrefix + frags.path[0].replace(/^./, frags.path[0][0].toUpperCase())
        }
    }
}
function getResourceFromRequest(event) {
    
    let frags = getReversedRouteAndPathFragments(event);
    return getResourceFromFragments(frags);
};

async function getEntitiesForAuthzRequest(resource, action) {

    switch(action) {

        case "get /stores/{storeid}/pets/{id}": 
        case "delete /stores/{storeid}/pets/{id}": 
        
            var dbRecord = await ddbDocClient.send(
                new ScanCommand({
                TableName: tableName,
                FilterExpression: "petId = :petId",
                ExpressionAttributeValues: {
                        ":petId": Number(resource.entityId)
                    }
                })
            );
            console.log(dbRecord);
            var pet = dbRecord.Items[0];
            var attributes = {};
            for (const [key, value] of Object.entries(pet)) {
                if (key !== "petId") {
                    attributes[key] = {string: String(value)}
                }
            }
            return [
                    {
                    
                        "identifier": resource,
                        "attributes": attributes,
                        "parents": []
                    }
              ];
        case "get /stores/{storeid}/pets":
        case "post /stores/{storeid}/pets":
            return [
                {
                
                    "identifier": resource,
                    "attributes": {
                        storeId: {
                            "string": String(resource.entityId) 
                        }                        
                    },
                    "parents": []
                }
          ];
        default: 
            return []
    }

}

const verifiedpermissions = !!process.env.ENDPOINT
  ? new VerifiedPermissions({
    endpoint: `https://${process.env.ENDPOINT}ford.${process.env.AWS_REGION}.amazonaws.com`,
  })
  : new VerifiedPermissions();


async function handler(event, context) {
  let bearerToken =
    event.headers?.Authorization || event.headers?.authorization;
  if (bearerToken?.toLowerCase().startsWith('bearer ')) {
    // per https://www.rfc-editor.org/rfc/rfc6750#section-2.1 "Authorization" header should contain:
    //  "Bearer" 1*SP b64token
    // however, match behavior of COGNITO_USER_POOLS authorizer allowing "Bearer" to be optional
    bearerToken = bearerToken.split(' ')[1];
  }
  try {
    const parsedToken = JSON.parse(Buffer.from(bearerToken.split('.')[1], 'base64').toString());
    const actionId = `${event.requestContext.httpMethod.toLowerCase()} ${event.requestContext.resourcePath}`;
    const resource = getResourceFromRequest(event);
    const entities = await getEntitiesForAuthzRequest(resource, actionId);

      /*
          Authorization Request 
          
            {
              "identityToken": "eyJraWQiOiJlcmxPOEx0YVBHY3dyeFYzdmlEQVpqazdCZ0Z2V2o5a1FCOEJaRVZuYXhzPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiZk02d2lteXZUdHhEMXlwTHY0ZmNfZyIsInN1YiI6IjE0Nzg0NGQ4LWEwMDEtNzA2Ny1kMGQ2LWMwMjNlNjMzYTU4MiIsImNvZ25pdG86Z3JvdXBzIjpbIm1hbmFnZXIiXSwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX0hwOENROXVzciIsImN1c3RvbTpTdG9yZU1hbmFnZXIiOiIxIiwiY29nbml0bzp1c2VybmFtZSI6ImFiaGkiLCJvcmlnaW5fanRpIjoiYWQzMmQxN2ItMThjZS00MjQyLWE4MzgtNjU3OTI1MzcyZDgzIiwiYXVkIjoiMjlkYmQ3cGNzaDdhdGk3OGJpZGVlZG9jbTgiLCJldmVudF9pZCI6IjM3Yjg3YjQ4LWRlNmEtNDVlYS04ODc5LWM2NWNjNTczMzJkMSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzQ2MTA2NjQ1LCJleHAiOjE3NDYxOTMwNDUsImlhdCI6MTc0NjEwNjY0NSwianRpIjoiMDE0ZmY4Y2QtNmNjNi00MTY4LTg5ZjQtNWQyOGU5YTE1MWUxIiwiZW1haWwiOiJhYmhpQGFiYy5jb20ifQ.i8ZwssqZhU0QRtJto_OLX0jK3Kh-JJ3prEser0L-93_4GuwHqbr9aK398MJWtDgHQCZxxwQiY30JOy31YTdxCnuN-gZeW49C2yZ1sRrWee7Z_DLwmq6cS0HIlZhd_de5xOi-Ml_T71gY2lT4tcs5wfjjBXfPtz9USHp60gfvWvnr5pjIwVxoD8fB404-8vPXEpTfch93Jzd474n4hUXqLxNm0GSv7NlHL6dkQUW-RSSj1qnm2J-hMddOemn7c_Z3pXlJSLMNPCmwtokVOpXXKxLTDcRAAhTi1KNwrBlTg7hMsipR81eHTr-ePZfH_9-SpqLSOsU5tvdZJ8-TkBpdjw",
              "policyStoreId": "VV6qLuxE5kZGrHSxomzxNh",
              "action": {
                  "actionType": "PetStoreApi::Action",
                  "actionId": "get /stores/{storeid}/pets/{id}"
              },
              "resource": {
                  "entityId": "22",
                  "entityType": "PetStoreApi::Pets"
              },
              "entities": {
                  "entityList": [
                      {
                          "identifier": {
                              "entityId": "22",
                              "entityType": "PetStoreApi::Pets"
                          },
                          "attributes": {
                              "storeId": {
                                  "string": "2"
                              },
                              "price": {
                                  "string": "99.99"
                              },
                              "type": {
                                  "string": "fish"
                              }
                          },
                          "parents": []
                      }
                  ]
              }
          }
    */

    const input = {
      [tokenType]: bearerToken,
      policyStoreId: policyStoreId,
      action: {
        actionType: actionType,
        actionId: actionId,
      },
      resource: resource,
      entities: {
        entityList: entities
      }
     
    };
    console.log (JSON.stringify(input));
    const authResponse = await verifiedpermissions.isAuthorizedWithToken(input);
    console.log('Decision from AVP:', authResponse.decision);
    let principalId = `${parsedToken.iss.split('/')[3]}|${parsedToken.sub}`;
    if (authResponse.principal) {
      const principalEidObj = authResponse.principal;
      principalId = `${principalEidObj.entityType}::"${principalEidObj.entityId}"`;
    }

    return {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: authResponse.decision.toUpperCase() === 'ALLOW' ? 'Allow' : 'Deny',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        actionId,
      }
    }
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
    }
  }
}

module.exports = {
  handler,
};