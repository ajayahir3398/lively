const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const app = express();
const db = require("./models");

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration optimized for React Native mobile apps
const corsOptions = {
  origin: function (origin, callback) {
    // React Native apps and mobile apps don't send origin header
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      console.log('Request from mobile app or no origin detected');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      // Development servers
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:8080',
      'http://localhost:19006', // Expo development server
      'http://localhost:19000', // Expo development server alternative
      // Production servers
      'https://lively-c70a.onrender.com',
      // Add your frontend/web domain here if you have one
    ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      // For development and testing, allow all origins
      // In production, you might want to be more restrictive
      console.log(`Unknown origin allowed: ${origin}`);
      callback(null, true);
    }
  },
  credentials: false, // Set to false for mobile apps - they don't need cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'X-HTTP-Method-Override',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Authorization',
    'Content-Length',
    'X-Requested-With'
  ]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware with larger limits for mobile uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mobile app friendly middleware
app.use((req, res, next) => {
  // Log request details for debugging mobile app issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin (mobile app)'} - User-Agent: ${req.get('user-agent')}`);
  }
  
  // Add headers that are helpful for mobile apps
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lively API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // Ensure proper CORS headers for API requests
      if (!request.headers) {
        request.headers = {};
      }
      request.headers['Access-Control-Allow-Origin'] = '*';
      return request;
    }
  }
}));

// Sync DB
db.sequelize.sync()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Database synced successfully.");
    }
  })
  .catch(err => {
    if (process.env.NODE_ENV === 'development') {
      console.error("DB Sync error:", err);
    }
  });

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lively API Server', 
    status: 'running',
    documentation: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mobile app connectivity test endpoint
app.get('/api/mobile-test', (req, res) => {
  const userAgent = req.get('user-agent') || 'Unknown';
  const origin = req.get('origin');
  const isMobileApp = !origin; // Mobile apps typically don't send origin header
  
  res.json({
    message: 'Mobile connectivity test successful',
    timestamp: new Date().toISOString(),
    requestInfo: {
      userAgent,
      origin: origin || 'No origin (likely mobile app)',
      isMobileApp,
      method: req.method,
      headers: {
        'content-type': req.get('content-type'),
        'authorization': req.get('authorization') ? 'Present' : 'Not present',
        'accept': req.get('accept')
      }
    },
    server: {
      environment: process.env.NODE_ENV || 'development',
      cors: 'enabled for mobile apps'
    }
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customer", require("./routes/customer.routes"));

module.exports = app;
