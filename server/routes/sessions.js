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

function normalizeCashGap(total, assigned) {
  // Ignore tiny rounding gaps so cents do not block review.
  const gap = total - assigned;
  return Math.abs(gap) < 0.01 ? 0 : Math.max(0, gap);
}

function buildReceiptSummaries(receipts, participants) {
  const receiptTotalQuery = db.prepare('SELECT COALESCE(SUM(price * quantity), 0) AS total FROM items WHERE receipt_id = ?');
  const receiptSplitsQuery = db.prepare(`
    SELECT s.participant_id, SUM(s.amount) AS total, COUNT(s.id) AS itemCount
    FROM splits s
    JOIN items i ON s.item_id = i.id
    WHERE i.receipt_id = ?
    GROUP BY s.participant_id
  `);

  return receipts.map(receipt => {
    // Group split amounts by receipt so the client can show editable receipt ledgers.
    const splitRows = receiptSplitsQuery.all(receipt.id);
    const totalsByParticipant = new Map(splitRows.map(row => [row.participant_id, row]));
    const participantTotals = participants.map(participant => {
      const row = totalsByParticipant.get(participant.id);
      return {
        ...participant,
        total: row?.total ?? 0,
        itemCount: row?.itemCount ?? 0,
      };
    });

    const total = receiptTotalQuery.get(receipt.id).total;
    const splitTotal = participantTotals.reduce((sum, participant) => sum + participant.total, 0);

    return {
      ...receipt,
      total,
      splitTotal,
      unassignedTotal: normalizeCashGap(total, splitTotal),
      participants: participantTotals,
    };
  });
}

function getParticipantSummaries(sessionId, participants) {
  return participants.map(participant => {
    const splits = db.prepare(`
      SELECT s.amount FROM splits s
      JOIN items i ON s.item_id = i.id
      JOIN receipts r ON i.receipt_id = r.id
      WHERE r.session_id = ? AND s.participant_id = ?
    `).all(sessionId, participant.id);

    const total = splits.reduce((sum, split) => sum + split.amount, 0);
    const itemCount = splits.length;

    return { ...participant, total, itemCount };
  });
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
  if (session.ended_at) return res.status(410).json({ error: 'Session has ended' });

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
  if (session.ended_at) return res.status(410).json({ error: 'Session has ended' });

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
  if (session.ended_at) return res.status(410).json({ error: 'Session has ended' });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
  const receipts = getSessionReceipts(session.id);
  const receiptSummaries = buildReceiptSummaries(receipts, participants);
  const summary = getParticipantSummaries(session.id, participants);

  const grandTotal = summary.reduce((sum, p) => sum + p.total, 0);

  const hasReceiptItems = receipts.some(receipt => receipt.item_count > 0);
  const hasUnassignedCash = receiptSummaries.some(receipt => receipt.unassignedTotal > 0);

  res.json({ session, participants: summary, receipts: receiptSummaries, grandTotal, hasReceiptItems, hasUnassignedCash });
});

router.post('/:id/payment-requests', (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ error: 'participantId is required' });

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.ended_at) return res.status(410).json({ error: 'Session has ended' });

  const requester = db.prepare('SELECT * FROM participants WHERE id = ? AND session_id = ?').get(participantId, session.id);
  if (!requester?.is_admin) return res.status(403).json({ error: 'Only admins can send payment requests' });

  const participants = db.prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
  const receipts = getSessionReceipts(session.id);
  const receiptSummaries = buildReceiptSummaries(receipts, participants);
  const hasUnassignedCash = receiptSummaries.some(receipt => receipt.unassignedTotal > 0);
  if (hasUnassignedCash) return res.status(400).json({ error: 'Assign all cash before sending payment requests' });

  const summaries = getParticipantSummaries(session.id, participants);
  const now = Date.now();
  const insertRequest = db.prepare(`
    INSERT INTO payment_requests (id, session_id, participant_id, amount, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `);

  db.prepare('DELETE FROM payment_requests WHERE session_id = ?').run(session.id);

  const requests = summaries
    .filter(participant => !participant.is_admin && participant.total > 0)
    .map(participant => {
      const request = {
        id: uuidv4(),
        session_id: session.id,
        participant_id: participant.id,
        amount: Number(participant.total.toFixed(2)),
        status: 'pending',
        created_at: now,
        updated_at: now,
      };
      insertRequest.run(request.id, request.session_id, request.participant_id, request.amount, now, now);
      return request;
    });

  res.json({ requests });
});

router.get('/:id/payment-requests', (req, res) => {
  const { participantId } = req.query;
  if (!participantId) return res.status(400).json({ error: 'participantId is required' });

  const participant = db.prepare('SELECT * FROM participants WHERE id = ? AND session_id = ?').get(participantId, req.params.id);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  const requests = participant.is_admin
    ? db.prepare(`
        SELECT pr.*, p.name AS participant_name, p.is_admin
        FROM payment_requests pr
        JOIN participants p ON pr.participant_id = p.id
        WHERE pr.session_id = ?
        ORDER BY pr.created_at DESC
      `).all(req.params.id)
    : db.prepare(`
        SELECT pr.*, p.name AS participant_name, p.is_admin
        FROM payment_requests pr
        JOIN participants p ON pr.participant_id = p.id
        WHERE pr.session_id = ? AND pr.participant_id = ?
        ORDER BY pr.created_at DESC
      `).all(req.params.id, participantId);

  res.json({ requests });
});

router.get('/:id/payment-requests/:participantId', (req, res) => {
  const participant = db.prepare('SELECT id FROM participants WHERE id = ? AND session_id = ?').get(req.params.participantId, req.params.id);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  const requests = db.prepare(`
    SELECT * FROM payment_requests
    WHERE session_id = ? AND participant_id = ? AND status = 'pending'
    ORDER BY created_at DESC
  `).all(req.params.id, req.params.participantId);

  res.json({ requests });
});

router.patch('/:id/payment-requests/:requestId', (req, res) => {
  const { participantId, status } = req.body;
  if (!participantId || !['paid', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'participantId and a valid status are required' });
  }

  const request = db.prepare(`
    SELECT * FROM payment_requests
    WHERE id = ? AND session_id = ? AND participant_id = ?
  `).get(req.params.requestId, req.params.id, participantId);
  if (!request) return res.status(404).json({ error: 'Payment request not found' });

  db.prepare('UPDATE payment_requests SET status = ?, updated_at = ? WHERE id = ?').run(status, Date.now(), request.id);
  res.json({ ...request, status });
});

router.post('/:id/end', (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ error: 'participantId is required' });

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participant = db.prepare('SELECT * FROM participants WHERE id = ? AND session_id = ?').get(participantId, session.id);
  if (!participant?.is_admin) return res.status(403).json({ error: 'Only admins can end sessions' });

  const pending = db.prepare(`
    SELECT COUNT(*) AS count FROM payment_requests
    WHERE session_id = ? AND status = 'pending'
  `).get(session.id).count;
  if (pending > 0) return res.status(400).json({ error: 'All payment requests must be paid before ending the session' });

  const endedAt = session.ended_at || Date.now();
  db.prepare('UPDATE sessions SET ended_at = ? WHERE id = ?').run(endedAt, session.id);
  res.json({ ...session, ended_at: endedAt });
});

module.exports = router;
