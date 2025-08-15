const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
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

app.use(cors());

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware with larger limits for mobile uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger UI setup with forced production server
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

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customer", require("./routes/customer.routes"));
app.use("/api/activity", require("./routes/activity.routes"));
app.use("/api/attachment", require("./routes/attachment.routes"));

module.exports = app;
