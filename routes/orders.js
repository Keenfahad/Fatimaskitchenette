/**
 * routes/orders.js
 *
 * Endpoints:
 *  POST /api/orders          -> create order (returns orderId)
 *  GET  /api/orders/:id      -> get order details
 *  GET  /api/orders/:id/pdf  -> download PDF receipt
 *  GET  /api/admin/orders    -> list orders (admin demo)
 *
 * Uses: better-sqlite3 for a simple local DB.
 */

const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { generatePdfBuffer } = require('../utils/pdf');
const sendNotifications = require('../utils/notify');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'app.db');

// ensure directory
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_FILE);

// Initialize tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items_json TEXT,
    total INTEGER,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT,
    created_at TEXT
  )
`).run();

// INSERT order
router.post('/', async (req, res) => {
  try {
    const { items, total, customer } = req.body;
    if (!items || !total) return res.status(400).json({ error: 'items and total required' });

    const id = 'ORD-' + Date.now(); // or uuidv4()
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO orders (id, items_json, total, customer_name, customer_email, customer_phone, status, created_at)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(id, JSON.stringify(items), total, customer?.name || null, customer?.email || null, customer?.phone || null, 'pending', createdAt);

    // Optionally send confirmation (demo - you may want to send only after confirmed payment)
    // sendNotifications({ orderId: id, items, total, customer }); // commented until payment confirmed

    res.json({ ok: true, orderId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET order
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Order not found' });

  const order = {
    id: row.id,
    items: JSON.parse(row.items_json),
    total: row.total,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone
    },
    status: row.status,
    createdAt: row.created_at
  };
  res.json(order);
});

// GET PDF receipt
router.get('/:id/pdf', async (req, res) => {
  try {
    const id = req.params.id;
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Order not found' });

    const order = {
      id: row.id,
      items: JSON.parse(row.items_json),
      total: row.total,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone
      },
      status: row.status,
      createdAt: row.created_at
    };

    const buffer = await generatePdfBuffer(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${order.id}-receipt.pdf`);
    res.send(buffer);
  } catch (err) {
    console.error('pdf error', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ADMIN: list orders
router.get('/admin/list', (req, res) => {
  const rows = db.prepare('SELECT id, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 200').all();
  res.json(rows);
});

module.exports = router;
