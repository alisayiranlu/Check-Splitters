import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';

export default function FinalReview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session, participant } = useSession();
  const [review, setReview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    api.getReview(sessionId).then(setReview);
  }, [sessionId]);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      alert('Payment requests sent');
    }, 300);
  }

  if (!review) {
    return <div className="page"><div className="page-content">Loading</div><BottomNav sessionId={sessionId} /></div>;
  }

  const subtotal = review.participants.reduce((s, p) => s + p.total, 0);
  const service = typeof review.service === 'number' ? review.service : 0;
  const receipts = review.receipts ?? [];

  return (
    <div className="page">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}/splits`)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Final Review</span>
        <div className="avatar" style={{ width: 32, height: 32, background: participant?.avatar_color ?? 'var(--primary)' }}>
          {participant?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="muted">Final Review</p>
          <h1>{session?.name ?? review.session.name}</h1>
          <p className="muted">Total Amount</p>
          <div className="amount">${review.grandTotal.toFixed(2)}</div>
        </section>

        <section className="card">
          <div className="row-between" style={{ marginBottom: 22 }}>
            <h3>Participant Summary</h3>
            <button className="btn btn-ghost" onClick={() => navigate(`/session/${sessionId}/splits`)}>
              Edit
            </button>
          </div>
          <div className="list-stack">
            {review.participants.map((p, index) => (
              <div key={p.id} className="row-between">
                <div className="list-row">
                  <div className={`avatar${index === 1 ? ' soft' : ''}`} style={{ background: index === 2 ? 'var(--warm)' : p.avatar_color }}>
                    {initials(p.name)}
                  </div>
                  <div>
                    <h3>{p.name}</h3>
                    <p className="muted">{p.itemCount} item{p.itemCount === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <h3>${p.total.toFixed(2)}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="card tonal">
          <div className="list-row">
            <div className="receipt-thumb">REC</div>
            <div>
              <h3>Original Receipt</h3>
              <p className="muted">{receipts.length ? `${receipts.length} receipt${receipts.length === 1 ? '' : 's'} total.` : 'No receipt attached yet.'}</p>
              <button className="btn btn-ghost" type="button" onClick={() => navigate(`/session/${sessionId}/receipts`)}>
                View Full Image
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <h3 style={{ marginBottom: 18 }}>Ledger Totals</h3>
          <div className="list-stack" style={{ gap: 12 }}>
            <div className="total-line">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Service and adjustments</span>
              <span>${service.toFixed(2)}</span>
            </div>
            <div className="total-line strong">
              <span>Grand Total</span>
              <span>${review.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="card tonal">
          <h3 style={{ marginBottom: 12 }}>Collection Method</h3>
          <button className="method-card" type="button" onClick={() => navigate(`/session/${sessionId}/payment-methods`)}>
            <span className="method-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h16" />
                <path d="M6 10V7l6-4 6 4v3" />
                <path d="M6 14v4" />
                <path d="M10 14v4" />
                <path d="M14 14v4" />
                <path d="M18 14v4" />
                <path d="M4 20h16" />
              </svg>
            </span>
            <span style={{ flex: 1 }}>
              <strong>Bank Transfer</strong>
              <span className="muted" style={{ display: 'block' }}>Ending in 4092</span>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{'>'}</span>
          </button>
        </section>

        <button className="btn btn-primary" onClick={handleConfirm} disabled={confirmed}>
          {confirmed ? 'Requests Sent' : 'Confirm and Request'}
          {!confirmed && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
        <p className="muted" style={{ textAlign: 'center', fontSize: '0.75rem' }}>Notifications will be sent immediately.</p>
      </main>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}
