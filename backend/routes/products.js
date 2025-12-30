const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Valid units for products
const VALID_UNITS = ['KG', 'MT', 'Litre'];

/**
 * GET /api/products
 * Get all products with their current stock
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        cp.id,
        cp.product_name,
        cp.cas_number,
        cp.unit_of_measurement,
        COALESCE(i.current_stock_quantity, 0) as current_stock_quantity,
        cp.created_at,
        cp.updated_at
      FROM chemical_products cp
      LEFT JOIN inventory i ON cp.id = i.product_id
      ORDER BY cp.created_at DESC
    `;
    
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const query = `
      SELECT 
        cp.id,
        cp.product_name,
        cp.cas_number,
        cp.unit_of_measurement,
        COALESCE(i.current_stock_quantity, 0) as current_stock_quantity,
        cp.created_at,
        cp.updated_at
      FROM chemical_products cp
      LEFT JOIN inventory i ON cp.id = i.product_id
      WHERE cp.id = $1
    `;
    
    const result = await db.pool.query(query, [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
  try {
    const { product_name, cas_number, unit_of_measurement } = req.body;

    // Validate required fields
    if (!product_name || !cas_number || !unit_of_measurement) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate unit of measurement
    if (!VALID_UNITS.includes(unit_of_measurement)) {
      return res.status(400).json({ 
        error: 'Invalid unit of measurement. Must be KG, MT, or Litre' 
      });
    }

    // Check if CAS number already exists
    const casCheck = await db.pool.query(
      'SELECT id FROM chemical_products WHERE cas_number = $1',
      [cas_number]
    );

    if (casCheck.rows.length > 0) {
      return res.status(400).json({ error: 'CAS number must be unique' });
    }

    // Insert new product
    const insertQuery = `
      INSERT INTO chemical_products (product_name, cas_number, unit_of_measurement)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.pool.query(insertQuery, [
      product_name,
      cas_number,
      unit_of_measurement
    ]);

    const newProduct = result.rows[0];

    // Initialize inventory with 0 stock for the new product
    await db.pool.query(
      'INSERT INTO inventory (product_id, current_stock_quantity) VALUES ($1, 0)',
      [newProduct.id]
    );

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate CAS number error
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CAS number must be unique' });
    }
    
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product
 */
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, cas_number, unit_of_measurement } = req.body;

    // Validate required fields
    if (!product_name || !cas_number || !unit_of_measurement) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate unit of measurement
    if (!VALID_UNITS.includes(unit_of_measurement)) {
      return res.status(400).json({ 
        error: 'Invalid unit of measurement. Must be KG, MT, or Litre' 
      });
    }

    // Check if CAS number already exists for another product
    const casCheck = await db.pool.query(
      'SELECT id FROM chemical_products WHERE cas_number = $1 AND id != $2',
      [cas_number, productId]
    );

    if (casCheck.rows.length > 0) {
      return res.status(400).json({ error: 'CAS number must be unique' });
    }

    // Update product
    const updateQuery = `
      UPDATE chemical_products 
      SET product_name = $1, 
          cas_number = $2, 
          unit_of_measurement = $3, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await db.pool.query(updateQuery, [
      product_name,
      cas_number,
      unit_of_measurement,
      productId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Handle duplicate CAS number error
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CAS number must be unique' });
    }
    
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const result = await db.pool.query(
      'DELETE FROM chemical_products WHERE id = $1 RETURNING *',
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/**
 * GET /api/products/search/:query
 * Search products by name or CAS number
 */
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const searchPattern = `%${searchQuery}%`;
    
    const query = `
      SELECT 
        cp.id,
        cp.product_name,
        cp.cas_number,
        cp.unit_of_measurement,
        COALESCE(i.current_stock_quantity, 0) as current_stock_quantity,
        cp.created_at,
        cp.updated_at
      FROM chemical_products cp
      LEFT JOIN inventory i ON cp.id = i.product_id
      WHERE cp.product_name ILIKE $1 OR cp.cas_number ILIKE $1
      ORDER BY cp.product_name
    `;
    
    const result = await db.pool.query(query, [searchPattern]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

module.exports = router;
