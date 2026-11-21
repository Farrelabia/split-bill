const { createHash, randomBytes } = require('node:crypto');
const shareAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function invalid(message) {
  throw Object.assign(new Error(message), { status: 400 });
}

function prepareBill(input) {
  const { title, receiptDetails = '', total, payerId, splitType = 'equal', participants } = input ?? {};

  if (typeof title !== 'string' || !title.trim()) invalid('Judul wajib diisi.');
  if (typeof receiptDetails !== 'string') invalid('Rincian struk harus berupa teks.');
  if (!Number.isSafeInteger(total) || total <= 0) invalid('Total harus berupa bilangan bulat rupiah yang positif.');
  if (splitType !== 'equal') invalid('Tipe pembagian harus equal.');
  if (!Array.isArray(participants) || participants.length < 2) invalid('Minimal dua peserta diperlukan.');

  const ids = new Set();
  const remainder = total % participants.length;
  const baseShare = (total - remainder) / participants.length;
  const shares = participants.map((participant, index) => {
    const { id, name } = participant ?? {};
    if (typeof id !== 'string' || !id.trim() || id !== id.trim() || ids.has(id)) {
      invalid('Setiap peserta harus memiliki ID unik tanpa spasi di awal atau akhir.');
    }
    if (typeof name !== 'string' || !name.trim()) invalid('Nama setiap peserta wajib diisi.');
    ids.add(id);
    return { id, name: name.trim(), amount: baseShare + (index === 0 ? remainder : 0) };
  });
  if (!ids.has(payerId)) invalid('Orang yang menalangi harus termasuk dalam daftar peserta.');

  return { title: title.trim(), receiptDetails: receiptDetails.trim(), total, payerId, splitType, participants: shares };
}

function hashAdminCode(code) {
  return createHash('sha256').update(code).digest('hex');
}

async function createBill(bills, data) {
  const adminCode = randomBytes(12).toString('base64url');
  const adminCodeHash = hashAdminCode(adminCode);
  const now = new Date();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shareCode = Array.from(randomBytes(8), (byte) => shareAlphabet[byte & 31]).join('');
    const bill = { ...data, shareCode, adminCodeHash, createdAt: now, updatedAt: now };
    try {
      await bills.insertOne(bill);
      return { bill, adminCode };
    } catch (error) {
      if (error.code !== 11000 || error.keyPattern?.shareCode !== 1) throw error;
    }
  }
  throw new Error('Gagal menghasilkan kode berbagi yang unik.');
}

function publicBill(bill) {
  const { title, receiptDetails, total, payerId, splitType, participants, shareCode, createdAt, updatedAt } = bill;
  return { title, receiptDetails, total, payerId, splitType, participants, shareCode, createdAt, updatedAt };
}

module.exports = { prepareBill, hashAdminCode, createBill, publicBill };
