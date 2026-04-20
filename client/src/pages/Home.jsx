import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function Home() {
  const navigate = useNavigate();
  const { session, participant } = useSession();

  const firstName = participant?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div style={{ padding: '24px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Check Splitter</div>
        {participant && (
          <div className="avatar" style={{ background: participant.avatar_color ?? '#0D9488', width: 40, height: 40, fontSize: '1rem' }}>
            {participant.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="page-content">
        <div>
          <h1>
            {greeting},<br />
            <span style={{ color: 'var(--primary)' }}>{firstName}.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Ready to settle the score?</p>
        </div>

        {session && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/session/${session.id}`)}>
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Resume: {session.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code: {session.code}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/create')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: 'var(--primary)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div>
                <h3>Create Session</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Start a new tab for tonight's dinner, a weekend trip, or shared house expenses.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 12, color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Start new
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/join')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </div>
              <div>
                <h3>Join Session</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Enter an invite code or scan a QR to join an existing tab.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 12, color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Enter code
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
