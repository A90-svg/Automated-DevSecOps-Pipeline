import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Joi from 'joi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename) || process.cwd();

const app = express();
const httpServer = createServer(app);

export { app };

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://api.emailjs.com'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request validation middleware
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, _next) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Serve static files with security headers
app.use(
  express.static(join(__dirname, 'public'), {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    },
  })
);

// Request logging
app.use((req, res, next) => {
  next();
});

// ============================================
// HEALTH ENDPOINT 
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'FinSecure Demo App',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
  fromEmail: process.env.EMAILJS_FROM_EMAIL || 'noreply@finsecure.demo',
};

// Validate EmailJS configuration
const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.privateKey
  );
};

// Request validation schema
const otpSchema = Joi.object({
  to: Joi.string().email().required(),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

app.post('/api/send-otp', validateRequest(otpSchema), async (req, res, next) => {
  try {
    const { to, code } = req.body;

    // For demo purposes, if EmailJS is not configured, simulate success
    if (!isEmailJSConfigured()) {
      return res.json({
        success: true,
        message: 'Verification code sent successfully (demo mode)',
      });
    }

    try {
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
          app_name: 'FinSecure',
        },
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        return res.status(500).json({
          error: 'Failed to send verification email. Please try again later.',
        });
      }

      res.json({
        success: true,
        message: 'Verification code sent successfully',
      });
    } catch (err) {
      res.status(500).json({
        error: 'An error occurred while sending the verification email.',
      });
    }
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;
// CRITICAL: Bind to 0.0.0.0 for Docker compatibility
app.use(errorHandler);

const server = httpServer.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`App: http://localhost:${PORT}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Rejection:', err);
  }
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Uncaught Exception:', err);
  }
  server.close(() => process.exit(1));
});

// Handle process termination
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
if (process.env.NODE_ENV === 'test') {
  module.exports = { app, server };
}
