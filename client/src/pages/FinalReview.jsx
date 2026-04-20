import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

export default function FinalReview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session, clearSession } = useSession();
  const [review, setReview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    api.getReview(sessionId).then(setReview);
  }, [sessionId]);

  function handleConfirm() {
    setConfirmed(true);
    // In a real app: send notifications / payment requests
    setTimeout(() => {
      alert('Payment requests sent! (mock)');
    }, 500);
  }

  if (!review) return (
    <div className="page">
      <BottomNav sessionId={sessionId} />
    </div>
  );

  const subtotal = review.participants.reduce((s, p) => s + p.total, 0);

  return (
    <div className="page">
      <div className="topbar">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Final Review</div>
        <span className="topbar-title">Final Review</span>
        <div style={{ width: 30 }} />
      </div>

      <div className="page-content">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Final Review
          </div>
          <h1>{session?.name}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Total Amount</div>
          <div className="amount">${review.grandTotal.toFixed(2)}</div>
        </div>

        {/* Participant summary */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Participant Summary</h3>
            <button
              className="icon-btn"
              style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, gap: 4, display: 'flex', alignItems: 'center' }}
              onClick={() => navigate(`/session/${sessionId}/splits`)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
          {review.participants.map(p => (
            <div key={p.id} className="list-row">
              <div className="avatar" style={{ background: p.avatar_color }}>
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  {p.itemCount} item{p.itemCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${p.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Ledger totals */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Ledger Totals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, fontWeight: 800 }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--primary)' }}>${review.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={confirmed}
          style={{ opacity: confirmed ? 0.7 : 1 }}
        >
          {confirmed ? 'Requests Sent!' : 'Confirm & Request ➤'}
        </button>
        {confirmed && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Notifications will be sent immediately.
          </p>
        )}
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
