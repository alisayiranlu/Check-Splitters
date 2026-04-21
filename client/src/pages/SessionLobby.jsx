import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import ConfirmationToast from '../components/ConfirmationToast';

export default function SessionLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, participant, refreshSession, clearSession } = useSession();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  if (!session) return null;

  function copyCode() {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const participants = session.participants ?? [];
  const receipts = session.receipts ?? [];

  return (
    <div className="page">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <span className="topbar-title">Session Lobby</span>
        {participant && (
          <div className="avatar" style={{ width: 32, height: 32, background: participant.avatar_color }}>
            {participant.name?.[0]?.toUpperCase()}
          </div>
        )}
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="eyebrow">Active Session</div>
          <h1>{session.name}</h1>
          <p className="muted">The admin has final authority to close out this ledger and distribute splits.</p>
        </section>

        <section className="card row-between">
          <div>
            <p className="muted">Invite Code</p>
            <div className="amount" style={{ fontSize: '1.75rem', letterSpacing: '0.16em' }}>{session.code}</div>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', minHeight: 38, padding: '8px 18px' }} onClick={copyCode}>
            Invite
          </button>
        </section>

        <section className="card">
          <div style={{ marginBottom: 22 }}>
            <div>
              <h3>Group Members</h3>
              <p className="muted">{participants.length} participant{participants.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="list-stack" style={{ gap: 18 }}>
            {participants.map(p => (
              <div key={p.id} className="row-between">
                <div className="list-row">
                  <div className="avatar" style={{ background: p.avatar_color }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <strong>{p.name}</strong>
                </div>
                {p.is_admin ? <span className="badge">Admin</span> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="empty-state">
          <h3>{receipts.length ? 'Ready for another receipt?' : 'Ready to start splitting?'}</h3>
          <p>{receipts.length ? `${receipts.length} receipt${receipts.length === 1 ? '' : 's'} in this session.` : 'Add your first receipt to this session.'}</p>
          <button className="btn" style={{ width: 'auto', background: '#fff', color: 'var(--primary)' }} onClick={() => navigate(`/session/${id}/receipts/add`)}>
            Add Receipt
          </button>
        </section>
      </main>

      {copied && <ConfirmationToast message="Invite code copied" />}
      <BottomNav sessionId={id} />
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sessionId={id}
        participant={participant}
        clearSession={clearSession}
      />
    </div>
  );
}
