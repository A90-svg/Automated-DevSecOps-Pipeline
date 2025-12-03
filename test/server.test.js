/**
 * FinSecure Server Test Suite
 * ===========================
 *
 * This test suite validates the core functionality of the FinSecure backend server.
 * Tests cover:
 * - Health check endpoint
 * - Static file serving
 * - OTP email endpoint
 * - Error handling
 *
 * Test Framework: Jest with Supertest
 * Environment: Node.js test environment
 */

import request from 'supertest';
import { jest } from '@jest/globals';

// Import the actual app for testing
// Using dynamic import to handle ES modules
const { app } = await import('../server.js');

describe('Server Health Checks', () => {
  /**
   * Test health check endpoint
   * Should return 200 status with service information
   */
  it('should return 200 for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'FinSecure Demo App');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  /**
   * Test root route serves index.html
   * Should return 200 status with HTML content type
   */
  it('should serve index.html for root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });
});

describe('OTP Endpoint', () => {
  /**
   * Test OTP endpoint with valid data
   * Should accept valid email and 6-digit code
   */
  it('should handle OTP endpoint with valid data', async () => {
    const response = await request(app).post('/api/send-otp').send({
      to: 'finsecureapp@gmail.com',
      code: '123456',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  /**
   * Test OTP endpoint with invalid data
   * Should reject invalid email and non-6-digit code
   */
  it('should reject OTP endpoint with invalid data', async () => {
    const response = await request(app).post('/api/send-otp').send({
      to: 'invalid-email',
      code: '123',
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('Error Handling', () => {
  /**
   * Test 404 handling for unknown routes
   * Should return 404 status for non-existent routes
   */
  it('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.statusCode).toBe(404);
  });
});
