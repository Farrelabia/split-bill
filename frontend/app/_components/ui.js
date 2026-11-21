import Link from 'next/link';

const receipt = [
  '..xxxxxxxx..', '.xwwwwwwwwx.', 'gxwxxxxwwwx.', '.xwwwwwwwwxg',
  '.xwxwwwwxwx.', '.xwxwwwwxwx.', '.xwpxxxwpwx.', '.xwwwwwwwwx.',
  '.xwwwwwwwwx.', '.xxwxxwxxwx.', '..x.xx.xx.x.',
];

export function Mascot({ small = false, celebrate = false }) {
  return (
    <div className={`mascot-tile${small ? ' mascot-small' : ''}${celebrate ? ' mascot-celebrate' : ''}`} aria-hidden="true">
      <div className="mascot">
        {receipt.join('').split('').map((pixel, index) => <span key={index} data-pixel={pixel} />)}
      </div>
    </div>
  );
}

export function PageHeading({ title, description, back = '/', backLabel = 'Beranda' }) {
  return (
    <header className="page-heading">
      <Link className="back-link" href={back}><span aria-hidden="true">←</span> {backLabel}</Link>
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </header>
  );
}

export function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

export function errorAttributes(id, error) {
  return { 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-error` : undefined };
}

export function AdminCodeField({ id = 'admin-code', value, onChange, error, inputRef, visible = false, disabled = false }) {
  return (
    <Field id={id} label="Kode admin" error={error}>
      <input id={id} className="code-input" type={visible ? 'text' : 'password'} value={value} ref={inputRef} disabled={disabled}
        onChange={(event) => onChange(event.target.value)} placeholder="16 karakter" autoComplete="off"
        autoCapitalize="none" spellCheck={false} {...errorAttributes(id, error)} />
    </Field>
  );
}

export function PayerBadge() {
  return <span className="payer-badge">Menalangi</span>;
}

export function BillLoadState({ invalid, error, retry }) {
  const missing = invalid || error?.status === 404;
  const title = missing ? 'Tagihan tidak ditemukan' : error ? 'Gagal membuka tagihan' : 'Memuat tagihan…';
  return (
    <>
      <PageHeading title={title} />
      <section className="panel state-panel" aria-live="polite" aria-busy={!missing && !error}>
        {missing ? (
          <><p>Periksa kode atau minta link baru dari host.</p><Link className="button primary" href="/#buka-kode">Masukkan kode</Link></>
        ) : error ? (
          <><p role="alert">{error.message}</p><button className="button primary" onClick={retry}>Coba lagi</button></>
        ) : (
          <div className="skeleton" aria-hidden="true"><span /><span /><span /></div>
        )}
      </section>
    </>
  );
}
