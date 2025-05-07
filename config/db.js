import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
});

// Ensure flashcards table exists
const initializeDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS flashcards (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT NOT NULL
            );
        `);
        console.log("Flashcards table initialized");
    } catch (error) {
        console.error("Database initialization error:", error);
    }
};

initializeDB();

export const query = (text, params) => pool.query(text, params);
export default pool;