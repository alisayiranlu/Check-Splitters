import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';

export default function SplitsOverview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [review, setReview] = useState(null);

  useEffect(() => {
    api.getReview(sessionId).then(data => {
      if (!data.hasReceiptItems) {
        navigate(`/session/${sessionId}/receipts`, { replace: true });
        return;
      }
      setReview(data);
    });
  }, [navigate, sessionId]);

  if (!review) {
    return (
      <div className="page">
        <div className="page-content"><p className="muted">Loading...</p></div>
        <BottomNav sessionId={sessionId} />
      </div>
    );
  }

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
          <p className="muted">Review each participant total before the final confirmation.</p>
        </section>

        <section className="card">
          <div className="list-stack">
            {review.participants.length === 0 ? (
              <p className="muted">No splits assigned yet.</p>
            ) : (
              review.participants.map((p, index) => (
                <div key={p.id} className="row-between">
                  <div className="list-row">
                    <div className={`avatar${index === 1 ? ' soft' : ''}`} style={{ background: index === 2 ? 'var(--warm)' : undefined }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3>{p.name}</h3>
                      <p className="muted">{p.itemCount} item{p.itemCount === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <h3>${p.total.toFixed(2)}</h3>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card tonal">
          <div className="row-between">
            <div>
              <p className="muted">Grand Total</p>
              <div className="amount" style={{ fontSize: '2rem' }}>${review.grandTotal.toFixed(2)}</div>
            </div>
            <div className="receipt-thumb">SUM</div>
          </div>
        </section>

        <button className="btn btn-primary" onClick={() => navigate(`/session/${sessionId}/review`)}>
          Continue to Final Review
        </button>
      </main>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
