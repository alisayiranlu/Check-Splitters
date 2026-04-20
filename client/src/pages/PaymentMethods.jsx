import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';

export default function PaymentMethods() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { participant } = useSession();
  const storageKey = `cs_payment_wallet_${sessionId}`;
  const [selectedWallet, setSelectedWallet] = useState(() => localStorage.getItem(storageKey) || 'apple');

  useEffect(() => {
    localStorage.setItem(storageKey, selectedWallet);
  }, [storageKey, selectedWallet]);

  function selectWallet(wallet) {
    setSelectedWallet(wallet);
  }

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
          <button
            className={`card wallet-card${selectedWallet === 'apple' ? ' selected' : ' tonal'}`}
            type="button"
            onClick={() => selectWallet('apple')}
          >
            <div className="row-between">
              <div className="list-row">
                <div className="method-icon">
                  <strong>Pay</strong>
                </div>
                <div>
                  <h3>Apple Pay</h3>
                  <p className="muted">{selectedWallet === 'apple' ? 'Using Apple Pay for requests' : 'Tap to use Apple Pay'}</p>
                </div>
              </div>
              <span className="badge">{selectedWallet === 'apple' ? 'Selected' : 'Use'}</span>
            </div>
          </button>

          <button
            className={`card wallet-card${selectedWallet === 'google' ? ' selected' : ' tonal'}`}
            type="button"
            onClick={() => selectWallet('google')}
          >
            <div className="row-between">
              <div className="list-row">
                <div className="method-icon" style={{ background: 'var(--surface-high)', color: 'var(--text)' }}>
                  <strong>G</strong>
                </div>
                <div>
                  <h3>Google Pay</h3>
                  <p className="muted">{selectedWallet === 'google' ? 'Using Google Pay for requests' : 'Tap to use Google Pay'}</p>
                </div>
              </div>
              <span className="badge">{selectedWallet === 'google' ? 'Selected' : 'Use'}</span>
            </div>
          </button>
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
