
import pg from 'pg';

const { Pool, types } = pg;

// Convert PostgreSQL BIGINT IDs to JavaScript numbers.
types.setTypeParser(20, (value) => Number(value));

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default db;
