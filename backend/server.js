const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { securityHeaders, apiLimiter, mongoSanitize, xss, hpp, sanitizeInput } = require('./middleware/security');
const { logger, errorLogger } = require('./middleware/logger');

dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables.');
  console.warn('⚠️  Using default secret. This is INSECURE for production!');
  console.warn('⚠️  Please create a .env file with JWT_SECRET set to a secure random string (min 32 characters).');
}

const app = express();

// Request logging
app.use(logger);

// Security headers
app.use(securityHeaders);

// Rate limiting
app.use('/api/', apiLimiter);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - MUST be before other middleware
// Permissive CORS to allow all origins (restrict in production if needed)
app.use(cors({
  origin: true, // Allow all origins - change this to specific URLs for production security
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Custom input sanitization
app.use(sanitizeInput);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jatinbhatia319:jatinbhatia319@namastenode.9ooaz.mongodb.net/user-management?appName=NamasteNode';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Health check endpoint (before other routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'User Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. This record already exists.'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      health: 'GET /api/health',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      getCurrentUser: 'GET /api/auth/me',
      logout: 'POST /api/auth/logout',
      getAllUsers: 'GET /api/users (Admin only)',
      getProfile: 'GET /api/users/profile',
      updateProfile: 'PUT /api/users/profile',
      changePassword: 'PUT /api/users/change-password',
      activateUser: 'PUT /api/users/:userId/activate (Admin only)',
      deactivateUser: 'PUT /api/users/:userId/deactivate (Admin only)'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

