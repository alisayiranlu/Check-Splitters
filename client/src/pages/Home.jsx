import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/useSession';
import SideMenu from '../components/SideMenu';

export default function Home() {
  const navigate = useNavigate();
  const { session, participant, clearSession } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = participant?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page no-nav">
      <header className="topbar">
        <button className="icon-btn" type="button" aria-label="Menu" onClick={() => setMenuOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <span className="brand">Check Splitter</span>
        {participant ? (
          <div className="avatar" style={{ width: 32, height: 32, background: participant.avatar_color ?? 'var(--primary)' }}>
            {participant.name?.[0]?.toUpperCase()}
          </div>
        ) : (
          <div className="avatar" style={{ width: 32, height: 32 }}>CS</div>
        )}
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1>
            {greeting},<br />
            {firstName}.
          </h1>
          <p className="muted">Ready to settle the score?</p>
        </section>

        {session && (
          <button className="card tonal row-between" type="button" onClick={() => navigate(`/session/${session.id}`)} style={{ textAlign: 'left' }}>
            <div className="list-row">
              <div className="method-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 3 6.5 12 11 21 6.5 12 2Z" />
                  <path d="M3 12 12 16.5 21 12" />
                  <path d="M3 17.5 12 22 21 17.5" />
                </svg>
              </div>
              <div>
                <h3>{session.name}</h3>
                <p className="muted">Invite code {session.code}</p>
              </div>
            </div>
            <span className="btn-ghost">Open</span>
          </button>
        )}

        <section className="list-stack">
          <button className="card row-between" type="button" onClick={() => navigate('/create')} style={{ textAlign: 'left' }}>
            <div className="list-row">
              <div className="method-icon" style={{ background: 'var(--primary)', color: '#fff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h3>Create Session</h3>
                <p className="muted">Start a new expense ledger for a shared meal, trip, or house.</p>
              </div>
            </div>
          </button>

          <button className="card tonal row-between" type="button" onClick={() => navigate('/join')} style={{ textAlign: 'left' }}>
            <div className="list-row">
              <div className="method-icon" style={{ background: 'var(--surface-high)', color: 'var(--text)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <div>
                <h3>Join Session</h3>
                <p className="muted">Enter a code or paste a link to join an existing tab.</p>
              </div>
            </div>
          </button>
        </section>
      </main>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sessionId={session?.id}
        participant={participant}
        clearSession={clearSession}
      />
    </div>
  );
}
