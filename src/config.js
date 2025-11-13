// API Configuration
// This will use the environment variable from .env file
// To update the API URL, edit the .env file in the project root

// For development, you can also manually set the ngrok URL here:
// export const API_BASE_URL = 'https://YOUR_NGROK_URL.ngrok-free.app'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://6e27294f36b1.ngrok-free.app'

// Log the current API URL for debugging
console.log('🌐 API Base URL:', API_BASE_URL)

// Note: Your ngrok URL changes on every restart. 
// Update this URL or set VITE_API_URL environment variable in Vercel dashboard.
// To set in Vercel: Settings → Environment Variables → Add VITE_API_URL

