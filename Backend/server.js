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
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

// Update CORS configuration to accept multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5001',
  'https://dolphin-app-q5wzw.ondigitalocean.app',
  'https://comp-4537-ai-project.vercel.app',
  'https://comp-4537-ai-project-is762rbna-nikos-projects-15b619de.vercel.app',
  /.*\.vercel\.app$/

];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked by CORS:', origin);
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// API routes - these MUST come before the static middleware
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Static files middleware
app.use(express.static(path.join(__dirname, '../Frontend/build')));

// Catch-all route - only for GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});