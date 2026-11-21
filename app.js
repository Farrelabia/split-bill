const express = require('express');
const { billsRoutes } = require('./routes/bills');

function createApp(bills) {
  const app = express();
  app.use('/api/bills', billsRoutes(bills));
  app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status ?? 500;
    if (status >= 500) console.error('Gagal memproses permintaan:', error.name, error.code ?? '');
    const message = status >= 500 ? 'Terjadi kesalahan pada server.' : error.message;
    res.status(status).json({ error: message });
  });
  return app;
}

module.exports = { createApp };
