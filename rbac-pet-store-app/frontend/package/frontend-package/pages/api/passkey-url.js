export default function handler(req, res) {
    const passkey_url = `${process.env.COGNITO_TENANT_URL}/passkeys/add?client_id=${process.env.COGNITO_CLIENT_ID}&response_type=code&scope=email%20openid%20phone&redirect_uri=${process.env.NEXTAUTH_URL}`;
    res.status(200).json({ passkey_url });

}