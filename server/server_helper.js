const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// สร้าง rate limiter ที่ปรับตาม environment
const createRateLimiter = (options = {}) => {
    if (process.env.NODE_ENV === 'test') {
        // ในโหมด test ใช้ rate limit ที่หลวมกว่า
        return rateLimit({
            windowMs: 2000,     // 2 seconds window
            max: 100,           // 100 requests per window in test
            skipSuccessfulRequests: true,
            keyGenerator: (req) => {
                const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
                return ipKeyGenerator(ip);
            },
            ...options
        });
    }
    
    // Production rate limit
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        skipSuccessfulRequests: true,
        keyGenerator: (req) => {
            const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
            return ipKeyGenerator(ip);
        },
        ...options
    });
};

// Registration rate limiter
const registerLimiter = createRateLimiter({
    message: {
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: process.env.NODE_ENV === 'test' ? 2 : Math.ceil((15 * 60 * 1000) / 1000)
    }
});

// server_helper.js - แก้ไข loginLimiter
const loginLimiter = createRateLimiter({
    max: process.env.NODE_ENV === 'test' ? 50 : 10, // เพิ่มขีดจำกัดสำหรับ test
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000, // 1 วินาทีสำหรับ test
    message: {
        error: 'Too many login attempts. Please try again later.',
        retryAfter: process.env.NODE_ENV === 'test' ? 1 : Math.ceil((15 * 60 * 1000) / 1000)
    }
});


// Enhanced input validation middleware
const validateRegisterInput = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    // Check if required fields exist
    if (!username && !email && !password) {
        return res.status(400).json({
            error: 'Missing required fields',
            details: ['Username, email, and password are required']
        });
    }

    // Username validation
    if (!username || typeof username !== 'string') {
        errors.push('Username is required and must be a string');
    } else {
        if (username.length < 3 || username.length > 30) {
            errors.push('Username must be 3-30 characters long');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }
        if (/^[-_]|[-_]$/.test(username)) {
            errors.push('Username cannot start or end with underscore or hyphen');
        }
    }

    // Email validation
    if (!email || typeof email !== 'string') {
        errors.push('Email is required and must be a string');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Valid email address is required');
        }
        if (email.length > 254) {
            errors.push('Email address is too long');
        }
        if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
            errors.push('Invalid email format');
        }
    }

    // Password validation with English messages
    if (!password || typeof password !== 'string') {
        errors.push('Password is required and must be a string');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }
        
        // Check for common weak passwords
        const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
        if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
            errors.push('Password is too common, please choose a more secure password');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }
    
    next();
};

// server_helper.js - แก้ไข validateLoginInput
const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else {
        // Enhanced email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Valid email address is required');
        }
        
        // Check for malicious patterns
        if (email.includes('<script>') || email.includes('DROP TABLE') || email.includes("'")) {
            errors.push('Invalid email format');
        }
    }

    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 1) {
        errors.push('Password cannot be empty');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Invalid login credentials',
            details: errors
        });
    }
    
    next();
};


// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
    }
    next();
};

module.exports = {
    registerLimiter,
    loginLimiter,
    validateRegisterInput,
    validateLoginInput,
    securityHeaders,
    requestLogger
};
