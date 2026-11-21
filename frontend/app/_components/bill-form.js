'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAdminSession } from '../_lib/admin-session';
import { billDraft, isAdminCode, money, validateDraft } from '../_lib/bill-input.mjs';
import { requestBill } from '../_lib/bills-api';
import { AdminCodeField, errorAttributes, Field, PayerBadge } from './ui';

export default function BillForm({ bill, admin }) {
  const router = useRouter();
  const session = useAdminSession();
  const form = useRef(null);
  const adminInput = useRef(null);
  const nextId = useRef(3);
  const submitting = useRef(false);
  const [draft, setDraft] = useState(() => billDraft(bill));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [adminError, setAdminError] = useState('');
  const { errors, data, amounts } = validateDraft(draft);
  const visible = submitted ? errors : {};
  const namedPeople = draft.participants.filter(({ name }) => name.trim());

  function update(field, value) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  function rename(id, name) {
    setDraft((previous) => ({
      ...previous,
      participants: previous.participants.map((person) => person.id === id ? { ...person, name } : person),
    }));
  }

  function addPerson() {
    let id;
    do {
      id = `participant-${nextId.current++}`;
    } while (draft.participants.some((person) => person.id === id));
    const inputId = `participant-name-${draft.participants.length}`;
    update('participants', [...draft.participants, { id, name: '' }]);
    requestAnimationFrame(() => document.getElementById(inputId)?.focus());
  }

  function removePerson(id) {
    setDraft((previous) => ({
      ...previous,
      participants: previous.participants.filter((person) => person.id !== id),
      payerId: previous.payerId === id ? '' : previous.payerId,
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (submitting.current) return;
    setSubmitted(true);
    setFailure('');
    const code = admin?.code.trim();
    const invalidAdmin = bill && !isAdminCode(code);
    setAdminError(invalidAdmin ? 'Masukkan kode admin yang valid (16 karakter).' : '');
    if (!data || invalidAdmin) {
      requestAnimationFrame(() => form.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    submitting.current = true;
    setBusy(true);
    try {
      const { adminCode, ...savedBill } = await requestBill({
        shareCode: bill?.shareCode, method: bill ? 'PUT' : 'POST', data, adminCode: code,
      });
      session.codes.set(savedBill.shareCode, bill ? code : adminCode);
      session.savedBills.set(savedBill.shareCode, savedBill);
      router.replace(`/bills/${savedBill.shareCode}`);
    } catch (error) {
      setBusy(false);
      submitting.current = false;
      if (bill && error.status === 401) {
        setAdminError('Kode admin salah. Masukkan kode yang benar untuk menyimpan.');
        requestAnimationFrame(() => adminInput.current?.focus());
      } else {
        setFailure(error.message);
      }
    }
  }

  return (
    <div className="columns">
      <form className="panel" onSubmit={save} ref={form} noValidate aria-busy={busy}>
        <h2>Detail tagihan</h2>
        <fieldset className="form-fields" disabled={busy}>
          <Field id="bill-title" label="Judul" error={visible.title}>
            <input id="bill-title" value={draft.title} onChange={(event) => update('title', event.target.value)}
              placeholder="Contoh: Makan siang" required {...errorAttributes('bill-title', visible.title)} />
          </Field>
          <Field id="bill-total" label="Total dalam rupiah" error={visible.total}>
            <div className="money-field"><span aria-hidden="true">Rp</span>
              <input id="bill-total" inputMode="numeric" value={draft.total} onChange={(event) => update('total', event.target.value)}
                placeholder="100000" required {...errorAttributes('bill-total', visible.total)} />
            </div>
          </Field>
          <Field id="receipt-details" label="Rincian struk (opsional)">
            <textarea id="receipt-details" rows={2} value={draft.receiptDetails}
              onChange={(event) => update('receiptDetails', event.target.value)} placeholder="Contoh: 3 nasi goreng, 3 es teh, dan pajak" />
          </Field>
          <section className="people-fields" aria-labelledby="people-title">
            <div className="section-heading">
              <h3 id="people-title">Peserta</h3>
              <button type="button" className="button secondary compact" onClick={addPerson}>+ Tambah peserta</button>
            </div>
            <div className="name-list">
              {draft.participants.map(({ id, name }, index) => {
                const inputId = `participant-name-${index}`;
                const error = visible[`name-${id}`];
                return (
                  <div className="name-card" key={id}>
                    <Field id={inputId} label={`Nama peserta ${index + 1}`} error={error}>
                      <input id={inputId} value={name} onChange={(event) => rename(id, event.target.value)}
                        placeholder="Nama" required {...errorAttributes(inputId, error)} />
                    </Field>
                    <button type="button" className="button secondary icon-button" disabled={draft.participants.length <= 2}
                      aria-label={`Hapus peserta ${index + 1}${name.trim() ? `, ${name.trim()}` : ''}`} onClick={() => removePerson(id)}>
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
          <Field id="bill-payer" label="Siapa yang nalangin?" error={visible.payerId}>
            <select id="bill-payer" value={namedPeople.some(({ id }) => id === draft.payerId) ? draft.payerId : ''}
              onChange={(event) => update('payerId', event.target.value)} required {...errorAttributes('bill-payer', visible.payerId)}>
              <option value="">{namedPeople.length ? 'Pilih peserta' : 'Isi nama peserta terlebih dahulu'}</option>
              {namedPeople.map(({ id, name }) => <option key={id} value={id}>{name.trim()}</option>)}
            </select>
          </Field>
          {bill && <AdminCodeField value={admin.code} error={adminError} inputRef={adminInput}
            onChange={(value) => { admin.setCode(value); setAdminError(''); }} />}
          {failure && <p className="field-error" role="alert">{failure}</p>}
          <button className="button primary submit-button" disabled={busy}>
            {busy ? 'Menyimpan…' : bill ? 'Simpan perubahan' : 'Buat tagihan'}
          </button>
        </fieldset>
      </form>
      <section className="panel preview-panel" aria-labelledby="preview-title">
        <h2 id="preview-title">Pratinjau pembagian</h2>
        <p className="muted">Pembagian rata · {draft.participants.length} peserta</p>
        <div className="total-block">
          <span>Total tagihan</span>
          <strong className="amount">{amounts.length ? money(Number(draft.total)) : '—'}</strong>
        </div>
        <ul className="amount-list">
          {draft.participants.map(({ id, name }, index) => (
            <li key={id}>
              <span className="person-name">{name.trim() || `Peserta ${index + 1}`} {id === draft.payerId && <PayerBadge />}</span>
              <strong>{amounts.length ? money(amounts[index]) : '—'}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
