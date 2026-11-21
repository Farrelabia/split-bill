const { createApp } = require('./app');
const { connectDatabase } = require('./config/database');

async function start() {
  const { MONGODB_URI, MONGODB_DB = 'split_bill', PORT = '3000' } = process.env;
  if (!MONGODB_URI) {
    throw Object.assign(new Error('Isi MONGODB_URI di file .env atau environment.'), { code: 'MISSING_MONGODB_URI' });
  }
  const port = Number(PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw Object.assign(new Error('PORT harus berupa angka antara 1 dan 65535.'), { code: 'INVALID_PORT' });
  }

  const { client, bills } = await connectDatabase(MONGODB_URI, MONGODB_DB);
  const server = createApp(bills).listen(port, () => {
    console.log(`Split Bill berjalan di http://localhost:${port}`);
  });
  server.on('error', async (error) => {
    console.error('Server gagal dibuka:', error.code);
    process.exitCode = 1;
    await client.close();
  });
}

start().catch((error) => {
  const configurationError = ['MISSING_MONGODB_URI', 'INVALID_PORT'].includes(error.code);
  console.error('Gagal memulai Split Bill:', configurationError ? error.message : error.code ?? error.name);
  process.exitCode = 1;
});
