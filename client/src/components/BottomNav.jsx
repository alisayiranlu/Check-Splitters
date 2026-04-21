import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import ConfirmationToast from './ConfirmationToast';
import PaymentRequestNotice from './PaymentRequestNotice';

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
  const navigate = useNavigate();
  const { session, participant, clearSession } = useSession();
  const [hasUnassignedCash, setHasUnassignedCash] = useState(false);
  const [warning, setWarning] = useState('');
  const [paymentRequest, setPaymentRequest] = useState(null);
  const base = `/session/${sessionId}`;
  const canAccessSplitFlow = (session?.receipts ?? []).some(receipt => Number(receipt.item_count ?? 0) > 0);
  const tabs = [
    { to: base, label: 'Session', icon: icons.session, match: path => path === base },
    { to: `${base}/receipts`, label: 'Receipts', icon: icons.receipts, match: path => path.includes('/receipts') && !path.includes('/splits') },
    { to: `${base}/splits`, label: 'Splits', icon: icons.splits, gated: true, match: path => path.includes('/splits') },
    { to: `${base}/review`, label: 'Review', icon: icons.review, gated: true, reviewGate: true, match: path => path.includes('/review') || path.includes('/payment-methods') },
  ];

  useEffect(() => {
    let active = true;
    if (!sessionId || !canAccessSplitFlow) {
      return () => {
        active = false;
      };
    }

    api.getReview(sessionId)
      .then(data => {
        if (active) setHasUnassignedCash(Boolean(data.hasUnassignedCash));
      })
      .catch(() => {
        if (active) setHasUnassignedCash(false);
      });

    return () => {
      active = false;
    };
  }, [canAccessSplitFlow, sessionId, session?.receipts]);

  useEffect(() => {
    if (!warning) return undefined;
    const timer = setTimeout(() => setWarning(''), 1900);
    return () => clearTimeout(timer);
  }, [warning]);

  useEffect(() => {
    let active = true;
    if (!sessionId) return undefined;

    async function checkSessionEnded() {
      try {
        const fresh = await api.getSession(sessionId);
        if (active && fresh.ended_at) {
          clearSession();
          navigate('/');
        }
      } catch {
        if (active) {
          clearSession();
          navigate('/');
        }
      }
    }

    const interval = setInterval(checkSessionEnded, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [clearSession, navigate, sessionId]);

  useEffect(() => {
    let active = true;
    let interval;
    const isNonAdmin = participant && !participant.is_admin;

    if (!sessionId || !isNonAdmin) return undefined;

    async function loadPaymentRequests() {
      try {
        const data = await api.getPaymentRequests(sessionId, participant.id);
        if (active) setPaymentRequest(data.requests?.[0] ?? null);
      } catch {
        if (active) setPaymentRequest(null);
      }
    }

    loadPaymentRequests();
    interval = setInterval(loadPaymentRequests, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [participant, sessionId]);

  function showBlockedWarning(tab) {
    if (!canAccessSplitFlow) {
      setWarning('Add receipt items before opening this section');
      return;
    }
    if (tab.reviewGate && hasUnassignedCash) {
      setWarning('Assign all cash before Final Review');
    }
  }

  async function resolvePaymentRequest(status) {
    if (!paymentRequest || !participant) return;

    const current = paymentRequest;
    setPaymentRequest(null);
    try {
      await api.updatePaymentRequest(sessionId, current.id, participant.id, status);
      if (status === 'paid') setWarning('Payment marked as sent');
    } catch {
      setPaymentRequest(current);
    }
  }

  return (
    <>
      <nav className="bottom-nav">
        {tabs.map(tab => {
          const active = tab.match(location.pathname);
          const blocked = tab.gated && (!canAccessSplitFlow || (tab.reviewGate && hasUnassignedCash));

          if (blocked) {
            return (
              <button
                key={tab.to}
                className={`bottom-nav-item disabled${active ? ' active' : ''}`}
                type="button"
                aria-disabled="true"
                title={tab.reviewGate && hasUnassignedCash ? 'Assign all cash first' : 'Add receipt items first'}
                onClick={() => showBlockedWarning(tab)}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          }

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
      {warning && <ConfirmationToast message={warning} status="warning" />}
      <PaymentRequestNotice
        request={paymentRequest}
        onPay={() => resolvePaymentRequest('paid')}
        onDismiss={() => setPaymentRequest(null)}
      />
    </>
  );
}
