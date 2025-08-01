const { Pool } = require('pg');
require('dotenv').config();

// Test database setup
const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
});

// Clean up test database before each test
beforeEach(async () => {
  await testPool.query('TRUNCATE authen.users, authen.sessions RESTART IDENTITY CASCADE');
});

// Close database connection after all tests
afterAll(async () => {
  await testPool.end();
});

// Make test pool available globally
global.testPool = testPool;
