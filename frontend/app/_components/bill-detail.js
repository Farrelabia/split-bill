'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAdminCode, useAdminSession } from '../_lib/admin-session';
import { isAdminCode, money } from '../_lib/bill-input.mjs';
import { requestBill } from '../_lib/bills-api';
import { useBill } from '../_lib/use-bill';
import { AdminCodeField, BillLoadState, Mascot, PageHeading, PayerBadge } from './ui';

function selectForCopy(input) {
  input?.focus();
  input?.select();
}

function SharePanel({ shareCode }) {
  const path = `/bills/${shareCode}`;
  const [link, setLink] = useState(path);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => setLink(new URL(path, window.location.origin).href), [path]);

  async function copy(value, field) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(field === 'share-link' ? 'Link tersalin.' : 'Kode berbagi tersalin.');
      setCopied(true);
    } catch {
      setNotice('Clipboard tidak tersedia. Salin teks dari kolom yang dipilih.');
      selectForCopy(document.getElementById(field));
    }
  }

  return (
    <section className="panel share-panel" aria-labelledby="share-title"
      onAnimationEnd={() => setCopied(false)}>
      <div className="section-heading">
        <h2 id="share-title">Bagikan tagihan</h2>
        <Mascot small celebrate={copied} />
      </div>
      <div className="share-fields">
        <div className="copy-row">
          <label htmlFor="share-link">Link tagihan</label>
          <input id="share-link" type="text" value={link} readOnly onFocus={(event) => event.target.select()} />
          <button type="button" className="button primary" onClick={() => copy(link, 'share-link')}>Salin link</button>
        </div>
        <div className="copy-row">
          <label htmlFor="share-code">Kode berbagi</label>
          <input id="share-code" className="code-input" value={shareCode} readOnly onFocus={(event) => event.target.select()} />
          <button type="button" className="button secondary" onClick={() => copy(shareCode, 'share-code')}>Salin kode berbagi</button>
        </div>
      </div>
      <p className="feedback" role="status">{notice}</p>
    </section>
  );
}

