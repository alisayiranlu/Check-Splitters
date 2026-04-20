import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function EditItems() {
  const { id: sessionId, receiptId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getReceipt(receiptId).then(r => {
      setReceipt(r);
      setItems(r.items.map(i => ({ ...i, price: i.price.toFixed(2) })));
    });
  }, [receiptId]);

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems(prev => [...prev, { id: null, name: '', quantity: 1, price: '0.00', isTaxTip: false }]);
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateItems(receiptId, items.map(i => ({
        ...i,
        price: parseFloat(i.price) || 0,
        quantity: parseInt(i.quantity) || 1,
      })));
      navigate(`/session/${sessionId}/receipts/${receiptId}/splits`);
    } finally {
      setSaving(false);
    }
  }

  const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1), 0);

  if (!receipt) return <div className="page"><div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div></div>;

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="topbar-title">Edit Items</span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          {saving ? '...' : 'Done Editing'}
        </button>
      </div>

      <div className="page-content">
        <div>
          <h2>{receipt.name}</h2>
          {receipt.scanned_at && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Scanned via Camera · {receipt.scanned_at}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Receipt Total</span>
          <span className="amount">${total.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input
                  className="input"
                  value={item.name}
                  onChange={e => updateItem(idx, 'name', e.target.value)}
                  placeholder="Item name"
                  style={{ flex: 1, padding: '8px 10px' }}
                />
                <button className="icon-btn" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty:</span>
                <button className="icon-btn" onClick={() => updateItem(idx, 'quantity', Math.max(1, (parseInt(item.quantity) || 1) - 1))}>−</button>
                <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button className="icon-btn" onClick={() => updateItem(idx, 'quantity', (parseInt(item.quantity) || 1) + 1)}>+</button>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price: $</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={e => updateItem(idx, 'price', e.target.value)}
                  style={{ width: 80, padding: '6px 8px', textAlign: 'right' }}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-outline" onClick={addItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Manual Item
        </button>
      </div>
    </div>
  );
}
