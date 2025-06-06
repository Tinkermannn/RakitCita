require("dotenv").config();

const { Pool } = require("pg");

const poolConfig = {
    connectionString: process.env.PG_CONNECTION_STRING,
    max: 20,                
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

const connect = async () => {
    try {
        const client = await pool.connect(); 
        console.log("Successfully connected to the PostgreSQL database.");
        client.release(); 
    } catch (error) {
        console.error("Error connecting to the database:", error.stack);
        process.exit(1); 
    }   
}

connect(); 
    
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('Executed query:', { text: text.substring(0,100) + (text.length > 100 ? "..." : ""), duration: `${duration}ms`, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        console.error("Error executing query:", { text: text.substring(0,100) + (text.length > 100 ? "..." : ""), error: error.message });
        throw error; 
    }
}

module.exports = {
    query,
    pool 
};