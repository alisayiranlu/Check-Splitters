import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cs_session');
    const storedParticipant = localStorage.getItem('cs_participant');
    if (stored && storedParticipant) {
      const s = JSON.parse(stored);
      const p = JSON.parse(storedParticipant);
      // Re-fetch to get fresh data
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
    } else {
      setLoading(false);
    }
  }, []);

  function saveSession(s, p) {
    setSession(s);
    setParticipant(p);
    localStorage.setItem('cs_session', JSON.stringify({ id: s.id, code: s.code, name: s.name }));
    localStorage.setItem('cs_participant', JSON.stringify(p));
  }

  function clearSession() {
    setSession(null);
    setParticipant(null);
    localStorage.removeItem('cs_session');
    localStorage.removeItem('cs_participant');
  }

  async function refreshSession() {
    if (!session) return;
    const fresh = await api.getSession(session.id);
    setSession(fresh);
    return fresh;
  }

  return (
    <SessionContext.Provider value={{ session, participant, loading, saveSession, clearSession, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
