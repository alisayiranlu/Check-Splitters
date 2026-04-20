import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

export default function Receipts() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session, refreshSession } = useSession();
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    refreshSession().then(s => {
      if (s) setReceipts(s.receipts ?? []);
    });
  }, []);

  async function handleDelete(receiptId, e) {
    e.stopPropagation();
    if (!confirm('Delete this receipt?')) return;
    await api.deleteReceipt(receiptId);
    setReceipts(prev => prev.filter(r => r.id !== receiptId));
  }

  return (
    <div className="page">
      <div className="topbar">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{session?.name}</div>
        <span className="topbar-title">Receipts</span>
        <button
          className="icon-btn"
          onClick={() => navigate(`/session/${sessionId}/receipts/add`)}
          style={{ color: 'var(--primary)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div className="page-content">
        {receipts.length === 0 ? (
          <div className="empty-state">
            <h3>No receipts yet</h3>
            <p>Add your first receipt to start splitting.</p>
            <button
              className="btn"
              style={{ background: '#fff', color: 'var(--primary)', width: 'auto', padding: '10px 20px', marginTop: 4 }}
              onClick={() => navigate(`/session/${sessionId}/receipts/add`)}
            >
              + New Receipt
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {receipts.map(receipt => (
              <div
                key={receipt.id}
                className="card"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => navigate(`/session/${sessionId}/receipts/${receipt.id}/edit`)}
              >
                <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 10, flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{receipt.name}</div>
                  {receipt.scanned_at && (
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{receipt.scanned_at}</div>
                  )}
                </div>
                <button className="icon-btn" onClick={e => handleDelete(receipt.id, e)} style={{ color: 'var(--danger)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
