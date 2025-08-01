const request = require('supertest');
const app = require('../server');

describe('POST /api/login', () => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  let userId;

  beforeEach(async () => {
    // Register a test user
    const registerResponse = await request(app)
      .post('/api/register')
      .send(userData);
    
    userId = registerResponse.body.user.id;
  });

  describe('Successful Login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: userId,
          username: userData.username.toLowerCase(),
          email: userData.email.toLowerCase(),
          role: 'user'
        })
      });

      // Check if refresh token cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('refresh_token'))).toBe(true);

      // Verify session is created in database
      const { rows } = await global.testPool.query(
        'SELECT * FROM authen.sessions WHERE user_id = $1',
        [userId]
      );
      expect(rows).toHaveLength(1);
    });

    test('should accept email in different case', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: userData.email.toUpperCase(),
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication Failures', () => {
    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject empty credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Invalid login credentials');
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: userData.password
        })
        .expect(400);

      expect(response.body.details).toContain('Valid email address is required');
    });
  });

  describe('JWT Token Validation', () => {
    test('should return valid JWT token', async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const { accessToken } = loginResponse.body;
      
      // Test protected route with token
      const profileResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.user.id).toBe(userId);
    });

    test('should reject expired token', async () => {
      // This test would require mocking JWT or waiting for expiration
      // For now, test invalid token format
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce login rate limiting', async () => {
      const attempts = [];
      
      // Make multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request(app)
            .post('/api/login')
            .send({
              email: userData.email,
              password: 'wrongpassword'
            })
        );
      }
      
      await Promise.all(attempts);

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(429);

      expect(response.body.error).toContain('Too many login attempts');
    });
  });
});
