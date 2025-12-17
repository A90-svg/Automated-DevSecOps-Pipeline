/**
 * FinSecure Demo Application - Backend Server
 * =====================================
 *
 * This is a Node.js Express server for a demo fintech application.
 * It provides:
 * - Static file serving for the SPA frontend
 * - Security middleware (Helmet, CORS, rate limiting)
 * - OTP email sending via EmailJS integration
 * - Health check endpoint for Docker/pipeline monitoring
 * - Request validation with Joi schemas
 *
 * SECURITY NOTES:
 * - Uses Helmet for security headers (CSP, XSS protection, etc.)
 * - Rate limits requests to prevent abuse
 * - Validates all incoming requests
 * - No sensitive data logged in production
 *
 * ENVIRONMENT VARIABLES:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment (development/production/test)
 * - EMAILJS_*: Email service configuration
 * - ALLOWED_ORIGINS: CORS allowed origins
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Joi from 'joi';

// Load environment variables from .env file
dotenv.config();

// Get current directory path for ES modules (needed for __dirname equivalent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename) || process.cwd();

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// ==========================================
// SECURITY MIDDLEWARE CONFIGURATION
// ==========================================

// Helmet: Set security-related HTTP headers
// Protects against XSS, clickjacking, MIME sniffing, etc.
app.use(
  helmet({
    contentSecurityPolicy: {
      // Content Security Policy to prevent XSS attacks
      // Only allows resources from same origin and EmailJS API
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Inline styles needed for SPA
        imgSrc: ["'self'", 'data:'], // Allow data: URLs for inline images
        connectSrc: ["'self'", 'https://api.emailjs.com'], // EmailJS API
        fontSrc: ["'self'"],
        objectSrc: ["'none'"], // Disallow plugins like Flash
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"], // Prevent clickjacking
        frameAncestors: ["'none'"], // Prevent being embedded in frames
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  })
);
// CORS: Cross-Origin Resource Sharing configuration
// Allows frontend to communicate with backend from different origins
// In production, restrict to specific origins via ALLOWED_ORIGINS env var
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 200,
  })
);

// ===========================================
// RATE LIMITING & REQUEST PARSING
// ===========================================

// Rate limiting: Prevent brute force and DoS attacks
// Limits each IP to 1000 requests per 15-minute window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Body parsing middleware: Parse incoming request bodies
// Limit payload size to prevent large payload attacks
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies

// ============================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================

// Validation middleware factory using Joi schemas
// Validates request bodies against defined schemas
// Returns 400 Bad Request with detailed error message if validation fails
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message, // Return first validation error
    });
  }
  next(); // Continue to next middleware if validation passes
};

// ============================================
// ERROR HANDLING & STATIC FILES
// ============================================

// Global error handling middleware
// Catches all errors that occur in the application
// In development, includes stack trace for debugging
const errorHandler = (err, req, res, _next) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    // Only include stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Serve static files from public directory with security headers
// This serves the SPA frontend (HTML, CSS, JS, images)
app.use(
  express.static(join(__dirname, 'public'), {
    // Set additional security headers on static responses
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
      res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
      res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
    },
  })
);

// Request logging middleware (placeholder)
// In production, you might want to add actual logging here
app.use((req, res, next) => {
  // TODO: Add request logging for monitoring and debugging
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
//
// This endpoint is used by:
// - Docker health checks
// - Kubernetes readiness/liveness probes
// - GitHub Actions pipeline monitoring
// - Load balancers and monitoring systems
//
// Returns service status and basic metrics
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy', // Service health status
    service: 'FinSecure Demo App', // Service name
    timestamp: new Date().toISOString(), // Current timestamp
    uptime: process.uptime(), // Process uptime in seconds
    environment: process.env.NODE_ENV || 'development', // Environment
  });
});

// ============================================
// FRONTEND ROUTE HANDLING
// ============================================

// Serve index.html for root route (SPA entry point)
// This ensures all client-side routing works properly
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ============================================
// EMAILJS CONFIGURATION
// ============================================
//
// EmailJS is used to send OTP emails without exposing SMTP credentials
// Configuration is loaded from environment variables for security
const EMAILJS_CONFIG = {
  serviceId: process.env.EMAILJS_SERVICE_ID, // EmailJS service ID
  templateId: process.env.EMAILJS_TEMPLATE_ID, // Email template ID
  publicKey: process.env.EMAILJS_PUBLIC_KEY, // Public API key
  privateKey: process.env.EMAILJS_PRIVATE_KEY, // Private API key
  fromEmail: process.env.EMAILJS_FROM_EMAIL || 'finsecureapp@gmail.com', // Default sender
};

// Helper function to check if EmailJS is properly configured
// Returns true if all required credentials are present
const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.privateKey
  );
};

// ============================================
// OTP ENDPOINT - EMAIL VERIFICATION
// ============================================

// Joi schema for OTP request validation
// Ensures email is valid and code is exactly 6 digits
const otpSchema = Joi.object({
  to: Joi.string().email().required(), // Must be a valid email
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(), // Must be exactly 6 digits
});

/**
 * POST /api/send-otp
 * Sends a 6-digit OTP code to the specified email
 *
 * Request body:
 * {
 *   "to": "user@example.com",
 *   "code": "123456"
 * }
 *
 * Response:
 * { "success": true, "message": "Verification code sent successfully" }
 */
