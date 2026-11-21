'use client';

import { useEffect, useState } from 'react';
import { requestBill } from './bills-api';

export function useBill(shareCode, savedBill) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(() => savedBill ? { shareCode, attempt: 0, bill: savedBill } : null);

  useEffect(() => {
    if (!shareCode || (savedBill && attempt === 0)) return;
    const controller = new AbortController();
    requestBill({ shareCode, signal: controller.signal }).then(
      (bill) => {
        if (!controller.signal.aborted) setResult({ shareCode, attempt, bill });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ shareCode, attempt, error });
      },
    );
    return () => controller.abort();
  }, [shareCode, savedBill, attempt]);

  const current = result?.shareCode === shareCode && result.attempt === attempt ? result : null;
  return { ...current, retry: () => setAttempt((count) => count + 1) };
}
