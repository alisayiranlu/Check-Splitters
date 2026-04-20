import { useContext } from 'react';
import { SessionContext } from './SessionContextCore';

export function useSession() {
  return useContext(SessionContext);
}
