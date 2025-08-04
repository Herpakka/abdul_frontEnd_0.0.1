const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Environment validation
if (!process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error('❌ No database URL configured. Please set TEST_DATABASE_URL or DATABASE_URL in .env file');
}

// Use test database when in test environment
const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

// Validate that we're using test database in test environment
if (process.env.NODE_ENV === 'test' && !process.env.TEST_DATABASE_URL) {
  console.warn('⚠️  Warning: TEST_DATABASE_URL not set, falling back to DATABASE_URL');
}

// Test database connection pool with enhanced configuration
const testPool = new Pool({
  connectionString: databaseUrl,
  max: 5,                    // Maximum number of connections
  idleTimeoutMillis: 30000,  // 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
  statement_timeout: 5000,   // 5 seconds per query
  query_timeout: 5000        // 5 seconds query timeout
});

// Database connection validation
async function validateTestDatabase() {
  try {
    const client = await testPool.connect();

    // Test basic connection
    const result = await client.query('SELECT version(), current_database()');
    const dbName = result.rows[0].current_database;

    console.log(`✅ Test database connected: ${dbName}`);

    // Verify schema exists
    const schemaCheck = await client.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'authen'"
    );

    if (schemaCheck.rows.length === 0) {
      throw new Error('❌ Schema "authen" not found in test database');
    }

    // Verify required tables exist
    const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'authen' 
            AND table_name IN ('users', 'sessions')
        `);

    if (tableCheck.rows.length !== 2) {
      throw new Error('❌ Required tables (users, sessions) not found in authen schema');
    }

    console.log('✅ Test database schema validation passed');
    client.release();

  } catch (error) {
    console.error('❌ Test database validation failed:', error.message);
    throw error;
  }
}

// tests/setup.js - แก้ไข cleanTestDatabase
async function cleanTestDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Skipping database cleanup - not in test environment');
    return;
  }

  const client = await testPool.connect();
  try {
    console.log('🧹 Starting database cleanup...');

    // เริ่ม transaction
    await client.query('BEGIN');

    // ลบข้อมูลตามลำดับ
    const sessionResult = await client.query('DELETE FROM authen.sessions');
    const userResult = await client.query('DELETE FROM authen.users');

    // Commit transaction
    await client.query('COMMIT');

    console.log(`🧹 Cleanup completed: ${sessionResult.rowCount} sessions, ${userResult.rowCount} users deleted`);

    // ตรวจสอบว่าลบหมดแล้ว
    const remainingUsers = await client.query('SELECT COUNT(*) FROM authen.users');
    const remainingSessions = await client.query('SELECT COUNT(*) FROM authen.sessions');

    const userCount = parseInt(remainingUsers.rows[0].count);
    const sessionCount = parseInt(remainingSessions.rows[0].count);

    if (userCount > 0 || sessionCount > 0) {
      console.warn(`⚠️ Cleanup incomplete: ${userCount} users, ${sessionCount} sessions remaining`);

      // Force cleanup ถ้าจำเป็น
      await client.query('TRUNCATE authen.sessions, authen.users RESTART IDENTITY CASCADE');
      console.log('🧹 Force cleanup completed');
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error cleaning test database:', error.message);

    // Fallback cleanup
    try {
      await client.query('TRUNCATE authen.sessions, authen.users RESTART IDENTITY CASCADE');
      console.log('🧹 Fallback cleanup successful');
    } catch (fallbackError) {
      console.error('❌ Fallback cleanup failed:', fallbackError.message);
      throw fallbackError;
    }
  } finally {
    client.release();
  }
}

// tests/setup.js - แก้ไข beforeEach hook
beforeEach(async () => {
    console.log('🔄 Before each test - preparing database...');
    
    // รอให้ operations ก่อนหน้าเสร็จสิ้น
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ทำ cleanup อย่างระมัดระวัง
    await cleanTestDatabase();
    
    // รอให้ cleanup เสร็จสมบูรณ์
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Database ready for next test');
});

// ปรับปรุง afterEach เพื่อไม่ให้ cleanup ขณะที่ test กำลังรัน
afterEach(async () => {
    // ไม่ทำ cleanup ใน afterEach เพื่อป้องกัน race condition
    console.log('📋 Test completed, cleanup will happen in beforeEach');
});



// Setup hooks
beforeAll(async () => {
  // Set test timeout
  jest.setTimeout(30000);

  // Validate database connection and schema
  await validateTestDatabase();

  console.log('🚀 Test environment initialized');
});

beforeEach(async () => {
  // Clean database before each test
  await cleanTestDatabase();
});

afterEach(async () => {
  // Optional: Additional cleanup or logging
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('🔍 Test completed, database cleaned');
  }
});

afterAll(async () => {
  try {
    // Final cleanup
    await cleanTestDatabase();

    // Close all connections
    await testPool.end();

    console.log('✅ Test database connections closed');

  } catch (error) {
    console.error('❌ Error during test cleanup:', error.message);
  }
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export test utilities
module.exports = {
  testPool,
  cleanTestDatabase,
  validateTestDatabase
};

// Make test pool available globally for tests
global.testPool = testPool;
global.cleanTestDatabase = cleanTestDatabase;
