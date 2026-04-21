const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const AVATAR_COLORS = [
  '#0D9488', '#7C3AED', '#DC2626', '#D97706',
  '#059669', '#2563EB', '#DB2777', '#65A30D',
];

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSessionReceipts(sessionId) {
  return db.prepare(`
    SELECT r.*, COUNT(i.id) AS item_count
    FROM receipts r
    LEFT JOIN items i ON i.receipt_id = r.id
    WHERE r.session_id = ?
    GROUP BY r.id
    ORDER BY r.created_at ASC
  `).all(sessionId);
}

// Create a new session
router.post('/', (req, res) => {
  const { name, participantName } = req.body;
  if (!name || !participantName) {
    return res.status(400).json({ error: 'name and participantName are required' });
  }

  let code;
  let attempts = 0;
  do {
    code = generateCode();
    attempts++;
  } while (db.prepare('SELECT id FROM sessions WHERE code = ?').get(code) && attempts < 10);

  const sessionId = uuidv4();
  const participantId = uuidv4();
  const now = Date.now();

  db.prepare('INSERT INTO sessions (id, code, name, created_at) VALUES (?, ?, ?, ?)')
    .run(sessionId, code, name, now);

  db.prepare('INSERT INTO participants (id, session_id, name, avatar_color, is_admin, created_at) VALUES (?, ?, ?, ?, 1, ?)')
    .run(participantId, sessionId, participantName, AVATAR_COLORS[0], now);

  res.json({ sessionId, code, name, participantId });
});

// Get session by code
router.get('/code/:code', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE code = ?').get(req.params.code);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
  const receipts = getSessionReceipts(session.id);

  res.json({ ...session, participants, receipts });
});

// Get session by id
router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
  const receipts = getSessionReceipts(session.id);

  res.json({ ...session, participants, receipts });
});

// Join a session (add participant)
router.post('/code/:code/join', (req, res) => {
  const { participantName } = req.body;
  if (!participantName) return res.status(400).json({ error: 'participantName is required' });

  const session = db.prepare('SELECT * FROM sessions WHERE code = ?').get(req.params.code);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const existing = db.prepare('SELECT * FROM participants WHERE session_id = ? AND name = ?').get(session.id, participantName);
  if (existing) return res.json({ sessionId: session.id, participantId: existing.id, code: session.code, name: session.name });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ?').all(session.id);
  const color = AVATAR_COLORS[participants.length % AVATAR_COLORS.length];

  const participantId = uuidv4();
  db.prepare('INSERT INTO participants (id, session_id, name, avatar_color, is_admin, created_at) VALUES (?, ?, ?, ?, 0, ?)')
    .run(participantId, session.id, participantName, color, Date.now());

  res.json({ sessionId: session.id, participantId, code: session.code, name: session.name });
});

// Get session review summary
router.get('/:id/review', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
  const receipts = getSessionReceipts(session.id);

  const summary = participants.map(p => {
    const splits = db.prepare(`
      SELECT s.amount FROM splits s
      JOIN items i ON s.item_id = i.id
      JOIN receipts r ON i.receipt_id = r.id
      WHERE r.session_id = ? AND s.participant_id = ?
    `).all(session.id, p.id);

    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    const itemCount = splits.length;

    return { ...p, total, itemCount };
  });

  const grandTotal = summary.reduce((sum, p) => sum + p.total, 0);

  const hasReceiptItems = receipts.some(receipt => receipt.item_count > 0);

  res.json({ session, participants: summary, receipts, grandTotal, hasReceiptItems });
});

module.exports = router;
