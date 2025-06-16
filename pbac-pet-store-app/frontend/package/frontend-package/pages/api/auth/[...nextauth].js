import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
//import GithubProvider from "next-auth/providers/github"
//import { getToken } from "next-auth/jwt"
const jwtLib = require("aws-jwt-verify");


function decodeJwt(token) {
  var base64Payload = token.split(".")[1];
  var payloadBuffer = Buffer.from(base64Payload, "base64");
  //console.log(payloadBuffer.toString())
  return JSON.parse(payloadBuffer.toString());
}

// Using aws-jwt-verify to parse tokens (and verify again)
// Can remove
async function validateTokens(tokens, type) {
  console.log("Validating Tokens - type: ", type);

  var tokenToVerify
  var tokenPayload

  if (type == "access") {
    tokenToVerify = tokens.accessToken
  } else {
    tokenToVerify = tokens.idToken
  }

  const tokenVerifier = jwtLib.CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USERPOOL_ID,
    tokenUse: type,
    clientId: process.env.COGNITO_CLIENT_ID,
  });
  try {
    // Verify the access token
    tokenVerifier
      .verify(tokenToVerify)
      .then((tokenPayload) => {
        console.log(type, "token is valid. ", type, "Payload:", tokenPayload);
        return tokenPayload
      }) 
  }
  catch (e) {
    console.log(type, "token verification error: " + e);
    return e;
  };
}


export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      authorization: { params: { scope: 'openid profile PetStoreApi/Read' } }
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.refreshToken = account.refresh_token
        //console.log("XXXX_account: ", account)
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      session.refreshToken = token.refreshToken
      //console.log('session.accessToken: ', session.accessToken)

      // Set Session Attributes to the decoded token
      var payload = decodeJwt(token.accessToken);
      //console.log("CHECKING PAYLOAD", payload);
      //console.log("CHECKING name", payload.username);
      //console.log("CHECKING email", payload.email);
      
      var tmpToken = JSON.stringify(payload, undefined, 2)
      //console.log("CHECKING tmpToken", tmpToken);
      session.decodedAccessToken = JSON.stringify(decodeJwt(token.accessToken), undefined, 2)
      session.decodedIdToken = JSON.stringify(decodeJwt(token.idToken), undefined, 2)
      //console.log("CHECKING session.accessToken", session.accessToken);
      //console.log("CHECKING session.refreshToken", session.refreshToken);

      // Set the session user attributes
      session.user.name = payload.username
      //session.user.name = token.email // set the name to the email
      session.user.email = payload.email
      session.user.sub = payload.sub
      session.user.accessToken = payload.accessToken
      session.user.groups = payload["cognito:groups"]
      
      // Validate the tokens with aws-jwt-verify
      //const decodedAccessToken = await validateTokens(token, "access")
      //const decodedIdToken = await validateTokens(token, "id")
      
      //user.sub = token.sub
      //console.log("user.sub: ", token.)
      //console.log("session: ", session)
      // console.log("token: ", token)
      // console.log("user: ", user)

      return session
    }
  },
}

export default NextAuth(authOptions)