app.post('/api/send-otp', validateRequest(otpSchema), async (req, res, next) => {
  try {
    const { to, code } = req.body; // Extract email and OTP code from request

    // For demo purposes: if EmailJS is not configured, simulate success
    // This allows the app to work in development without email setup
    if (!isEmailJSConfigured()) {
      return res.json({
        success: true,
        message: 'Verification code sent successfully (demo mode)',
      });
    }

    try {
      // Prepare EmailJS payload with OTP code
      const emailPayload = {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        accessToken: EMAILJS_CONFIG.privateKey,
        template_params: {
          to_email: to,
          otp_code: code,
          subject: 'Your FinSecure Verification Code',
          from_email: EMAILJS_CONFIG.fromEmail,
          app_name: 'FinSecure', // Application name for email template
        },
      };

      // Send email via EmailJS API
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      // Check if email was sent successfully
      if (!response.ok) {
        return res.status(500).json({
          error: 'Failed to send verification email. Please try again later.',
        });
      }

      // Return success response
      res.json({
        success: true,
        message: 'Verification code sent successfully',
      });
    } catch (err) {
      // Handle EmailJS API errors
      res.status(500).json({
        error: 'An error occurred while sending the verification email.',
      });
    }
  } catch (err) {
    // Pass unexpected errors to global error handler
    next(err);
  }
});

// ============================================
// SERVER STARTUP & CONFIGURATION
// ============================================

// Get port from environment or use default 3000
const PORT = process.env.PORT || 3000;

// Apply global error handling middleware (must be after all routes)
app.use(errorHandler);

// Start the HTTP server
// CRITICAL: Bind to 0.0.0.0 for Docker compatibility
// This allows the server to accept connections from outside the container
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  // Always log startup messages for visibility
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`App: http://localhost:${PORT}`);
});

// ============================================
// PROCESS HANDLERS - GRACEFUL SHUTDOWN
// ============================================

// Handle unhandled promise rejections
// Prevents the application from hanging on unhandled promises
process.on('unhandledRejection', (err) => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Rejection:', err);
  }
  // Close server and exit with error code
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
// Prevents the application from continuing in an unstable state
process.on('uncaughtException', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Uncaught Exception:', err);
  }
  // Close server and exit with error code
  server.close(() => process.exit(1));
});

// Handle process termination (SIGTERM)
// Ensures graceful shutdown when container orchestrator sends SIGTERM
process.on('SIGTERM', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('SIGTERM received. Shutting down gracefully');
  }
  server.close(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Process terminated');
    }
  });
});

// Export for testing
export { app, server };
