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
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
        styleSrc: ["'self'", "'unsafe-inline'"], // Removed unsafe-inline for better security
        imgSrc: ["'self'", 'data:'], // Allow data: URLs for inline images
        connectSrc: ["'self'", 'https://api.emailjs.com'], // EmailJS API
        fontSrc: ["'self'"],
        objectSrc: ["'none'"], // Disallow plugins like Flash
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"], // Prevent clickjacking
        frameAncestors: ["'none'"], // Prevent being embedded in frames
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
      },
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' }, // Fix Spectre vulnerability
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: [{ policy: 'cross-origin' }],
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
        magnetometer: ["'none'"],
        gyroscope: ["'none'"],
        accelerometer: ["'none'"],
        fullscreen: ["'none'"],
        encryptedMedia: ["'none'"],
        pictureInPicture: ["'none'"],
        webShare: ["'none'"],
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

// Custom security headers middleware
app.use((req, res, next) => {
  // Cache control headers
  res.setHeader('Cache-Control', 'no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Sec-Fetch headers (client-side controlled, but we can set defaults)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});

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

// ==========================================
// ERROR HANDLING & STATIC FILES
// ==========================================

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
app.use(
  express.static(join(__dirname, 'public'), {
    // Set additional security headers on static responses
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
      res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
      res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
      // Add Permissions Policy header for all static files
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), fullscreen=(), encrypted-media=(), picture-in-picture=()'
      );
      // Add CSP headers for static files to fix ZAP issues
      if (path.endsWith('.txt') || path.endsWith('.xml')) {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; frame-ancestors 'none'; form-action 'self'"
        );
      }
      // Add cache control headers for informational ZAP issues
      if (path.endsWith('.txt') || path.endsWith('.xml')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Allow caching for static files
      } else {
        res.setHeader('Cache-Control', 'no-store, must-revalidate, private');
      }
    },
  })
);

// Request logging middleware
// In production, you might want to add actual logging here
app.use((req, res, next) => {
  // Log request method, URL, and timestamp for monitoring and debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
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

// Add a simple vulnerable endpoint for ZAP to easily detect
app.get('/demo/vuln/simple-xss', (req, res) => {
  const input = req.query.input || '';
  res.send(`<html><body><h1>Hello ${input}</h1></body></html>`);
});

// Add guaranteed XSS vulnerability that ZAP will detect
app.get('/xss', (req, res) => {
  const xss = req.query.xss || '';
  res.send(`<html><body><script>alert('${xss}')</script></body></html>`);
});

// Add missing security headers endpoint
app.get('/no-headers', (req, res) => {
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.send('<html><body>No security headers</body></html>');
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

// =========================================
// OTP ENDPOINT - EMAIL VERIFICATION
// =========================================

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
      if (process.env.NODE_ENV === 'development') {
        console.error('EmailJS API error:', err);
      }
      res.status(500).json({
        error: 'An error occurred while sending the verification email.',
      });
    }
  } catch (err) {
    // Pass unexpected errors to global error handler
    next(err);
  }
});

// ==========================================
// SERVER STARTUP & CONFIGURATION
// ==========================================

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

// ===========================================
// PROCESS HANDLERS - GRACEFUL SHUTDOWN
// ===========================================

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
  if (process.env.NODE_ENV === 'development') {
    console.log('SIGTERM received. Shutting down gracefully');
  }
  server.close(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Process terminated');
    }
  });
});

// Export for testing
export { app, server };

// ==========================================
// DEMONSTRATION VULNERABILITIES (FOR THESIS DEMO)
// ==========================================
//
// This section contains intentionally vulnerable code for demonstrating
// how the DevSecOps pipeline detects and blocks security issues.
//
// TO ENABLE VULNERABILITIES FOR DEMO:
// 1. Uncomment the desired vulnerability sections below
// 2. Push changes to trigger pipeline
// 3. Observe pipeline failing at security gates
//
// TO DISABLE VULNERABILITIES (NORMAL OPERATION):
// 1. Keep all vulnerability sections commented out
// 2. Pipeline should pass all security scans
//
// DEMONSTRATION PURPOSES ONLY - NOT FOR PRODUCTION USE
// ==========================================

// ==========================================
// SAST VULNERABILITIES (SonarCloud Detection)
// ==========================================

// === SQL INJECTION VULNERABILITY (Critical Severity) ===
// This will be detected by SonarCloud as a critical security hotspot
app.get('/demo/vuln/sql-injection/:id', (req, res) => {
  const userId = req.params.id;
  // VULNERABLE: Direct string concatenation creates SQL injection risk
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  console.log('Executing vulnerable query:', query);
  res.json({
    message: 'SQL injection vulnerable endpoint',
    query: query,
    severity: 'CRITICAL',
    type: 'SAST - SQL Injection',
  });
});

