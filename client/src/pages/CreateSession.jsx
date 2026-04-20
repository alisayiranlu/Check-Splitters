import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';

export default function CreateSession({ initialMode = 'create' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="page no-nav">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate('/')} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Create or Join Session</span>
        <div className="avatar" style={{ width: 32, height: 32 }}>J</div>
      </header>

      <main className="page-content">
        <section className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            <h2>Start a Split</h2>
            <p className="muted">Create a curated session for upcoming shared expenses.</p>
            <div className="tabs" style={{ justifyContent: 'flex-start' }}>
              <button className={`tab${mode === 'create' ? ' active' : ''}`} type="button" onClick={() => setMode('create')}>
                Create
              </button>
              <button className={`tab${mode === 'join' ? ' active' : ''}`} type="button" onClick={() => setMode('join')}>
                Join
              </button>
            </div>
          </div>

          {mode === 'create' ? <CreateForm /> : <JoinForm />}
        </section>
      </main>
    </div>
  );
}

function CreateForm() {
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
    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label>Ledger Name</label>
        <input
          className="input"
          placeholder="Weekend Retreat"
          value={ledgerName}
          onChange={e => setLedgerName(e.target.value)}
        />
      </div>
      <div>
        <label>Your Name</label>
        <input
          className="input"
          placeholder="Alex"
          value={yourName}
          onChange={e => setYourName(e.target.value)}
        />
      </div>
      {error && <p className="danger-text" style={{ fontSize: '0.875rem' }}>{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading || !ledgerName.trim() || !yourName.trim()}>
        {loading ? 'Creating' : 'Create Ledger'}
        {!loading && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </button>
    </form>
  );
}

function JoinForm() {
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
    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label>Access Code</label>
        <input
          className="input"
          placeholder="Enter 6 digit code"
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
          placeholder="Jordan"
          value={yourName}
          onChange={e => setYourName(e.target.value)}
        />
      </div>
      {error && <p className="danger-text" style={{ fontSize: '0.875rem' }}>{error}</p>}
      <button className="btn btn-secondary" type="submit" disabled={loading || code.length < 6 || !yourName.trim()}>
        {loading ? 'Joining' : 'Join Ledger'}
      </button>
    </form>
  );
}
