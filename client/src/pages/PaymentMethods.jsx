import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';

export default function PaymentMethods() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { participant } = useSession();

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Payment Methods</span>
        <div className="avatar" style={{ width: 32, height: 32, background: participant?.avatar_color ?? 'var(--primary)' }}>
          {participant?.name?.[0]?.toUpperCase() ?? 'J'}
        </div>
      </div>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1>Payment Methods</h1>
          <p className="muted">Manage your linked cards and digital wallets.</p>
          <button className="btn btn-primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Payment Method
          </button>
        </section>

        <section className="list-stack">
          <h3 className="eyebrow">Digital Wallets</h3>
          <div className="card">
            <div className="row-between">
              <div className="list-row">
                <div className="method-icon">
                  <strong>Pay</strong>
                </div>
                <div>
                  <h3>Apple Pay</h3>
                  <p className="muted">Default for splitting bills</p>
                </div>
              </div>
              <span className="badge">Default</span>
            </div>
          </div>

          <div className="card tonal">
            <div className="row-between">
              <div className="list-row">
                <div className="method-icon" style={{ background: 'var(--surface-high)', color: 'var(--text)' }}>
                  <strong>G</strong>
                </div>
                <div>
                  <h3>Google Pay</h3>
                  <p className="muted">Tap to set as default</p>
                </div>
              </div>
              <button className="icon-btn" type="button" aria-label="More options">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="list-stack">
          <h3 className="eyebrow">Linked Cards</h3>
          {[
            ['Visa', 'Chase Sapphire Reserve', 'ending 4242', 'Active'],
            ['Amex', 'American Express Gold', 'ending 1005', 'Expired'],
          ].map(card => (
            <div className="card tonal" key={card[1]}>
              <div className="list-row">
                <div className="receipt-thumb" style={{ width: 56, height: 40 }}>
                  {card[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{card[1]}</h3>
                  <p className="muted">{card[2]} <span className="badge" style={{ marginLeft: 8 }}>{card[3]}</span></p>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ marginTop: 18 }} type="button">
                Edit
              </button>
            </div>
          ))}
        </section>
      </main>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
