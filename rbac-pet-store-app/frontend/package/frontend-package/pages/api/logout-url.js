export default function handler(req, res) {
    const logout_url = `${process.env.COGNITO_TENANT_URL}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${process.env.NEXTAUTH_URL}`;
    res.status(200).json({ logout_url });
}