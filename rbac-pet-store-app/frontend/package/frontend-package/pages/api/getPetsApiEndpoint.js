export default function handler(req, res) {
  // Use the environment variable for the API base URL
  const endpoint = `${process.env.PETS_API_BASE_URL}pets`;
  
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  console.log("API endpoint: " + endpoint);
  res.status(200).json({ endpoint });
}