function HostPanel({ bill }) {
  const { shareCode, title } = bill;
  const router = useRouter();
  const session = useAdminSession();
  const admin = useAdminCode(shareCode);
  const adminInput = useRef(null);
  const manualCopy = useRef(null);
  const panel = useRef(null);
  const dialog = useRef(null);
  const deleteInput = useRef(null);
  const deleting = useRef(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [notice, setNotice] = useState('');
  const [adminError, setAdminError] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [busy, setBusy] = useState(false);
  const code = admin.code.trim();
  const validCode = isAdminCode(code);
  const fromSession = session.codes.get(shareCode) === code;
  const openForHost = validCode && (fromSession || Boolean(admin.remembered));

  useEffect(() => {
    if (openForHost) panel.current.open = true;
  }, [openForHost]);

  function changeCode(value) {
    admin.setCode(value);
    setShowManualCopy(false);
    setAdminError('');
    setNotice('');
  }

  function requireCode(event) {
    if (validCode) return true;
    event.preventDefault();
    setAdminError('Masukkan kode admin yang valid (16 karakter).');
    adminInput.current.focus();
    return false;
  }

  async function copyAdminCode() {
    try {
      await navigator.clipboard.writeText(code);
      setNotice('Kode admin tersalin.');
    } catch {
      setShowManualCopy(true);
      setNotice('Clipboard tidak tersedia. Salin kode dari kolom yang dipilih.');
      requestAnimationFrame(() => selectForCopy(manualCopy.current));
    }
  }

  async function remove(event) {
    event.preventDefault();
    if (deleting.current) return;
    const enteredCode = deleteCode.trim();
    if (!isAdminCode(enteredCode)) {
      setDeleteError({ message: 'Masukkan kode admin yang valid (16 karakter).', invalidCode: true });
      deleteInput.current.focus();
      return;
    }
    deleting.current = true;
    setBusy(true);
    setDeleteError(null);
    try {
      await requestBill({ shareCode, method: 'DELETE', adminCode: enteredCode });
      admin.forget();
      dialog.current.close();
      router.replace('/?deleted=1');
    } catch (error) {
      deleting.current = false;
      setBusy(false);
      if (error.status === 401) {
        setDeleteError({ message: 'Kode admin salah. Masukkan kode admin tagihan ini.', invalidCode: true });
        requestAnimationFrame(() => deleteInput.current?.focus());
      } else {
        setDeleteError({ message: error.message });
      }
    }
  }

  return (
    <details className="panel host-panel" ref={panel}>
      <summary>Kelola tagihan</summary>
      <div className="host-controls">
        <p className="muted">Simpan kode admin untuk mengedit atau menghapus tagihan. Bagikan hanya kode berbagi atau link kepada peserta.</p>
        <AdminCodeField value={admin.code} onChange={changeCode} error={adminError} inputRef={adminInput}
          visible={fromSession && validCode} />
        {showManualCopy && <input aria-label="Kode admin untuk disalin" className="code-input" ref={manualCopy} readOnly value={code} />}
        <div className="actions">
          {validCode && <button type="button" className="button secondary" onClick={copyAdminCode}>Salin kode admin</button>}
          {validCode && admin.remembered !== code && (
            <button type="button" className="button secondary" onClick={() => setNotice(
              admin.remember(code) ? 'Kode admin tersimpan di browser ini.' : 'Browser tidak dapat menyimpan kode admin.',
            )}>Ingat di browser ini</button>
          )}
          {admin.remembered && (
            <button type="button" className="button secondary" onClick={() => {
              setShowManualCopy(false);
              setAdminError('');
              setNotice(admin.forget() ? 'Kode admin dilupakan dari browser ini.' : 'Browser tidak dapat menghapus kode admin.');
            }}>Lupakan kode di browser ini</button>
          )}
        </div>
        <p className="feedback" role="status">{notice}</p>
        <div className="actions manage-actions">
          <Link href={`/bills/${shareCode}/edit`} className="button primary" onClick={(event) => {
            if (requireCode(event)) session.codes.set(shareCode, code);
          }}>Edit tagihan</Link>
          <button type="button" className="button danger" onClick={() => dialog.current.showModal()}>Hapus tagihan</button>
        </div>
      </div>
      <dialog className="confirm-dialog" ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description"
        onClose={() => { setDeleteCode(''); setDeleteError(null); }}
        onCancel={(event) => { if (deleting.current) event.preventDefault(); }}>
        <h2 id="delete-title">Hapus tagihan?</h2>
        <p id="delete-description">Masukkan kode admin untuk menghapus “{title}” secara permanen.</p>
        <form className="confirm-form" onSubmit={remove} aria-busy={busy}>
          <AdminCodeField id="delete-admin-code" value={deleteCode} inputRef={deleteInput} disabled={busy}
            error={deleteError?.invalidCode ? deleteError.message : undefined}
            onChange={(value) => { setDeleteCode(value); setDeleteError(null); }} />
          {deleteError && !deleteError.invalidCode && <p className="field-error" role="alert">{deleteError.message}</p>}
          <div className="actions">
            <button type="button" className="button secondary" disabled={busy} onClick={() => dialog.current.close()}>Batal</button>
            <button className="button danger" disabled={busy}>{busy ? 'Menghapus…' : 'Ya, hapus tagihan'}</button>
          </div>
        </form>
      </dialog>
    </details>
  );
}

function BillDetails({ bill }) {
  const [selectedId, select] = useState(null);
  const participantList = useRef(null);
  const payer = bill.participants.find(({ id }) => id === bill.payerId);
  const selected = bill.participants.find(({ id }) => id === selectedId);
  return (
    <>
      <PageHeading title={bill.title} />
      <div className="columns detail-columns">
        <div className="panel-stack">
          <section className="panel overview" aria-labelledby="overview-title">
            <h2 id="overview-title">Ringkasan tagihan</h2>
            <div className="total-block">
              <span>Total tagihan</span>
              <strong className="amount">{money(bill.total)}</strong>
            </div>
            <p className="muted">Pembagian rata · {bill.participants.length} peserta</p>
            <p>Ditalangi oleh <strong>{payer.name}</strong></p>
            {bill.receiptDetails && <div className="receipt-details"><h3>Rincian struk</h3><p>{bill.receiptDetails}</p></div>}
          </section>
          <section className="panel" aria-labelledby="participant-title">
            <h2 id="participant-title">Peserta</h2>
            <ul className="participant-list" ref={participantList}>
              {bill.participants.map(({ id, name, amount }) => (
                <li key={id}>
                  <button type="button" className="participant-card" aria-pressed={selectedId === id} onClick={() => select(id)}>
                    <span className="participant-label">
                      <span className="selection-mark" aria-hidden="true">{selectedId === id ? '✓' : ''}</span>
                      <span className="person-name">{name} {id === bill.payerId && <PayerBadge />}</span>
                    </span>
                    <strong>{money(amount)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="panel-stack detail-sidebar">
          <section className={`panel personal-share${selected ? ' has-selection' : ''}`} aria-labelledby="personal-title" aria-live="polite">
            <h2 id="personal-title">Bagian kamu</h2>
            {selected ? (
              <>
                <p className="chosen-name">{selected.name}</p>
                <strong className="amount">{money(selected.amount)}</strong>
                <p>{selected.id === bill.payerId ? 'Sudah ditalangi' : <>Bayar ke <strong>{payer.name}</strong></>}</p>
                <button className="button secondary compact" onClick={() => {
                  participantList.current.querySelector('[aria-pressed="true"]')?.focus();
                  select(null);
                }}>Ganti nama</button>
              </>
            ) : <p className="muted">Pilih namamu untuk melihat bagianmu.</p>}
          </section>
          <SharePanel shareCode={bill.shareCode} />
        </div>
      </div>
      <HostPanel bill={bill} />
    </>
  );
}

export default function BillDetail({ shareCode }) {
  const session = useAdminSession();
  const [savedBill] = useState(() => session.savedBills.get(shareCode));
  const { bill, error, retry } = useBill(shareCode, savedBill);
  useEffect(() => { session.savedBills.delete(shareCode); }, [session, shareCode]);
  if (!bill) return <BillLoadState invalid={!shareCode} error={error} retry={retry} />;
  return <BillDetails key={bill.shareCode} bill={bill} />;
}
