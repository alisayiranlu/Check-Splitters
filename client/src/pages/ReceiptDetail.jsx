import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';

export default function ReceiptDetail() {
  const { id: sessionId, receiptId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getReceipt(receiptId)
      .then(setReceipt)
      .catch(() => setError('Unable to load this receipt.'));
  }, [receiptId]);

  if (error) return (
    <div className="page">
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">{error}</p>
      </div>
      <BottomNav sessionId={sessionId} />
    </div>
  );

  if (!receipt) return (
    <div className="page">
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
    </div>
  );

  const total = receipt.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasSplits = receipt.items.some(i => i.splits?.length > 0);

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}/receipts`)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="topbar-title">{receipt.name}</span>
        <button
          className="topbar-back"
          onClick={() => navigate(`/session/${sessionId}/receipts/${receiptId}/edit`)}
          title="Edit items"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      <div className="page-content">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Receipt
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>{receipt.name}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>Total Bill</div>
          <div className="amount">${total.toFixed(2)}</div>
        </div>

        {/* Items with splits */}
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {receipt.items.map(item => {
            const itemTotal = item.price * item.quantity;
            const splits = item.splits ?? [];
            return (
              <div key={item.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: splits.length > 0 ? 10 : 0 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.quantity} x ${item.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700 }}>${itemTotal.toFixed(2)}</div>
                </div>

                {splits.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {splits.map(s => (
                      <div
                        key={s.participant_id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 999,
                          background: 'var(--primary)', color: '#fff',
                          fontSize: '0.8rem', fontWeight: 600,
                        }}
                      >
                        {s.participant_name}
                        <span style={{ opacity: 0.85 }}>${s.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>Not assigned</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate(`/session/${sessionId}/receipts/${receiptId}/splits`)}
        >
          {hasSplits ? 'Edit Splits' : 'Assign Splits'}
        </button>
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
