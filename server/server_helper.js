const rateLimit = require('express-rate-limit');

// Import the ipKeyGenerator helper function
const { ipKeyGenerator } = require('express-rate-limit');

// Registration rate limiter (FIXED)
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 registration attempts per IP
    message: { 
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    // CORRECTED: Use ipKeyGenerator for IPv6 security
    keyGenerator: (req) => {
        // For authenticated users, you could use API key or user ID
        // if (req.user?.id) return `user_${req.user.id}`;
        
        // For unauthenticated users, use secure IP handling
        const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
        return ipKeyGenerator(ip); // This handles IPv6 subnets securely
    },
    skipSuccessfulRequests: true
});

// Login rate limiter (FIXED)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 login attempts per IP
    message: { 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // CORRECTED: Use ipKeyGenerator for IPv6 security
    keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
        return ipKeyGenerator(ip); // Secure IPv6 handling
    },
    skipSuccessfulRequests: true
});

// Alternative: More advanced keyGenerator with auth fallback
const advancedKeyGenerator = (req) => {
    // For authenticated users, use user ID (more accurate than IP)
    if (req.user?.id) {
        return `user_${req.user.id}`;
    }
    
    // For API key based requests
    if (req.headers['x-api-key']) {
        return `api_${req.headers['x-api-key']}`;
    }
    
    // Fallback to secure IP handling for unauthenticated users
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const ipv6Subnet = 64; // Optional: customize IPv6 subnet size
    return ipKeyGenerator(ip, ipv6Subnet);
};

// Rest of your validation functions remain the same...
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

    // Password validation
    if (!password || typeof password !== 'string') {
        errors.push('รหัสผ่านเป็นข้อมูลที่จำเป็นและต้องเป็นอักษร');
    } else {
        if (password.length < 8) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
        }
        if (password.length > 128) {
            errors.push('รหัสผ่านต้องมีน้อยกว่า 128 ตัวอักษร');
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 1 ตัวอักษรพิมพ์เล็ก');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 1 ตัวอักษรพิมพ์ใหญ่');
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 1 ตัวเลข');
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 1 ตัวอักษรพิเศษ (@$!%*?&)');
        }
        const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
        if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
            errors.push('รหัสผ่านนี้เชยเกินไป กรุณาเลือกใช้รหัสผ่านที่ปลอดภัยมากขึ้น');
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

// Login input validation (same as before)
const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Valid email address is required');
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

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
    next();
};

// Export using CommonJS syntax
module.exports = {
    registerLimiter,
    loginLimiter,
    validateRegisterInput,
    validateLoginInput,
    securityHeaders,
    requestLogger,
    advancedKeyGenerator // Optional advanced version
};
