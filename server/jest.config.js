module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 60000, // เพิ่ม timeout เป็น 30 วินาที
  maxConcurrency: 1,  // รัน tests ทีละตัวเพื่อหลีกเลี่ยง rate limit
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    '*.js',
    'server_helper.js',
    '!jest.config.js',
    '!coverage/**',
    '!node_modules/**',
    '!scripts/**'
  ],
  
  // Coverage Configuration
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',           // Terminal output
    'text-summary',   // Summary in terminal
    'lcov',          // For code coverage tools
    'html',          // HTML report
    'json',          // JSON report
    'cobertura'      // XML format for CI/CD
  ],
  
  // Test Reporters
  reporters: [
    'default',                    // Default Jest output
    ['jest-html-reporters', {     // HTML test report
      publicPath: './test-report',
      filename: 'test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Auth Server Test Report'
    }],
    ['jest-junit', {              // JUnit XML for CI/CD
      outputDirectory: './test-report',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Coverage Thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  testTimeout: 15000,
  verbose: true,
  collectCoverage: true
};
