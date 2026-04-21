import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';
import ConfirmationToast from '../components/ConfirmationToast';

export default function FinalReview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session, participant, clearSession } = useSession();
  const [review, setReview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pickingReceipt, setPickingReceipt] = useState(false);
  const [requestStatus, setRequestStatus] = useState('idle');
  const isAdmin = !!participant?.is_admin;

  useEffect(() => {
    api.getReview(sessionId).then(data => {
      if (!data.hasReceiptItems) {
        navigate(`/session/${sessionId}/receipts`, { replace: true });
        return;
      }
      if (data.hasUnassignedCash) {
        navigate(`/session/${sessionId}/splits`, { replace: true });
        return;
      }
      setReview(data);
    });
  }, [navigate, sessionId]);

  useEffect(() => {
    if (requestStatus !== 'sent') return undefined;
    const acceptTimer = setTimeout(() => setRequestStatus('accepted'), 1000);
    return () => clearTimeout(acceptTimer);
  }, [requestStatus]);

  function handleConfirm() {
    setConfirmed(true);
    setRequestStatus('sent');
  }

  function finishSession() {
    clearSession();
    navigate('/');
  }

  function handleEditSplits() {
    const receipts = review?.receipts ?? [];
    if (receipts.length === 1) {
      navigate(`/session/${sessionId}/receipts/${receipts[0].id}/splits`);
      return;
    }
    setPickingReceipt(prev => !prev);
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
            {isAdmin ? (
              <button className="btn btn-ghost" onClick={handleEditSplits}>
                Edit
              </button>
            ) : (
              <span className="muted">View only</span>
            )}
          </div>
          {isAdmin && pickingReceipt && (
            <div className="list-stack" style={{ gap: 10, marginBottom: 16 }}>
              {(review.receipts ?? []).map(r => (
                <button
                  key={r.id}
                  className="btn btn-secondary"
                  type="button"
                  style={{ justifyContent: 'space-between' }}
                  onClick={() => navigate(`/session/${sessionId}/receipts/${r.id}/splits`)}
                >
                  <span>{r.name}</span>
                  <span>{'>'}</span>
                </button>
              ))}
            </div>
          )}
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
      {requestStatus !== 'idle' && (
        <ConfirmationToast
          message={requestStatus === 'accepted' ? 'Payment requests accepted' : 'Sending payment requests'}
          variant="modal"
          status={requestStatus === 'accepted' ? 'success' : 'loading'}
          actionLabel={requestStatus === 'accepted' ? 'Finished' : undefined}
          onAction={finishSession}
          onDismiss={() => setRequestStatus('idle')}
        />
      )}
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