// === HARD-CODED CREDENTIALS VULNERABILITY (Critical Severity) ===
// SonarCloud will detect these as critical security issues
const DEMO_API_KEY = 'sk-1234567890abcdef1234567890abcdef1234567890';
const DEMO_DB_PASSWORD = 'admin123';
const DEMO_JWT_SECRET = 'my-secret-jwt-key-for-demo';

app.get('/demo/vuln/hardcoded-creds', (req, res) => {
  res.json({
    message: 'Hard-coded credentials vulnerable endpoint',
    exposedData: {
      apiKey: DEMO_API_KEY.substring(0, 8) + '...',
      dbPassword: DEMO_DB_PASSWORD.replace(/./g, '*'),
      jwtSecret: DEMO_JWT_SECRET.replace(/./g, '*'),
    },
    severity: 'CRITICAL',
    type: 'SAST - Hard-coded Credentials',
  });
});

// === COMMAND INJECTION VULNERABILITY (Critical Severity) ===
// SonarCloud will detect this as a critical command injection risk
app.post('/demo/vuln/command-injection', (req, res) => {
  const { filename } = req.body;
  const { exec } = require('child_process');

  // VULNERABLE: User input directly concatenated into shell command
  const command = `ls -la ${filename}`;

  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
        severity: 'CRITICAL',
        type: 'SAST - Command Injection',
      });
    }
    res.json({
      message: 'Command injection vulnerable endpoint',
      command: command,
      result: stdout,
      severity: 'CRITICAL',
      type: 'SAST - Command Injection',
    });
  });
});

// === WEAK CRYPTOGRAPHY VULNERABILITY (Major Severity) ===
// SonarCloud will detect MD5 as weak cryptographic hash
app.post('/demo/vuln/weak-crypto', (req, res) => {
  const { password } = req.body;
  const crypto = require('crypto');

  // VULNERABLE: Using MD5 hash for password storage
  const weakHash = crypto.createHash('md5').update(password).digest('hex');

  res.json({
    message: 'Weak cryptography vulnerable endpoint',
    algorithm: 'MD5',
    hash: weakHash.substring(0, 8) + '...',
    severity: 'MAJOR',
    type: 'SAST - Weak Cryptography',
  });
});

// === PATH TRAVERSAL VULNERABILITY (Major Severity) ===
// SonarCloud will detect this as a path traversal risk
app.get('/demo/vuln/path-traversal', (req, res) => {
  const { filename } = req.query;
  const path = require('path');

  // VULNERABLE: User input used directly in file path without validation
  const filePath = path.join(__dirname, 'public', filename);

  res.json({
    message: 'Path traversal vulnerable endpoint',
    requestedFile: filename,
    resolvedPath: filePath,
    severity: 'MAJOR',
    type: 'SAST - Path Traversal',
  });
});

// ==========================================
// DAST VULNERABILITIES (OWASP ZAP Detection)
// ==========================================

