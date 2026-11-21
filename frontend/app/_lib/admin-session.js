'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isAdminCode } from './bill-input.mjs';

const AdminSession = createContext(null);
const storageKey = (shareCode) => `split-bill:admin:${shareCode}`;

export function AdminSessionProvider({ children }) {
  const [session] = useState(() => ({ codes: new Map(), savedBills: new Map() }));
  return <AdminSession.Provider value={session}>{children}</AdminSession.Provider>;
}

export function useAdminSession() {
  return useContext(AdminSession);
}

export function useAdminCode(shareCode) {
  const session = useAdminSession();
  const [code, setCode] = useState('');
  const [remembered, setRemembered] = useState('');

  useEffect(() => {
    let stored = '';
    try {
      const value = localStorage.getItem(storageKey(shareCode));
      if (value && isAdminCode(value)) stored = value;
    } catch {
      // Host controls also work with a code entered for this visit.
    }
    setRemembered(stored);
    setCode(session.codes.get(shareCode) ?? stored);
  }, [session, shareCode]);

  function remember(value) {
    try {
      localStorage.setItem(storageKey(shareCode), value);
      setRemembered(value);
      return true;
    } catch {
      return false;
    }
  }

  function forget() {
    try {
      localStorage.removeItem(storageKey(shareCode));
    } catch {
      if (remembered) return false;
    }
    session.codes.delete(shareCode);
    setRemembered('');
    setCode('');
    return true;
  }

  return { code, setCode, remembered, remember, forget };
}
