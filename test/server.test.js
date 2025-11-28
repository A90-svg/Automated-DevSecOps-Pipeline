import request from 'supertest';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the server import
jest.unstable_mockModule('../server.js', () => ({
  default: {
    listen: jest.fn((port, callback) => callback()),
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn()
  }
}));

const { app } = await import('../server.js');

describe('Server', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  it('should serve index.html for root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });
});
