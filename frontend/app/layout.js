import Link from 'next/link';
import { AdminSessionProvider } from './_lib/admin-session';
import './globals.css';

export const metadata = {
  title: { default: 'Split Bill', template: '%s · Split Bill' },
  description: 'Buat dan bagikan tagihan bersama teman tanpa akun.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#main-content">Lewati ke konten</a>
        <header className="site-header">
          <div className="shell site-header-inner">
            <Link href="/" className="wordmark"><span className="receipt-mark" aria-hidden="true" />Split Bill</Link>
          </div>
        </header>
        <main className="shell main" id="main-content">
          <AdminSessionProvider>{children}</AdminSessionProvider>
        </main>
      </body>
    </html>
  );
}
