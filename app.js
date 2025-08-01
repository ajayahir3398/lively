const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const app = express();
const db = require("./models");

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lively API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true
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

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customer", require("./routes/customer.routes"));

module.exports = app;
