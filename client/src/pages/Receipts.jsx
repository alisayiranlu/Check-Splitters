import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
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
  }, [refreshSession]);

  async function handleDelete(receiptId, e) {
    e.stopPropagation();
    if (!confirm('Delete this receipt?')) return;
    await api.deleteReceipt(receiptId);
    setReceipts(prev => prev.filter(r => r.id !== receiptId));
  }

  return (
    <div className="page">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}`)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Receipts</span>
        <button className="icon-btn" onClick={() => navigate(`/session/${sessionId}/receipts/add`)} aria-label="Add receipt" style={{ color: 'var(--primary)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="eyebrow">{session?.name ?? 'Session'}</div>
          <h1>Receipts</h1>
          <p className="muted">Review scanned and manually entered receipts before assigning splits.</p>
        </section>

        {receipts.length === 0 ? (
          <section className="empty-state">
            <h3>No receipts yet</h3>
            <p>Add your first receipt to start splitting.</p>
            <button className="btn" style={{ width: 'auto', background: '#fff', color: 'var(--primary)' }} onClick={() => navigate(`/session/${sessionId}/receipts/add`)}>
              New Receipt
            </button>
          </section>
        ) : (
          <section className="list-stack">
            {receipts.map((receipt, index) => (
              <div
                key={receipt.id}
                className={`card row-between${index % 2 ? ' tonal' : ''}`}
                role="button"
                tabIndex={0}
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => navigate(`/session/${sessionId}/receipts/${receipt.id}/edit`)}
                onKeyDown={e => {
                  if (e.key === 'Enter') navigate(`/session/${sessionId}/receipts/${receipt.id}/edit`);
                }}
              >
                <div className="list-row">
                  <div className="receipt-thumb">REC</div>
                  <div>
                    <h3>{receipt.name}</h3>
                    <p className="muted">{receipt.scanned_at || 'Manual receipt'}</p>
                  </div>
                </div>
                <button className="icon-btn" onClick={e => handleDelete(receipt.id, e)} aria-label="Delete receipt" style={{ color: 'var(--danger)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            ))}
          </section>
        )}
      </main>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
