import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { SessionContext } from './SessionContextCore';

function hasStoredSession() {
  return Boolean(localStorage.getItem('cs_session') && localStorage.getItem('cs_participant'));
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(hasStoredSession);
  const sessionId = session?.id;

  useEffect(() => {
    const stored = localStorage.getItem('cs_session');
    const storedParticipant = localStorage.getItem('cs_participant');
    if (!stored || !storedParticipant) return;

    const s = JSON.parse(stored);
    const p = JSON.parse(storedParticipant);
    api.getSession(s.id)
      .then(fresh => {
        setSession(fresh);
        setParticipant(p);
      })
      .catch(() => {
        localStorage.removeItem('cs_session');
        localStorage.removeItem('cs_participant');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = useCallback((s, p) => {
    setSession(s);
    setParticipant(p);
    localStorage.setItem('cs_session', JSON.stringify({ id: s.id, code: s.code, name: s.name }));
    localStorage.setItem('cs_participant', JSON.stringify(p));
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setParticipant(null);
    localStorage.removeItem('cs_session');
    localStorage.removeItem('cs_participant');
  }, []);

  const refreshSession = useCallback(async () => {
    if (!sessionId) return null;
    const fresh = await api.getSession(sessionId);
    setSession(fresh);
    return fresh;
  }, [sessionId]);

  const value = useMemo(() => ({
    session,
    participant,
    loading,
    saveSession,
    clearSession,
    refreshSession,
  }), [session, participant, loading, saveSession, clearSession, refreshSession]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
