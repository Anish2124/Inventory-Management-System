const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/inventory
 * Get all inventory items with product details
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
        i.updated_at as last_updated
      FROM chemical_products cp
      LEFT JOIN inventory i ON cp.id = i.product_id
      ORDER BY cp.product_name
    `;
    
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/inventory/product/:productId
 * Get inventory for a specific product
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const query = `
      SELECT 
        cp.id,
        cp.product_name,
        cp.cas_number,
        cp.unit_of_measurement,
        COALESCE(i.current_stock_quantity, 0) as current_stock_quantity,
        i.updated_at as last_updated
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
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/inventory/update-stock
 * Update stock (IN or OUT)
 */
router.post('/update-stock', async (req, res) => {
  try {
    const { product_id, movement_type, quantity } = req.body;

    // Validate required fields
    if (!product_id || !movement_type || !quantity) {
      return res.status(400).json({ 
        error: 'Product ID, movement type, and quantity are required' 
      });
    }

    // Validate movement type
    if (movement_type !== 'IN' && movement_type !== 'OUT') {
      return res.status(400).json({ error: 'Movement type must be IN or OUT' });
    }

    // Validate quantity is positive
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Check if product exists
    const productCheck = await db.pool.query(
      'SELECT id FROM chemical_products WHERE id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get current stock
    const inventoryResult = await db.pool.query(
      'SELECT current_stock_quantity FROM inventory WHERE product_id = $1',
      [product_id]
    );

    let currentStock = 0;
    if (inventoryResult.rows.length > 0) {
      currentStock = parseFloat(inventoryResult.rows[0].current_stock_quantity);
    }

    // Calculate new stock based on movement type
    let newStock;
    if (movement_type === 'IN') {
      // Increase stock
      newStock = currentStock + quantity;
    } else {
      // Decrease stock
      newStock = currentStock - quantity;
      
      // Check if stock would go below zero
      if (newStock < 0) {
        return res.status(400).json({ 
          error: 'Insufficient stock. Stock cannot go below zero.',
          currentStock: currentStock,
          requested: quantity
        });
      }
    }

    // Use transaction to ensure data consistency
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update or insert inventory record
      if (inventoryResult.rows.length > 0) {
        // Update existing inventory
        await client.query(
          `UPDATE inventory 
           SET current_stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
           WHERE product_id = $2`,
          [newStock, product_id]
        );
      } else {
        // Create new inventory record
        await client.query(
          'INSERT INTO inventory (product_id, current_stock_quantity) VALUES ($1, $2)',
          [product_id, newStock]
        );
      }

      // Record stock movement in history
      await client.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock)
         VALUES ($1, $2, $3, $4, $5)`,
        [product_id, movement_type, quantity, currentStock, newStock]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Stock updated successfully',
        product_id,
        movement_type,
        quantity,
        previous_stock: currentStock,
        new_stock: newStock
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the client
      client.release();
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

/**
 * GET /api/inventory/history/:productId
 * Get stock movement history for a specific product
 */
router.get('/history/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const query = `
      SELECT 
        sm.id,
        sm.movement_type,
        sm.quantity,
        sm.previous_stock,
        sm.new_stock,
        sm.created_at,
        cp.product_name,
        cp.cas_number
      FROM stock_movements sm
      JOIN chemical_products cp ON sm.product_id = cp.id
      WHERE sm.product_id = $1
      ORDER BY sm.created_at DESC
    `;
    
    const result = await db.pool.query(query, [productId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

/**
 * GET /api/inventory/history
 * Get all stock movements (recent 100)
 */
router.get('/history', async (req, res) => {
  try {
    const query = `
      SELECT 
        sm.id,
        sm.product_id,
        sm.movement_type,
        sm.quantity,
        sm.previous_stock,
        sm.new_stock,
        sm.created_at,
        cp.product_name,
        cp.cas_number
      FROM stock_movements sm
      JOIN chemical_products cp ON sm.product_id = cp.id
      ORDER BY sm.created_at DESC
      LIMIT 100
    `;
    
    const result = await db.pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

module.exports = router;
