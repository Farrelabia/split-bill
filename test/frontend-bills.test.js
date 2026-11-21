const assert = require('node:assert/strict');
const { test } = require('node:test');
const { billDraft, normalizeShareCode, validateDraft } = require('../frontend/app/_lib/bill-input.mjs');
const { prepareBill } = require('../models/bill');

const bill = {
  title: 'Makan siang',
  receiptDetails: '',
  total: 100000,
  payerId: 'ayu',
  participants: [
    { id: 'ayu', name: 'Ayu', amount: 33334 },
    { id: 'bima', name: 'Bima', amount: 33333 },
    { id: 'citra', name: 'Citra', amount: 33333 },
  ],
};

test('frontend menerima kode kecil dan menolak karakter di luar alfabet kode', () => {
  assert.equal(normalizeShareCode('  abcd2345  '), 'ABCD2345');
  assert.equal(normalizeShareCode('IO012345'), null);
});

test('edit menjaga ID dan urutan peserta serta menghitung pratinjau seperti server', () => {
  const draft = billDraft(bill);
  const { errors, data, amounts } = validateDraft({ ...draft, total: '100001', payerId: 'bima' });
  assert.deepEqual(errors, {});
  assert.deepEqual(data.participants.map(({ id }) => id), ['ayu', 'bima', 'citra']);
  assert.deepEqual(amounts, [33335, 33333, 33333]);
  assert.deepEqual(amounts, prepareBill(data).participants.map(({ amount }) => amount));
});

test('form menolak total pecahan, peserta tanpa nama, dan peserta penalang yang dihapus', () => {
  const draft = billDraft(bill);
  const { errors, data } = validateDraft({
    ...draft,
    total: '1.5',
    participants: [{ id: 'bima', name: ' ' }, { id: 'citra', name: 'Citra' }],
  });
  assert.ok(errors.total);
  assert.ok(errors['name-bima']);
  assert.ok(errors.payerId);
  assert.equal(data, null);
});
