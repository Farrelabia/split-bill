const rupiah = new Intl.NumberFormat('id-ID');

export function money(amount) {
  return `Rp${rupiah.format(amount)}`;
}

export function normalizeShareCode(value) {
  const code = value.trim().toUpperCase();
  return /^[A-HJ-NP-Z2-9]{8}$/.test(code) ? code : null;
}

export function isAdminCode(code) {
  return /^[A-Za-z0-9_-]{16}$/.test(code);
}

export function billDraft(bill) {
  return {
    title: bill?.title ?? '',
    receiptDetails: bill?.receiptDetails ?? '',
    total: bill ? String(bill.total) : '',
    payerId: bill?.payerId ?? '',
    participants: bill?.participants.map(({ id, name }) => ({ id, name })) ?? [
      { id: 'participant-1', name: '' },
      { id: 'participant-2', name: '' },
    ],
  };
}

export function validateDraft(draft) {
  const { title, receiptDetails, participants, payerId } = draft;
  const total = Number(draft.total);
  const errors = {};
  if (!title.trim()) errors.title = 'Isi judul tagihan.';
  if (!/^\d+$/.test(draft.total) || !Number.isSafeInteger(total) || total <= 0) {
    errors.total = 'Masukkan nominal rupiah bulat yang lebih dari nol.';
  }
  if (participants.length < 2) errors.participants = 'Tambahkan minimal dua peserta.';
  for (const { id, name } of participants) {
    if (!name.trim()) errors[`name-${id}`] = 'Isi nama peserta.';
  }
  if (!participants.some(({ id, name }) => id === payerId && name.trim())) {
    errors.payerId = 'Pilih peserta yang menalangi.';
  }

  const count = participants.length;
  const remainder = total % count;
  const base = (total - remainder) / count;
  const amounts = errors.total || errors.participants
    ? []
    : participants.map((_, index) => base + (index === 0 ? remainder : 0));
  const data = Object.keys(errors).length ? null : {
    title: title.trim(),
    receiptDetails: receiptDetails.trim(),
    total,
    participants: participants.map(({ id, name }) => ({ id, name: name.trim() })),
    payerId,
    splitType: 'equal',
  };
  return { errors, data, amounts };
}
