// server.js

const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import helper functions
const {
    registerLimiter,
    validateRegisterInput,
    loginLimiter,
    validateLoginInput,
    securityHeaders,
    requestLogger
} = require('./server_helper');

const app = express();

// Apply security middleware first
app.use(securityHeaders);
app.use(requestLogger);
app.use(bodyParser.json());
app.use(cookieParser());

// **FIXED: Use test database when in test environment**
const pool = new Pool({
    connectionString: process.env.NODE_ENV === 'test'
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL,
    options: '-c timezone=Asia/Bangkok'
});

// Configure CORS for specific origin (more secure)
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express-session setup (using PostgreSQL for session persistence)
app.use(
    session({
        store: new pgSession({
            pool,
            tableName: 'sessions',
            schemaName: 'authen',
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
    })
);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Auth Server!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Enhanced register route with comprehensive security improvements
app.post('/api/register', registerLimiter, validateRegisterInput, async (req, res) => {
    const { username, email, password, image } = req.body;

    try {
        console.log(`🔍 Registration attempt for: ${email} / ${username}`);

        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [TEST] Registration attempt:`, {
                username: username,
                email: email,
                timestamp: new Date().toISOString()
            });
        }

        // Check for existing users with detailed logging
        const existingUserCheck = await pool.query(
            'SELECT id, email, username FROM authen.users WHERE email = $1 OR username = $2',
            [email.toLowerCase(), username.toLowerCase()]
        );

        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [TEST] Existing users check:`, {
                found: existingUserCheck.rows.length,
                users: existingUserCheck.rows
            });
        }

        if (existingUserCheck.rows.length > 0) {
            const existingUser = existingUserCheck.rows[0];
            console.log(`❌ Duplicate detected: ${existingUser.email === email.toLowerCase() ? 'email' : 'username'}`);

            return res.status(409).json({
                error: 'Registration failed. Username or email may already be in use.'
            });
        }

        // Hash password securely with timing attack protection
        const saltRounds = 12;
        const startTime = Date.now();
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashTime = Date.now() - startTime;

        // Log hashing time for security monitoring
        if (hashTime > 1000) {
            console.warn(`⚠️ Password hashing took ${hashTime}ms - unusually long`);
        }

        // Insert new user with enhanced error handling
        const result = await pool.query(
            'INSERT INTO authen.users (role, username, email, password, image) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at',
            ['user', username.toLowerCase(), email.toLowerCase(), hashedPassword, null]
        );

        const newUser = result.rows[0];

        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [TEST] User created successfully:`, {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            });
        }

        // Enhanced audit logging
        console.log(`✅ User registered successfully:`, {
            userId: newUser.id,
            username: newUser.username,
            email: newUser.email,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        // Return success response with consistent format
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.created_at
            }
        });

    } catch (error) {
        // Enhanced error logging with security context
        console.error('❌ Registration failed:', {
            error: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            requestData: {
                username: username,
                email: email,
                hasImage: !!image
            },
            clientInfo: {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                origin: req.headers['origin']
            }
        });

        // Handle specific PostgreSQL errors with security considerations
        if (error.code === '23505') {
            // Unique violation - could be race condition
            const constraintName = error.constraint || 'unknown';
            console.warn(`⚠️ Unique constraint violation: ${constraintName}`);

            return res.status(409).json({
                error: 'Registration failed. Username or email may already be in use.'
            });
        }

        if (error.code === '23514') {
            // Check constraint violation
            console.warn(`⚠️ Check constraint violation: ${error.constraint}`);
            return res.status(400).json({
                error: 'Invalid data provided'
            });
        }

        if (error.code === '23502') {
            // Not null violation
            console.warn(`⚠️ Required field missing: ${error.column}`);
            return res.status(400).json({
                error: 'Required fields are missing'
            });
        }

        if (error.code === '42P01') {
            // Table doesn't exist - critical system error
            console.error(`🚨 Critical: Database table missing`);
            return res.status(500).json({
                error: 'System temporarily unavailable. Please contact support.'
            });
        }

        if (error.code === '53300') {
            // Too many connections
            console.error(`🚨 Database connection limit reached`);
            return res.status(503).json({
                error: 'Service temporarily overloaded. Please try again in a moment.'
            });
        }

        // Connection or timeout errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.error(`🚨 Database connection issue: ${error.code}`);
            return res.status(503).json({
                error: 'Service temporarily unavailable. Please try again later.'
            });
        }

        // Generic error response (don't leak implementation details)
        res.status(500).json({
            error: 'Registration temporarily unavailable. Please try again later.'
        });
    }
});


// server.js - Enhanced login route สำหรับ debugging
app.post('/api/login', loginLimiter, validateLoginInput, async (req, res) => {
    const { email, password } = req.body;

    try {
        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [LOGIN-DEBUG] Environment variables check:`, {
                NODE_ENV: process.env.NODE_ENV,
                JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
                JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Missing',
                DATABASE_URL: process.env.TEST_DATABASE_URL ? '✅ Set' : '❌ Missing'
            });
        }

        // ตรวจสอบ JWT secrets อย่างเข้มงวด
        const jwtSecret = process.env.JWT_SECRET || process.env.TEST_JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.TEST_JWT_REFRESH_SECRET;

        if (!jwtSecret || !jwtRefreshSecret) {
            console.error('❌ CRITICAL: JWT secrets missing');
            return res.status(500).json({
                error: 'Server configuration error - JWT secrets missing'
            });
        }

        // Lookup user by email with enhanced logging
        const result = await pool.query(
            'SELECT id, username, email, password, role FROM authen.users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = result.rows[0];
        if (!user) {
            if (process.env.NODE_ENV === 'test') {
                console.log(`🧪 [LOGIN-DEBUG] User not found: ${email}`);
                
                // Debug: แสดงว่ามี users อะไรใน database
                const allUsers = await pool.query('SELECT email, username FROM authen.users LIMIT 5');
                console.log(`🧪 [LOGIN-DEBUG] Available users:`, allUsers.rows);
            }
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Verify password with enhanced error handling
        let passwordMatch;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error('❌ BCRYPT Error:', bcryptError);
            return res.status(500).json({
                error: 'Password verification failed'
            });
        }

        if (!passwordMatch) {
            if (process.env.NODE_ENV === 'test') {
                console.log(`🧪 [LOGIN-DEBUG] Password mismatch for: ${email}`);
            }
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Issue JWT tokens with enhanced error handling
        let accessToken, refreshToken;
        try {
            accessToken = jwt.sign(
                { userId: user.id, role: user.role },
                jwtSecret,
                { expiresIn: '20m' }
            );

            refreshToken = jwt.sign(
                { userId: user.id },
                jwtRefreshSecret,
                { expiresIn: '7d' }
            );

            if (process.env.NODE_ENV === 'test') {
                console.log(`🧪 [LOGIN-DEBUG] JWT tokens generated successfully`);
            }
        } catch (jwtError) {
            console.error('❌ JWT Generation Error:', jwtError);
            return res.status(500).json({
                error: 'Token generation failed',
                details: process.env.NODE_ENV === 'test' ? jwtError.message : undefined
            });
        }

        // Store refresh token in database with enhanced error handling
        try {
            const sessionResult = await pool.query(
                'INSERT INTO authen.sessions (user_id, refresh_token, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, now() + interval \'7 days\') RETURNING id', // 5 minutes
                [
                    user.id,
                    refreshToken,
                    req.get('User-Agent') || 'Test-Agent',
                    req.ip || req.socket.remoteAddress || '127.0.0.1'
                ]
            );

            if (process.env.NODE_ENV === 'test') {
                console.log(`🧪 [LOGIN-DEBUG] Session created: ${sessionResult.rows[0].id}`);
            }
        } catch (sessionError) {
            console.error('❌ Session Creation Error:', {
                message: sessionError.message,
                code: sessionError.code,
                constraint: sessionError.constraint
            });
            return res.status(500).json({
                error: 'Session creation failed',
                details: process.env.NODE_ENV === 'test' ? sessionError.message : undefined
            });
        }

        // Set refresh token cookie with enhanced error handling
        try {
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'test' ? 'lax' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            if (process.env.NODE_ENV === 'test') {
                console.log(`🧪 [LOGIN-DEBUG] Cookie set successfully`);
            }
        } catch (cookieError) {
            console.error('❌ Cookie Setting Error:', cookieError);
            return res.status(500).json({
                error: 'Cookie setting failed'
            });
        }

        // Success response
        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [LOGIN-DEBUG] Login successful for: ${user.email}`);
        }

        res.json({
            success: true,
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login Critical Error:', {
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'test' ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            email: email
        });

        res.status(500).json({
            error: 'Login temporarily unavailable. Please try again later.',
            details: process.env.NODE_ENV === 'test' ? error.message : undefined
        });
    }
});

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Protected profile route
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, username, email, role, created_at FROM authen.users WHERE id = $1',
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Fixed logout route
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'test') {
            console.log(`🧪 [LOGOUT] Starting logout for user: ${req.user.userId}`);
        }

        const refreshToken = req.cookies.refresh_token;
        
        if (refreshToken) {
            try {
                // Remove refresh token from database
                const deleteResult = await pool.query(
                    'DELETE FROM authen.sessions WHERE refresh_token = $1 AND user_id = $2',
                    [refreshToken, req.user.userId]
                );

                if (process.env.NODE_ENV === 'test') {
                    console.log(`🧪 [LOGOUT] Deleted ${deleteResult.rowCount} session(s)`);
                }
            } catch (dbError) {
                console.error('❌ Database session deletion error:', dbError);
                // Continue with logout even if DB deletion fails
            }
        }

        // Clear refresh token cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        if (process.env.NODE_ENV !== 'test') {
            console.log(`✅ User logout: ${req.user.userId} at ${new Date().toISOString()}`);
        }
        
        res.json({ 
            success: true,
            message: 'Logged out successfully' 
        });

    } catch (error) {
        console.error('❌ Logout error:', {
            message: error.message,
            code: error.code,
            userId: req.user?.userId,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            error: 'Logout failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Token refresh route
app.post('/api/refresh-token', async (req, res) => {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in database
        const result = await pool.query(
            'SELECT * FROM authen.sessions WHERE refresh_token = $1 AND user_id = $2 AND expires_at > now() AND revoked = false',
            [refresh_token, payload.userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: payload.userId, role: payload.role },
            process.env.JWT_SECRET,
            { expiresIn: '20m' }
        );

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});


// Example: Outbound API call using axios
app.get('/api/external-data', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1', {
            timeout: 5000
        });
        res.json({
            success: true,
            data: response.data
        });
    } catch (err) {
        console.error('External API error:', err.message);
        res.status(500).json({ error: 'External API temporarily unavailable' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        path: req.path
    });

    res.status(500).json({
        error: 'Internal server error'
    });
});

// **CRITICAL: Export app for testing**
module.exports = app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Auth server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down server...');
        await pool.end();
        process.exit(0);
    });
}
