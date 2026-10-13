import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env file maddii backend keessaa (cPanel irrattis) sirriitti argachuuf absolute path fayyadama
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

// cPanel baay'een host bakka socketpath fayyadama; yoo DB_SOCKET kenname host/port dhiisnee socket fayyadamna
if (process.env.DB_SOCKET) {
  delete poolConfig.host;
  delete poolConfig.port;
  poolConfig.socketPath = process.env.DB_SOCKET;
}

// RDS/remote MySQL yoo SSL barbaadde
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(poolConfig);

export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log(
      `Database connected: ${poolConfig.database} @ ${poolConfig.host || poolConfig.socketPath}:${poolConfig.port || ''}`
    );
    return true;
  } catch (error) {
    console.error(
      'Database connection failed:',
      error.code || error.message || error
    );
    return false;
  }
};

export default db;
