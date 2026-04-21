import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';
import ConfirmationToast from '../components/ConfirmationToast';

export default function SplitsOverview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [review, setReview] = useState(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    api.getReview(sessionId).then(data => {
      if (!data.hasReceiptItems) {
        navigate(`/session/${sessionId}/receipts`, { replace: true });
        return;
      }
      setReview(data);
    });
  }, [navigate, sessionId]);

  useEffect(() => {
    if (!warning) return undefined;
    const timer = setTimeout(() => setWarning(''), 1900);
    return () => clearTimeout(timer);
  }, [warning]);

  function continueToReview() {
    if (review?.hasUnassignedCash) {
      setWarning('Assign all cash before Final Review');
      return;
    }
    navigate(`/session/${sessionId}/review`);
  }

  if (!review) {
    return (
      <div className="page">
        <div className="page-content"><p className="muted">Loading...</p></div>
        <BottomNav sessionId={sessionId} />
      </div>
    );
  }

  const receipts = (review.receipts ?? []).filter(receipt => Number(receipt.item_count ?? 0) > 0);
  const hasUnassignedCash = Boolean(review.hasUnassignedCash);

  return (
    <div className="page">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}/receipts`)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Splits</span>
        <div style={{ width: 32 }} />
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="eyebrow">{session?.name ?? 'Ledger'}</div>
          <h1>Who owes what</h1>
          <p className="muted">Review receipt by receipt, then open any receipt to adjust its split.</p>
        </section>

        <section className="list-stack">
          {receipts.map((receipt, index) => (
            <button
              key={receipt.id}
              className={`card split-receipt-card${index % 2 ? ' tonal' : ''}`}
              type="button"
              onClick={() => navigate(`/session/${sessionId}/receipts/${receipt.id}/splits`)}
            >
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div className="list-row">
                  <div className="receipt-thumb">REC</div>
                  <div>
                    <h3>{receipt.name}</h3>
                    <p className="muted">
                      {receipt.item_count} item{receipt.item_count === 1 ? '' : 's'} total
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="muted">Assigned</p>
                  <h3>${Number(receipt.splitTotal ?? 0).toFixed(2)}</h3>
                  {Number(receipt.unassignedTotal ?? 0) > 0 && (
                    <p className="danger-text" style={{ marginTop: 4, fontSize: '0.8125rem', fontWeight: 800 }}>
                      ${Number(receipt.unassignedTotal ?? 0).toFixed(2)} unassigned
                    </p>
                  )}
                </div>
              </div>

              <div className="receipt-split-list">
                {(receipt.participants ?? []).map((p, participantIndex) => (
                  <div key={p.id} className="row-between">
                    <div className="list-row">
                      <div className={`avatar${participantIndex === 1 ? ' soft' : ''}`} style={{ width: 32, height: 32, background: participantIndex === 2 ? 'var(--warm)' : p.avatar_color }}>
                        {initials(p.name)}
                      </div>
                      <div>
                        <strong>{p.name}</strong>
                        <p className="muted">{p.itemCount} item{p.itemCount === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                    <strong>${p.total.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <span className="split-edit-hint">Edit splits</span>
            </button>
          ))}
        </section>

        {hasUnassignedCash && (
          <section className="validation-note">
            <strong>Finish assigning cash</strong>
            <p>Final Review opens after every receipt has $0 unassigned.</p>
          </section>
        )}

        <section className="card tonal">
          <div className="row-between">
            <div>
              <p className="muted">Grand Total</p>
              <div className="amount" style={{ fontSize: '2rem' }}>${review.grandTotal.toFixed(2)}</div>
            </div>
            <div className="receipt-thumb">SUM</div>
          </div>
        </section>

        <button className={`btn btn-primary${hasUnassignedCash ? ' blocked' : ''}`} onClick={continueToReview} aria-disabled={hasUnassignedCash}>
          Continue to Final Review
        </button>
      </main>

      <BottomNav sessionId={sessionId} />
      {warning && <ConfirmationToast message={warning} status="warning" />}
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
