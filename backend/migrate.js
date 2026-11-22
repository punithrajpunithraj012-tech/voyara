
import 'dotenv/config';
import Database from 'better-sqlite3';
import pg from 'pg';

const { Pool, types } = pg;
types.setTypeParser(20, (value) => Number(value));

const sqlite = new Database('../database/voyara.db', {
    readonly: true
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const tables = [
    'users',
    'trips',
    'expenses',
    'groups_',
    'group_members',
    'packing_items',
    'reminders'
];

const columns = {
    users: ['id', 'name', 'email', 'password_hash', 'home_city', 'preferences', 'reset_token_hash', 'reset_expires', 'created_at'],
    trips: ['id', 'user_id', 'title', 'destination', 'itinerary', 'created_at'],
    expenses: ['id', 'user_id', 'trip_id', 'title', 'amount', 'category', 'spent_on'],
    groups_: ['id', 'owner_id', 'name', 'code', 'data'],
    group_members: ['group_id', 'user_id'],
    packing_items: ['id', 'user_id', 'item', 'checked'],
    reminders: ['id', 'user_id', 'title', 'remind_on', 'done']
};

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const table of tables) {
            const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
            const names = columns[table];

            for (const row of rows) {
                const values = names.map((name) => row[name] ?? null);
                const placeholders = names.map((_, i) => `$${i + 1}`).join(', ');
                const columnList = names.map((name) => `"${name}"`).join(', ');

                await client.query(
                    `INSERT INTO "${table}" (${columnList}) VALUES (${placeholders})`,
                    values
                );
            }

            console.log(`${table}: transferred ${rows.length} records`);
        }

        for (const table of tables) {
            if (table === 'group_members') continue;

            const idColumn = 'id';
            await client.query(
                `SELECT setval(pg_get_serial_sequence('"${table}"', '${idColumn}'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), EXISTS (SELECT 1 FROM "${table}"))`
            );
        }

        await client.query('COMMIT');
        console.log('MIGRATION COMPLETED SUCCESSFULLY');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('MIGRATION FAILED:', error.message);
    } finally {
        client.release();
        sqlite.close();
        await pool.end();
    }
}

migrate();
