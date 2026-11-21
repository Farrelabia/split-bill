'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { normalizeShareCode } from '../_lib/bill-input.mjs';
import { requestBill } from '../_lib/bills-api';
import { errorAttributes, Field, Mascot } from './ui';

export default function HomeScreen({ deleted }) {
  const router = useRouter();
  const input = useRef(null);
  const opening = useRef(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => () => opening.current?.abort(), []);

  async function openBill(event) {
    event.preventDefault();
    if (opening.current) return;
    const shareCode = normalizeShareCode(code);
    if (!shareCode) {
      setError(code.trim() ? 'Masukkan kode berbagi yang valid (8 karakter).' : 'Masukkan kode berbagi.');
      input.current.focus();
      return;
    }
    const controller = new AbortController();
    opening.current = controller;
    setBusy(true);
    setError('');
    try {
      await requestBill({ shareCode, signal: controller.signal });
      if (!controller.signal.aborted) router.push(`/bills/${shareCode}`);
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(failure.message);
      setBusy(false);
      opening.current = null;
      input.current?.focus();
    }
  }

  return (
    <div className="home">
      {deleted && <p className="notice" role="status">Tagihan berhasil dihapus.</p>}
      <section className="panel home-hero" aria-labelledby="home-title">
        <div>
          <h1 id="home-title">Split Bill</h1>
          <p>Bagi tagihan dengan teman. Buat tagihan, bagikan kodenya, dan cek bagian masing-masing.</p>
          <Link href="/bills/new" className="button primary"><span className="pixel-plus" aria-hidden="true" />Buat tagihan</Link>
        </div>
        <Mascot />
      </section>
      <section className="panel home-join" aria-labelledby="join-title" id="buka-kode">
        <h2 id="join-title">Buka dengan kode</h2>
        <form onSubmit={openBill} className="join-form" noValidate>
          <Field id="share-code" label="Kode berbagi" error={error}>
            <input id="share-code" ref={input} className="code-input" type="text" placeholder="ABCD2345" value={code}
              onChange={(event) => { setCode(event.target.value); setError(''); }} autoComplete="off" autoCapitalize="characters"
              spellCheck={false} readOnly={busy} {...errorAttributes('share-code', error)} />
          </Field>
          <button className="button secondary" disabled={busy}>{busy ? 'Membuka…' : 'Buka tagihan'}</button>
        </form>
      </section>
    </div>
  );
}
