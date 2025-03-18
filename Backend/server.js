const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
const path = require('path'); 

dotenv.config();
connectDB();

const app = express();

// Add debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

// Update CORS configuration with proper regex support
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5001',
    'https://comp-4537-ai-project.vercel.app',
    'https://comp-4537-ai-project-is762rbna-nikos-projects-15b619de.vercel.app',
    'https://dolphin-app-q5wzw.ondigitalocean.app',
  ];

// Define regex patterns separately
const allowedPatterns = [
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches any regex pattern
    const matchesPattern = allowedPatterns.some(pattern => pattern.test(origin));
    if (matchesPattern) {
      return callback(null, true);
    }
    
    console.log('Blocked by CORS:', origin);
    return callback(new Error('CORS policy violation'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API routes - these MUST come before the static middleware
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Add API routes error handling
app.all('/api/*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Static files middleware for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/build')));
  
  // Catch-all route - only for GET requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});