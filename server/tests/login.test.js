const request = require('supertest');
const app = require('../server');

describe('POST /api/login', () => {
    let testUser;
    let userId;

    beforeEach(async () => {
        // Create unique test user for each test
        testUser = {
            username: `loginuser_${Date.now()}`,
            email: `loginuser_${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        // Register the test user
        const registerResponse = await request(app)
            .post('/api/register')
            .send(testUser);

        expect(registerResponse.status).toBe(201);
        userId = registerResponse.body.user.id;
    });

    describe('Successful Login', () => {
        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                accessToken: expect.any(String),
                user: expect.objectContaining({
                    id: userId,
                    username: testUser.username.toLowerCase(),
                    email: testUser.email.toLowerCase(),
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
            expect(rows[0].user_id).toBe(userId);
            expect(rows[0].refresh_token).toBeDefined();
        });

        test('should accept email in different case', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email.toUpperCase(),
                    password: testUser.password
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe(testUser.email.toLowerCase());
        });

        test('should create session with user agent and IP', async () => {
            const response = await request(app)
                .post('/api/login')
                .set('User-Agent', 'Test-Agent/1.0')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            // Check session details in database
            const { rows } = await global.testPool.query(
                'SELECT user_agent, ip_address FROM authen.sessions WHERE user_id = $1',
                [userId]
            );

            expect(rows).toHaveLength(1);
            expect(rows[0].user_agent).toContain('Test-Agent');
        });
    });

    describe('Authentication Failures', () => {
        test('should reject invalid email', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                })
                .expect(401);

            expect(response.body.error).toBe('Invalid credentials');
        });

        test('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
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
                    password: testUser.password
                })
                .expect(400);

            expect(response.body.details).toContain('Valid email address is required');
        });

        test('should reject missing password', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email
                })
                .expect(400);

            expect(response.body.details).toContain('Password is required');
        });
    });

    describe('JWT Token Validation', () => {
        test('should return valid JWT token', async () => {
            const loginResponse = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(loginResponse.status).toBe(200);
            const { accessToken } = loginResponse.body;
            expect(accessToken).toBeDefined();

            // Test protected route with token
            const profileResponse = await request(app)
                .get('/api/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(profileResponse.body.success).toBe(true);
            expect(profileResponse.body.user.id).toBe(userId);
        });

        test('should reject malformed authorization header', async () => {
            const response = await request(app)
                .get('/api/profile')
                .set('Authorization', 'invalid-format')
                .expect(401);

            expect(response.body.error).toBe('Invalid token format');
        });

        test('should reject missing authorization header', async () => {
            const response = await request(app)
                .get('/api/profile')
                .expect(401);

            expect(response.body.error).toBe('Access token required');
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body.error).toBe('Invalid token');
        });

        test('should reject empty token', async () => {
            const response = await request(app)
                .get('/api/profile')
                .set('Authorization', 'Bearer ')
                .expect(401);

            expect(response.body.error).toBe('Invalid token format');
        });
    });

    // tests/login.test.js - Enhanced error handling
    describe('Multiple Sessions', () => {
        test('should allow multiple concurrent sessions', async () => {
            // เพิ่ม delay เพื่อให้ beforeEach เสร็จสิ้น
            await new Promise(resolve => setTimeout(resolve, 500));

            // First login
            const login1Response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            if (login1Response.status !== 200) {
                console.error('❌ First login failed:', login1Response.body);
                console.log('Available users in DB:');
                const users = await global.testPool.query('SELECT email, username FROM authen.users');
                console.log(users.rows);
            }

            expect(login1Response.status).toBe(200);

            // Second login (with delay)
            await new Promise(resolve => setTimeout(resolve, 200));

            const login2Response = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            if (login2Response.status !== 200) {
                console.error('❌ Second login failed:', login2Response.body);
            }

            expect(login2Response.status).toBe(200);

            // Both should have different tokens
            expect(login1Response.body.accessToken).not.toBe(login2Response.body.accessToken);

            // Both sessions should exist in database
            const { rows } = await global.testPool.query(
                'SELECT * FROM authen.sessions WHERE user_id = $1',
                [userId]
            );
            expect(rows.length).toBeGreaterThanOrEqual(2);
        }, 30000);
    });


    // tests/login.test.js - ปรับปรุง test
    describe('Rate Limiting', () => {
        test('should not count successful logins against rate limit', async () => {
            // เพิ่ม delay เพื่อให้ beforeEach เสร็จสิ้น
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log(`🧪 Testing rate limit with user: ${testUser.email}`);

            // ตรวจสอบว่า test user พร้อมใช้งาน
            const userCheck = await global.testPool.query(
                'SELECT id, email FROM authen.users WHERE email = $1',
                [testUser.email.toLowerCase()]
            );

            if (userCheck.rows.length === 0) {
                console.error('❌ Test user not found for rate limit test');
                throw new Error('Test user missing');
            }

            // Make several successful logins with error handling
            for (let i = 0; i < 3; i++) {
                console.log(`🔄 Attempt ${i + 1}: Login for rate limit test`);

                const response = await request(app)
                    .post('/api/login')
                    .send({
                        email: testUser.email,
                        password: testUser.password
                    });

                // Enhanced error debugging
                if (response.status !== 200) {
                    console.error(`❌ Login attempt ${i + 1} failed:`, {
                        status: response.status,
                        body: response.body,
                        headers: response.headers
                    });

                    // Debug database state
                    const dbUsers = await global.testPool.query(
                        'SELECT email, username FROM authen.users LIMIT 3'
                    );
                    console.log('Available users in DB:', dbUsers.rows);
                }

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // เพิ่ม delay ระหว่างการ login
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Should still allow more attempts (successful logins don't count against limit)
            const finalResponse = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            if (finalResponse.status !== 200) {
                console.error('❌ Final login attempt failed:', finalResponse.body);
            }

            expect(finalResponse.status).toBe(200);
            expect(finalResponse.body.success).toBe(true);
        }, 30000); // เพิ่ม timeout
    });

    // แก้ไข Security Tests
    describe('Security Tests', () => {
        test('should handle SQL injection attempts', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: "admin@example.com'; DROP TABLE users; --",
                    password: testUser.password
                });

            // อาจได้ 400 (validation error) หรือ 401 (invalid credentials)
            expect([400, 401]).toContain(response.status);

            if (response.status === 400) {
                expect(response.body.details).toEqual(
                    expect.arrayContaining([
                        expect.stringContaining('Invalid email format')
                    ])
                );
            } else {
                expect(response.body.error).toBe('Invalid credentials');
            }
        });

        test('should handle XSS attempts in login', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: "<script>alert('xss')</script>@example.com",
                    password: testUser.password
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Invalid email format')
                ])
            );
        });
    });


    describe('Logout Functionality', () => {
        test('should logout successfully', async () => {
            // Login first
            const loginResponse = await request(app)
                .post('/api/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const { accessToken } = loginResponse.body;
            const cookies = loginResponse.headers['set-cookie'];

            // Logout
            const logoutResponse = await request(app)
                .post('/api/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', cookies)
                .expect(200);

            expect(logoutResponse.body.success).toBe(true);

            // Verify session is removed from database
            const { rows } = await global.testPool.query(
                'SELECT * FROM authen.sessions WHERE user_id = $1',
                [userId]
            );
            expect(rows).toHaveLength(0);
        });
    });
});