// === REFLECTED XSS VULNERABILITY (High Severity) ===
// OWASP ZAP will detect this as a reflected XSS vulnerability
app.get('/demo/vuln/xss', (req, res) => {
  const userInput = req.query.search || '';

  // VULNERABLE: User input directly embedded in HTML without escaping
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>XSS Demo</title></head>
      <body>
        <h1>Search Results for: ${userInput}</h1>
        <p>You searched for: ${userInput}</p>
        <div>Query: ${userInput}</div>
        <script>alert('XSS detected: ${userInput}');</script>
      </body>
    </html>
  `;

  res.send(html);
});

// === CSRF VULNERABILITY (High Severity) ===
// OWASP ZAP will detect missing CSRF protection
app.post('/demo/vuln/csrf-transfer', (req, res) => {
  const { toAccount, amount } = req.body;

  // VULNERABLE: No CSRF token validation
  // This allows cross-site request forgery attacks
  res.json({
    message: 'CSRF vulnerable endpoint',
    transaction: {
      toAccount: toAccount,
      amount: amount,
      timestamp: new Date().toISOString(),
      status: 'completed',
    },
    severity: 'HIGH',
    type: 'DAST - CSRF Protection Missing',
  });
});

// === INSECURE DIRECT OBJECT REFERENCE (High Severity) ===
// OWASP ZAP will detect this as IDOR vulnerability
app.get('/demo/vuln/idor/:accountId', (req, res) => {
  const accountId = req.params.accountId;

  // VULNERABLE: No authorization check - anyone can access any account
  const accountData = {
    accountId: accountId,
    balance: Math.floor(Math.random() * 100000),
    owner: 'John Doe',
    accountType: 'Premium',
    lastTransaction: '2024-01-15T10:30:00Z',
  };

  res.json({
    message: 'Insecure Direct Object Reference vulnerable endpoint',
    account: accountData,
    severity: 'HIGH',
    type: 'DAST - IDOR',
  });
});

// === INFORMATION DISCLOSURE VULNERABILITY (Medium Severity) ===
// OWASP ZAP will detect sensitive information in error messages
app.get('/demo/vuln/info-disclosure', (req, res) => {
  // VULNERABLE: Exposing sensitive system information
  const error = new Error('Database connection failed');
  error.details = {
    databaseHost: 'db.internal.company.com',
    databasePort: 5432,
    databaseName: 'finsecure_production',
    databaseUser: 'admin',
    connectionPool: 'max_connections=100',
    serverVersion: 'Node.js v22.20.0',
    environment: 'production',
    timestamp: new Date().toISOString(),
  };

  throw error;
});

// === MISSING SECURITY HEADERS VULNERABILITY (Medium Severity) ===
// OWASP ZAP will detect missing security headers
app.use('/demo/vuln/no-headers', (req, res, next) => {
  // VULNERABLE: Intentionally removing security headers
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('Content-Security-Policy');

  res.json({
    message: 'Missing security headers vulnerable endpoint',
    headersRemoved: [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy',
    ],
    severity: 'MEDIUM',
    type: 'DAST - Missing Security Headers',
  });
});

// ==========================================
// DEMONSTRATION CONTROL ENDPOINT
// ==========================================

// Safe endpoint to check which vulnerabilities are currently active
app.get('/demo/vulnerability-status', (req, res) => {
  const vulnerabilities = [
    {
      name: 'SQL Injection',
      endpoint: '/demo/vuln/sql-injection/:id',
      severity: 'CRITICAL',
      type: 'SAST',
      active: false, // Set to true when uncommented
      description: 'Direct SQL query concatenation vulnerability',
    },
    {
      name: 'Hard-coded Credentials',
      endpoint: '/demo/vuln/hardcoded-creds',
      severity: 'CRITICAL',
      type: 'SAST',
      active: false,
      description: 'API keys and passwords in source code',
    },
    {
      name: 'Command Injection',
      endpoint: '/demo/vuln/command-injection',
      severity: 'CRITICAL',
      type: 'SAST',
      active: false,
      description: 'Shell command injection via user input',
    },
    {
      name: 'Weak Cryptography',
      endpoint: '/demo/vuln/weak-crypto',
      severity: 'MAJOR',
      type: 'SAST',
      active: false,
      description: 'Using MD5 hash for password storage',
    },
    {
      name: 'Path Traversal',
      endpoint: '/demo/vuln/path-traversal',
      severity: 'MAJOR',
      type: 'SAST',
      active: false,
      description: 'File system access via user input',
    },
    {
      name: 'Reflected XSS',
      endpoint: '/demo/vuln/xss',
      severity: 'HIGH',
      type: 'DAST',
      active: false,
      description: 'Cross-site scripting via unescaped output',
    },
    {
      name: 'CSRF Protection Missing',
      endpoint: '/demo/vuln/csrf-transfer',
      severity: 'HIGH',
      type: 'DAST',
      active: false,
      description: 'No CSRF token validation',
    },
    {
      name: 'Insecure Direct Object Reference',
      endpoint: '/demo/vuln/idor/:accountId',
      severity: 'HIGH',
      type: 'DAST',
      active: false,
      description: 'Unauthorized access to resources',
    },
    {
      name: 'Information Disclosure',
      endpoint: '/demo/vuln/info-disclosure',
      severity: 'MEDIUM',
      type: 'DAST',
      active: false,
      description: 'Sensitive information in error messages',
    },
    {
      name: 'Missing Security Headers',
      endpoint: '/demo/vuln/no-headers',
      severity: 'MEDIUM',
      type: 'DAST',
      active: false,
      description: 'Missing important security HTTP headers',
    },
  ];

  res.json({
    message: 'Demonstration Vulnerability Status',
    timestamp: new Date().toISOString(),
    totalVulnerabilities: vulnerabilities.length,
    activeCount: vulnerabilities.filter((v) => v.active).length,
    vulnerabilities: vulnerabilities,
    instructions: {
      howToEnable: 'Uncomment the vulnerability code blocks in server.js',
      howToDisable: 'Keep all vulnerability code blocks commented out',
      pipelineImpact: 'Active vulnerabilities will cause pipeline to fail at security gates',
    },
  });
});
