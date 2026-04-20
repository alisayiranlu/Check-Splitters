import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

export default function SessionLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, participant, refreshSession } = useSession();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshSession();
  }, []);

  if (!session) return null;

  function copyCode() {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const participants = session.participants ?? [];

  return (
    <div className="page">
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="topbar-title">Session Lobby</span>
        {participant && (
          <div className="avatar" style={{ background: participant.avatar_color, width: 32, height: 32, fontSize: '0.8rem' }}>
            {participant.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="page-content">
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Active Session
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>{session.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 6 }}>
            The Admin has final authority to close out the ledger and distribute splits.
          </p>
        </div>

        {/* Invite code */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Invite Code</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--primary)' }}>
              {session.code}
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.875rem' }} onClick={copyCode}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Members */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3>Group Members</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {participants.length} Participant{participants.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem' }}
              onClick={copyCode}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Invite
            </button>
          </div>

          {participants.map(p => (
            <div key={p.id} className="list-row">
              <div className="avatar" style={{ background: p.avatar_color }}>
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, fontWeight: 500 }}>{p.name}</div>
              {p.is_admin ? <span className="badge badge-admin">ADMIN</span> : null}
            </div>
          ))}
        </div>

        {/* Empty state / New Receipt CTA */}
        {(session.receipts ?? []).length === 0 ? (
          <div className="empty-state">
            <h3>Ready to start splitting?</h3>
            <p>Add your first receipt to this session.</p>
            <button
              className="btn"
              style={{ background: '#fff', color: 'var(--primary)', width: 'auto', padding: '10px 20px' }}
              onClick={() => navigate(`/session/${id}/receipts/add`)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Receipt
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/session/${id}/receipts/add`)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Receipt
          </button>
        )}
      </div>

      <BottomNav sessionId={id} />
    </div>
  );
}
