import request from 'supertest';
import { jest } from '@jest/globals';

// Import the actual app for testing
const { app } = await import('../server.js');

describe('Server', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'FinSecure Demo App');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should serve index.html for root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });

  it('should handle OTP endpoint with valid data', async () => {
    const response = await request(app)
      .post('/api/send-otp')
      .send({
        to: 'finsecureapp@gmail.com',
        code: '123456'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  it('should reject OTP endpoint with invalid data', async () => {
    const response = await request(app)
      .post('/api/send-otp')
      .send({
        to: 'invalid-email',
        code: '123'
      });
    expect(response.statusCode).toBe(400);
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.statusCode).toBe(404);
  });
});
