export async function requestBill({ shareCode, method = 'GET', data, adminCode, signal } = {}) {
  const path = shareCode ? `/api/bills/${encodeURIComponent(shareCode)}` : '/api/bills';
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      cache: 'no-store',
      headers: {
        ...(data && { 'Content-Type': 'application/json' }),
        ...(adminCode && { 'x-admin-code': adminCode }),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Koneksi terputus. Periksa jaringan lalu coba lagi.');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body) {
    const message = response.status === 404
      ? 'Tagihan tidak ditemukan.'
      : body?.error ?? 'Server belum bisa memproses permintaan. Coba lagi.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  return body;
}
