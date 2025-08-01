const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');

// Import your server setup (modify server.js to export app)
const app = require('../server');

describe('POST /api/register', () => {
  const validUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  describe('Successful Registration', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Account created successfully',
        user: expect.objectContaining({
          id: expect.any(String),
          username: validUserData.username.toLowerCase(),
          email: validUserData.email.toLowerCase(),
          role: 'user',
          createdAt: expect.any(String)
        })
      });

      // Verify password is hashed
      const { rows } = await global.testPool.query(
        'SELECT password FROM authen.users WHERE email = $1',
        [validUserData.email.toLowerCase()]
      );
      
      expect(rows).toHaveLength(1);
      expect(rows[0].password).not.toBe(validUserData.password);
      expect(await bcrypt.compare(validUserData.password, rows[0].password)).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    test('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.details).toContain('Username, email, and password are required');
    });

    test('should reject invalid username format', async () => {
      const invalidUser = {
        ...validUserData,
        username: 'user@invalid'
      };

      const response = await request(app)
        .post('/api/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Username can only contain letters, numbers, underscores, and hyphens')
        ])
      );
    });

    test('should reject short username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ ...validUserData, username: 'ab' })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Username must be 3-30 characters long')
        ])
      );
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ ...validUserData, email: 'invalid-email' })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Valid email address is required')
        ])
      );
    });

    test('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ ...validUserData, password: 'weak' })
        .expect(400);

      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });

  describe('Duplicate User Handling', () => {
    beforeEach(async () => {
      // Create initial user
      await request(app)
        .post('/api/register')
        .send(validUserData)
        .expect(201);
    });

    test('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          ...validUserData,
          username: 'differentuser'
        })
        .expect(409);

      expect(response.body.error).toBe('Registration failed. Username or email may already be in use.');
    });

    test('should reject duplicate username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          ...validUserData,
          email: 'different@example.com'
        })
        .expect(409);

      expect(response.body.error).toBe('Registration failed. Username or email may already be in use.');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting after 5 attempts', async () => {
      const attempts = [];
      
      // Make 5 requests (should succeed)
      for (let i = 0; i < 5; i++) {
        attempts.push(
          request(app)
            .post('/api/register')
            .send({
              ...validUserData,
              email: `test${i}@example.com`,
              username: `testuser${i}`
            })
        );
      }
      
      await Promise.all(attempts);

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/register')
        .send({
          ...validUserData,
          email: 'test6@example.com',
          username: 'testuser6'
        })
        .expect(429);

      expect(response.body.error).toContain('Too many registration attempts');
    });
  });
});
