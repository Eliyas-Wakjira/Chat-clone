import mysql from 'mysql2/promise';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

let db;

if (client === 'mysql') {
  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gpt_clone',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
  };

  if (process.env.DB_SOCKET) {
    delete poolConfig.host;
    delete poolConfig.port;
    poolConfig.socketPath = process.env.DB_SOCKET;
  }

  if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = mysql.createPool(poolConfig);
  let schemaInitialization;

  const ensureConversationSchema = () => {
    if (!schemaInitialization) {
      schemaInitialization = (async () => {
        const connection = await pool.getConnection();
        try {
          const [columns] = await connection.query(
            `SELECT column_name
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'conversations'
               AND column_name = 'conversation_id'`
          );
          if (columns.length === 0) {
            await connection.query(
              'ALTER TABLE conversations ADD COLUMN conversation_id CHAR(36) NULL'
            );
          }

          const [indexes] = await connection.query(
            `SELECT index_name
             FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = 'conversations'
               AND index_name = 'conversations_owner_thread'`
          );
          if (indexes.length === 0) {
            await connection.query(
              'CREATE INDEX conversations_owner_thread ON conversations (user_id, conversation_id, id)'
            );
          }
        } finally {
          connection.release();
        }
      })().catch((error) => {
        schemaInitialization = undefined;
        throw error;
      });
    }
    return schemaInitialization;
  };

  db = {
    async query(sql, params = []) {
      await ensureConversationSchema();
      return pool.query(sql, params);
    },
    async getConnection() {
      await ensureConversationSchema();
      return pool.getConnection();
    },
  };
} else if (client === 'sqlite') {
  const databasePath = path.resolve(
    __dirname,
    process.env.DB_FILE || '../data/chat.sqlite'
  );
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec(fs.readFileSync(path.resolve(__dirname, 'schema.sqlite.sql'), 'utf8'));

  const columns = sqlite.prepare('PRAGMA table_info(conversations)').all();
  if (!columns.some((column) => column.name === 'conversation_id')) {
    sqlite.exec('ALTER TABLE conversations ADD COLUMN conversation_id TEXT');
  }
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS conversations_owner_thread
      ON conversations (user_id, conversation_id, id);
  `);

  db = {
    async query(sql, params = []) {
      const statement = sqlite.prepare(sql);
      if (statement.columns().length > 0) {
        return [statement.all(...params)];
      }

      const result = statement.run(...params);
      return [{
        insertId: Number(result.lastInsertRowid),
        affectedRows: Number(result.changes),
      }];
    },
    async ping() {
      sqlite.prepare('SELECT 1').get();
    },
  };
} else {
  throw new Error(`Unsupported DB_CLIENT "${client}". Use "sqlite" or "mysql".`);
}

export const testConnection = async () => {
  try {
    if (client === 'sqlite') {
      await db.ping();
      console.log('Database connected: SQLite');
    } else {
      const connection = await db.getConnection();
      await connection.ping();
      connection.release();
      console.log(`Database connected: MySQL @ ${process.env.DB_HOST || 'localhost'}`);
    }
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.code || error.stack || error);
    return false;
  }
};

export default db;
