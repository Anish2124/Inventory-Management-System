const { Pool } = require("pg");

// Create database connection pool (Render + Local compatible)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Check if a table exists
const tableExists = async (tableName) => {
  try {
    const result = await pool.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
      `,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Initialize database tables
const initialize = async () => {
  try {
    console.log("Checking database tables...");

    // chemical_products table
    if (!(await tableExists("chemical_products"))) {
      console.log("Creating chemical_products table...");
      await pool.query(`
        CREATE TABLE chemical_products (
          id SERIAL PRIMARY KEY,
          product_name VARCHAR(255) NOT NULL,
          cas_number VARCHAR(50) UNIQUE NOT NULL,
          unit_of_measurement VARCHAR(20) NOT NULL
            CHECK (unit_of_measurement IN ('KG', 'MT', 'Litre')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("chemical_products table created");
    }

    // inventory table
    if (!(await tableExists("inventory"))) {
      console.log("Creating inventory table...");
      await pool.query(`
        CREATE TABLE inventory (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL
            REFERENCES chemical_products(id) ON DELETE CASCADE,
          current_stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0
            CHECK (current_stock_quantity >= 0),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id)
        );
      `);
      console.log("inventory table created");
    }

    // stock_movements table
    if (!(await tableExists("stock_movements"))) {
      console.log("Creating stock_movements table...");
      await pool.query(`
        CREATE TABLE stock_movements (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL
            REFERENCES chemical_products(id) ON DELETE CASCADE,
          movement_type VARCHAR(10) NOT NULL
            CHECK (movement_type IN ('IN', 'OUT')),
          quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
          previous_stock DECIMAL(10, 2) NOT NULL,
          new_stock DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("stock_movements table created");
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Connection logs
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
  process.exit(1);
});

module.exports = {
  pool,
  initialize,
};
