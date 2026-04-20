import { Link, useLocation } from 'react-router-dom';

const icons = {
  session: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  receipts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  splits: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
      <path d="M8 12H4m12 0h4M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
};

export default function BottomNav({ sessionId }) {
  const location = useLocation();
  const base = `/session/${sessionId}`;
  const tabs = [
    { to: base, label: 'Session', icon: icons.session, match: path => path === base },
    { to: `${base}/receipts`, label: 'Receipts', icon: icons.receipts, match: path => path.includes('/receipts') && !path.includes('/splits') },
    { to: `${base}/splits`, label: 'Splits', icon: icons.splits, match: path => path.includes('/splits') },
    { to: `${base}/review`, label: 'Review', icon: icons.review, match: path => path.includes('/review') || path.includes('/payment-methods') },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = tab.match(location.pathname);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`bottom-nav-item${active ? ' active' : ''}`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
