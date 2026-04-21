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
      setItems(r.items.map(i => ({
        ...i,
        price: i.price.toFixed(2),
        isTaxTip: Boolean(i.isTaxTip ?? i.is_tax_tip),
      })));
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
    if (hasZeroValueItem) return;

    setSaving(true);
    try {
      await api.updateItems(receiptId, items.map(i => ({
        ...i,
        price: parseFloat(i.price) || 0,
        quantity: parseInt(i.quantity) || 1,
        isTaxTip: Boolean(i.isTaxTip ?? i.is_tax_tip),
      })));
      navigate(`/session/${sessionId}/receipts/${receiptId}/splits`);
    } finally {
      setSaving(false);
    }
  }

  const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1), 0);
  const hasZeroValueItem = items.some(item => getItemTotal(item) <= 0);

  if (!receipt) {
    return <div className="page no-nav"><div className="page-content" style={{ justifyContent: 'center' }}>Loading</div></div>;
  }

  return (
    <div className="page no-nav">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}/receipts`)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Edit Items</span>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || hasZeroValueItem} style={{ width: 'auto', minHeight: 34, padding: '6px 14px', fontSize: '0.875rem' }}>
          {saving ? 'Saving' : 'Done Editing'}
        </button>
      </header>

      <main className="page-content" style={{ paddingBottom: 40 }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="eyebrow">{receipt.scanned_at ? `Scanned ${receipt.scanned_at}` : 'Manual Receipt'}</div>
          <h1>{receipt.name}</h1>
          <p className="muted">Receipt Total</p>
          <div className="amount">${total.toFixed(2)}</div>
        </section>

        <section className="list-stack" style={{ gap: 16 }}>
          {items.map((item, idx) => {
            const zeroValueItem = getItemTotal(item) <= 0;

            return (
              <div key={idx} className={`card${idx % 2 ? ' tonal' : ''}`} style={{ padding: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="row-between">
                    <input
                      className="input"
                      value={item.name}
                      onChange={e => updateItem(idx, 'name', e.target.value)}
                      placeholder="Item name"
                      style={{ flex: 1 }}
                    />
                    <button className="icon-btn" onClick={() => removeItem(idx)} aria-label="Remove item" style={{ color: 'var(--danger)' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>

                  <div className="row-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="muted">Qty</span>
                      <button className="chip chip-unselected" type="button" onClick={() => updateItem(idx, 'quantity', Math.max(1, (parseInt(item.quantity) || 1) - 1))} aria-label="Decrease quantity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <strong>{item.quantity}</strong>
                      <button className="chip chip-unselected" type="button" onClick={() => updateItem(idx, 'quantity', (parseInt(item.quantity) || 1) + 1)}>+</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="muted">$</span>
                      <input
                        className={`input${zeroValueItem ? ' input-warning' : ''}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', e.target.value)}
                        style={{ width: 96, textAlign: 'right' }}
                      />
                      {zeroValueItem && (
                        <span
                          className="item-price-warning"
                          aria-label="Price must be more than $0"
                          data-tooltip="Price must be more than $0"
                          title="Price must be more than $0"
                        >
                          !
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <button className="btn btn-secondary" onClick={addItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Manual Item
        </button>
      </main>
    </div>
  );
}

function getItemTotal(item) {
  return (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
}
