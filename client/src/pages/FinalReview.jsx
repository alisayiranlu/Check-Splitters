import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

const PAYMENT_APPS = [
  {
    name: 'Venmo',
    color: '#3D95CE',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 2C19.4 3.7 19.8 5.3 19.8 7.3c0 5.9-5 13.7-9.1 19.2H2.2L0 2.6l7.3-.7 1.2 9.8C10.2 9 11.8 5.2 11.8 2.6c0-1.4-.2-2.3-.6-3.1L18.5 2z"/>
      </svg>
    ),
  },
  {
    name: 'Cash App',
    color: '#00C244',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.25 8.75l-.99-.33c-1.17-.39-1.67-.7-1.67-1.31 0-.55.49-1.03 1.49-1.03.94 0 1.72.36 2.37.86l1.42-1.72A5.44 5.44 0 0 0 14 4.28V2.5h-2v1.83C9.77 4.77 8.5 6.2 8.5 8c0 2.08 1.47 3.01 3.47 3.65l.97.32c1.2.4 1.81.74 1.81 1.47 0 .72-.66 1.19-1.75 1.19-1.07 0-2.09-.44-2.88-1.16L8.5 15.2a6.7 6.7 0 0 0 3.5 1.47V18.5h2v-1.87c2.44-.48 3.75-2.03 3.75-3.88 0-2.02-1.17-3.1-3.5-4z"/>
      </svg>
    ),
  },
  {
    name: 'Zelle',
    color: '#6D1ED4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 6h12.5L9 13h6.5V18H3v-1.5L9.5 11H3V6z"/>
        <path d="M15 6h6v5.5L17.5 15H21v3h-6v-4.5L18.5 10H15V6z" opacity=".6"/>
      </svg>
    ),
  },
  {
    name: 'PayPal',
    color: '#003087',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.1 22H3.7L6 7.2h5.4c2.3 0 3.9.4 4.8 1.3.9.8 1.2 2 .9 3.5-.6 3.1-2.8 4.7-6.5 4.7H8.2L7.1 22zm1.5-8.3h1.5c1.8 0 2.8-.8 3-2.5.1-.8 0-1.4-.4-1.8-.4-.4-1-.5-2-.5H9.2l-.6 4.8z"/>
      </svg>
    ),
  },
];

export default function FinalReview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [review, setReview] = useState(null);
  const [connectedApp, setConnectedApp] = useState(null);
  const [requestSent, setRequestSent] = useState({});

  useEffect(() => {
    api.getReview(sessionId).then(setReview);
  }, [sessionId]);

  function handleRequest(participantId) {
    setRequestSent(prev => ({ ...prev, [participantId]: true }));
  }

  function handleRequestAll() {
    const all = {};
    review.participants.forEach(p => { all[p.id] = true; });
    setRequestSent(all);
  }

  if (!review) return (
    <div className="page">
      <BottomNav sessionId={sessionId} />
    </div>
  );

  const subtotal = review.participants.reduce((s, p) => s + p.total, 0);
  const allRequested = review.participants.length > 0 &&
    review.participants.every(p => requestSent[p.id]);

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="topbar-title">Final Review</span>
        <div style={{ width: 30 }} />
      </div>

      <div className="page-content">
        <div>
          <h1>{session?.name}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>Total Amount</div>
          <div className="amount">${review.grandTotal.toFixed(2)}</div>
        </div>

        {/* Participant summary */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Participant Summary</h3>
            {connectedApp && !allRequested && (
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={handleRequestAll}
              >
                Request All
              </button>
            )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${p.total.toFixed(2)}</div>
                {connectedApp && (
                  <button
                    onClick={() => handleRequest(p.id)}
                    disabled={requestSent[p.id]}
                    style={{
                      padding: '5px 12px', borderRadius: 20, border: 'none',
                      cursor: requestSent[p.id] ? 'default' : 'pointer',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: requestSent[p.id] ? 'var(--primary-light)' : 'var(--primary)',
                      color: requestSent[p.id] ? 'var(--primary)' : '#fff',
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}
                  >
                    {requestSent[p.id] ? 'Sent ✓' : 'Request'}
                  </button>
                )}
              </div>
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

        {/* Payment app connection */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Connect a Payment App</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Send payment requests directly through your preferred app.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PAYMENT_APPS.map(app => {
              const isConnected = connectedApp === app.name;
              return (
                <button
                  key={app.name}
                  onClick={() => setConnectedApp(app.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 16px', borderRadius: 10,
                    border: `1.5px solid ${isConnected ? app.color : 'var(--border)'}`,
                    background: isConnected ? `${app.color}12` : 'var(--bg)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: app.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {isConnected ? 'Connected' : 'Tap to connect'}
                    </div>
                  </div>
                  {isConnected ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={app.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px', borderRadius: 10,
                border: '1.5px dashed var(--border)', background: 'transparent',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
              onClick={() => {}}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>Connect Bank Account</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct ACH transfers — coming soon</div>
              </div>
            </button>
          </div>
        </div>

        {allRequested && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontWeight: 600, color: 'var(--primary)' }}>All requests sent!</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Everyone will be notified through {connectedApp}.
            </p>
          </div>
        )}

        <button className="btn btn-ghost" onClick={() => navigate(`/session/${sessionId}`)}>
          Back to Session
        </button>
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
