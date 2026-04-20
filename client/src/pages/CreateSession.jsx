import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';

export default function CreateSession() {
  const navigate = useNavigate();
  const { saveSession } = useSession();
  const [ledgerName, setLedgerName] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!ledgerName.trim() || !yourName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.createSession(ledgerName.trim(), yourName.trim());
      const session = await api.getSession(result.sessionId);
      const me = session.participants.find(p => p.id === result.participantId);
      saveSession(session, me);
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="topbar-title">Create / Join Session</span>
        <div style={{ width: 30 }} />
      </div>

      <div className="page-content" style={{ paddingBottom: 32 }}>
        {/* Create */}
        <div className="card">
          <h2 style={{ marginBottom: 6 }}>Start a Split</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Create a new curated session for your upcoming shared expenses.
          </p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Ledger Name</label>
              <input
                className="input"
                placeholder="e.g. Weekend Retreat"
                value={ledgerName}
                onChange={e => setLedgerName(e.target.value)}
              />
            </div>
            <div>
              <label>Your Name</label>
              <input
                className="input"
                placeholder="e.g. Alex"
                value={yourName}
                onChange={e => setYourName(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading || !ledgerName.trim() || !yourName.trim()}>
              {loading ? 'Creating...' : 'Create Ledger →'}
            </button>
          </form>
        </div>

        <div className="divider">OR</div>

        {/* Join */}
        <JoinSection />
      </div>
    </div>
  );
}

function JoinSection() {
  const navigate = useNavigate();
  const { saveSession } = useSession();
  const [code, setCode] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e) {
    e.preventDefault();
    if (!code.trim() || !yourName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.joinSession(code.trim(), yourName.trim());
      const session = await api.getSession(result.sessionId);
      const me = session.participants.find(p => p.id === result.participantId);
      saveSession(session, me);
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: 6 }}>Join an Existing</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Enter an invite code to access an active shared ledger.
      </p>
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label>Access Code or Link</label>
          <input
            className="input"
            placeholder="Enter 6-digit code or paste link"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
          />
        </div>
        <div>
          <label>Your Name</label>
          <input
            className="input"
            placeholder="e.g. Jordan"
            value={yourName}
            onChange={e => setYourName(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
        <button className="btn btn-ghost" type="submit" disabled={loading || code.length < 6 || !yourName.trim()}>
          {loading ? 'Joining...' : 'Join Ledger'}
        </button>
      </form>
    </div>
  );
}
