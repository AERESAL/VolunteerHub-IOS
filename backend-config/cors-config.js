// CORS Configuration for Mobile App Integration
// Add this to your Node.js backend server file (usually server.js or app.js)

const cors = require('cors');

// Configure CORS for mobile app support
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local web development
    'https://your-web-app.vercel.app', // Your deployed web app
    'exp://localhost:19000',           // Expo development server
    'exp://192.168.1.100:19000',      // Expo on local network (replace with your IP)
    'http://localhost:19000',          // Expo web
    'https://localhost:19000',         // Expo web HTTPS
    'exp://exp.host',                  // Expo Go app
    'https://exp.host',                // Expo Go web
    'https://expo.dev',                // Expo web interface
    // Add your deployed mobile app URLs when you build for production
    'https://your-app.expo.dev',       // Replace with your actual Expo URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Additional middleware for mobile compatibility
app.use((req, res, next) => {
  // Allow requests from Expo and React Native
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

module.exports = corsOptions;
