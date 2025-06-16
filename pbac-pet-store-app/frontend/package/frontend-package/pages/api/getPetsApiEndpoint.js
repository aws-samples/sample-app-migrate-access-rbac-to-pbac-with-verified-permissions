export default function handler(req, res) {
  const { storeId = "1" } = req.query;
  
  // Use the environment variable for the API base URL
  // Keep the variable name as "endpoint" for compatibility
  const endpoint = process.env.PETS_API_BASE_URL;
  
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  console.log("API endpoint: " + endpoint);
  res.status(200).json({ endpoint });
}