import { useNavigate } from 'react-router-dom';

export default function SideMenu({ open, onClose, sessionId, participant, clearSession }) {
  const navigate = useNavigate();
  const name = participant?.name || 'Julian Vane';

  function goToPaymentSettings() {
    onClose();
    if (sessionId) navigate(`/session/${sessionId}/payment-methods`);
    else navigate('/create');
  }

  function exitSession() {
    clearSession?.();
    onClose();
    navigate('/');
  }

  if (!open) return null;

  return (
    <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button className="drawer-scrim" type="button" onClick={onClose} aria-label="Close menu" />
      <aside className="side-drawer">
        <div>
          <div className="drawer-profile">
            <div className="avatar drawer-avatar" style={{ background: participant?.avatar_color || 'var(--primary)' }}>
              {initials(name)}
            </div>
            <h3>{name}</h3>
          </div>

          <nav className="drawer-links">
            <button className="drawer-link" type="button" onClick={goToPaymentSettings}>
              <MoneyIcon />
              <span>Payment Settings</span>
            </button>
            <button className="drawer-link" type="button">
              <HelpIcon />
              <span>{'Help & Support'}</span>
            </button>
            <button className="drawer-link" type="button">
              <UserEditIcon />
              <span>Change Name / Avatar</span>
            </button>
          </nav>
        </div>

        <div className="drawer-footer">
          <button className="drawer-link" type="button" onClick={exitSession}>
            <ExitIcon />
            <span>Exit Current Session</span>
          </button>
        </div>
      </aside>
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

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 10h1" />
      <path d="M17 14h1" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.8 2.8 0 0 1 5.2 1.4c0 2.1-2.7 2.2-2.7 4" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function UserEditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 4 4" />
      <path d="m21 10-6 6-2 1 1-2 6-6a1.4 1.4 0 0 1 2 0 1.4 1.4 0 0 1 0 2Z" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
