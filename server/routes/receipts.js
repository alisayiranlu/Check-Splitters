const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Add a receipt to a session
router.post('/', (req, res) => {
  const { sessionId, name, items, scannedAt } = req.body;
  if (!sessionId || !name) return res.status(400).json({ error: 'sessionId and name are required' });

  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const receiptId = uuidv4();
  const now = Date.now();

  db.prepare('INSERT INTO receipts (id, session_id, name, scanned_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(receiptId, sessionId, name, scannedAt || null, now);

  if (items && items.length > 0) {
    const insertItem = db.prepare(
      'INSERT INTO items (id, receipt_id, name, quantity, price, is_tax_tip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const item of items) {
      insertItem.run(uuidv4(), receiptId, item.name, item.quantity || 1, item.price, item.isTaxTip ? 1 : 0, now);
    }
  }

  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(receiptId);
  const savedItems = db.prepare('SELECT * FROM items WHERE receipt_id = ? ORDER BY created_at ASC').all(receiptId);

  res.json({ ...receipt, items: savedItems });
});

// Get a single receipt with items and splits
router.get('/:id', (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

  const items = db.prepare('SELECT * FROM items WHERE receipt_id = ? ORDER BY created_at ASC').all(receipt.id);

  const itemsWithSplits = items.map(item => {
    const splits = db.prepare(`
      SELECT s.*, p.name as participant_name, p.avatar_color
      FROM splits s
      JOIN participants p ON s.participant_id = p.id
      WHERE s.item_id = ?
    `).all(item.id);
    return { ...item, splits };
  });

  res.json({ ...receipt, items: itemsWithSplits });
});

// Update items on a receipt
router.put('/:id/items', (req, res) => {
  const { items } = req.body;
  if (!items) return res.status(400).json({ error: 'items is required' });

  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

  const now = Date.now();

  // Delete existing items and their splits, then re-insert
  const existingItems = db.prepare('SELECT id FROM items WHERE receipt_id = ?').all(receipt.id);
  for (const item of existingItems) {
    db.prepare('DELETE FROM splits WHERE item_id = ?').run(item.id);
  }
  db.prepare('DELETE FROM items WHERE receipt_id = ?').run(receipt.id);

  const insertItem = db.prepare(
    'INSERT INTO items (id, receipt_id, name, quantity, price, is_tax_tip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const item of items) {
    const id = item.id || uuidv4();
    insertItem.run(id, receipt.id, item.name, item.quantity || 1, item.price, item.isTaxTip ? 1 : 0, now);
  }

  const savedItems = db.prepare('SELECT * FROM items WHERE receipt_id = ? ORDER BY created_at ASC').all(receipt.id);
  res.json({ ...receipt, items: savedItems });
});

// Assign splits for a receipt's items
router.put('/:id/splits', (req, res) => {
  const { splits } = req.body;
  // splits: [{ itemId, assignments: [{ participantId, amount }] }]
  if (!splits) return res.status(400).json({ error: 'splits is required' });

  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

  for (const { itemId, assignments } of splits) {
    db.prepare('DELETE FROM splits WHERE item_id = ?').run(itemId);
    for (const { participantId, amount } of assignments) {
      db.prepare('INSERT INTO splits (id, item_id, participant_id, amount) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), itemId, participantId, amount);
    }
  }

  res.json({ success: true });
});

// Delete a receipt
router.delete('/:id', (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

  const items = db.prepare('SELECT id FROM items WHERE receipt_id = ?').all(receipt.id);
  for (const item of items) {
    db.prepare('DELETE FROM splits WHERE item_id = ?').run(item.id);
  }
  db.prepare('DELETE FROM items WHERE receipt_id = ?').run(receipt.id);
  db.prepare('DELETE FROM receipts WHERE id = ?').run(receipt.id);

  res.json({ success: true });
});

module.exports = router;
