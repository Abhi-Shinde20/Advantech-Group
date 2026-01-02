const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create quotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(200) NOT NULL,
        requirements TEXT NOT NULL,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create contacts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quotes_timestamp ON quotes(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status)`);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to execute queries with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', { text: text.substring(0, 50), error: error.message });
    throw error;
  }
}

// Health check function
async function healthCheck() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    return {
      status: 'healthy',
      current_time: result.rows[0].current_time,
      version: result.rows[0].version,
      connections: pool.totalCount,
      idle_connections: pool.idleCount,
      waiting_clients: pool.waitingCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Close pool (for graceful shutdown)
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
}

// Export functions and pool
module.exports = {
  pool,
  query,
  initializeDatabase,
  healthCheck,
  closePool
};