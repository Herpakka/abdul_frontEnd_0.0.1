// server.js

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Fixed: was 'Bcrypt'
require('dotenv').config();

// Import corrected helper functions
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

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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

// Enhanced register route with comprehensive error handling
app.post('/api/register', registerLimiter, validateRegisterInput, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check for existing users (prevent information leakage)
        const existingUserCheck = await pool.query(
            'SELECT id FROM authen.users WHERE email = $1 OR username = $2',
            [email.toLowerCase(), username.toLowerCase()]
        );

        if (existingUserCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'Registration failed. Username or email may already be in use.'
            });
        }

        // Hash password securely (async version is more secure than sync)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user with normalized data
        const result = await pool.query(
            'INSERT INTO authen.users (role, username, email, password, image) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at',
            ['user', username.toLowerCase(), email.toLowerCase(), hashedPassword, null]
        );

        const newUser = result.rows[0];

        // Log successful registration for audit (don't log sensitive data)
        console.log(`New user registered: ${newUser.id} at ${new Date().toISOString()}`);

        // Return success response (exclude sensitive data)
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
        // Log detailed error for debugging (server-side only)
        console.error('Registration error:', {
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        });

        // Handle specific PostgreSQL errors
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Registration failed. Username or email may already be in use.'
            });
        }

        if (error.code === '23514') {
            return res.status(400).json({
                error: 'Invalid data provided'
            });
        }

        if (error.code === '23502') {
            return res.status(400).json({
                error: 'Required fields are missing'
            });
        }

        // Generic error response
        res.status(500).json({
            error: 'Registration temporarily unavailable. Please try again later.'
        });
    }
});

// Enhanced login route with proper password verification
app.post('/api/login', loginLimiter, validateLoginInput, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Lookup user by email
        const result = await pool.query(
            'SELECT * FROM authen.users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Verify password with bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Issue JWT tokens
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '20m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Store refresh token in database
        await pool.query(
            'INSERT INTO authen.sessions (user_id, refresh_token, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, now() + interval \'7 days\')',
            [
                user.id, 
                refreshToken, 
                req.get('User-Agent') || 'Unknown',
                req.ip || req.connection.remoteAddress || 'Unknown'
            ]
        );

        // Set refresh token as HTTP-only cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Log successful login
        console.log(`User login successful: ${user.id} at ${new Date().toISOString()}`);

        res.status(200).json({ 
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
        console.error('Login error:', {
            error: error.message,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        });

        res.status(500).json({ 
            error: 'Login temporarily unavailable. Please try again later.' 
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
            'SELECT id, username, email, image, role, created_at FROM authen.users WHERE id = $1',
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

// Logout route
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        
        if (refreshToken) {
            // Remove refresh token from database
            await pool.query(
                'DELETE FROM authen.sessions WHERE refresh_token = $1 AND user_id = $2',
                [refreshToken, req.user.userId]
            );
        }

        // Clear refresh token cookie
        res.clearCookie('refresh_token');
        
        console.log(`User logout: ${req.user.userId} at ${new Date().toISOString()}`);
        
        res.json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
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

// Listen
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
