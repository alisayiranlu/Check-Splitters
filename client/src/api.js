const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  createSession: (name, participantName) =>
    request('POST', '/sessions', { name, participantName }),

  getSessionByCode: (code) =>
    request('GET', `/sessions/code/${code}`),

  getSession: (id) =>
    request('GET', `/sessions/${id}`),

  joinSession: (code, participantName) =>
    request('POST', `/sessions/code/${code}/join`, { participantName }),

  getReview: (sessionId) =>
    request('GET', `/sessions/${sessionId}/review`),

  addReceipt: (sessionId, name, items, scannedAt) =>
    request('POST', '/receipts', { sessionId, name, items, scannedAt }),

  getReceipt: (id) =>
    request('GET', `/receipts/${id}`),

  updateItems: (receiptId, items) =>
    request('PUT', `/receipts/${receiptId}/items`, { items }),

  addReceiptItem: (receiptId, item) =>
    request('POST', `/receipts/${receiptId}/items`, item),

  updateSplits: (receiptId, splits) =>
    request('PUT', `/receipts/${receiptId}/splits`, { splits }),

  deleteReceipt: (id) =>
    request('DELETE', `/receipts/${id}`),
};
