const assert = require('node:assert/strict');
const { test } = require('node:test');
const { billsController } = require('../controllers/bills');
const { prepareBill, hashAdminCode } = require('../models/bill');

const input = {
  title: 'Makan siang',
  total: 100000,
  payerId: 'ayu',
  participants: [
    { id: 'ayu', name: 'Ayu' },
    { id: 'bima', name: 'Bima' },
    { id: 'citra', name: 'Citra' },
  ],
};

test('menaruh seluruh sisa pada peserta pertama dan menjaga jumlah total', () => {
  const bill = prepareBill({ ...input, total: 100001, payerId: 'bima' });
  const amounts = bill.participants.map(({ amount }) => amount);
  assert.deepEqual(amounts, [33335, 33333, 33333]);
  assert.equal(amounts.reduce((sum, amount) => sum + amount, 0), bill.total);
});

test('menolak total tidak valid, peserta tidak valid, dan pembagian di luar MVP', () => {
  for (const changes of [
    { title: ' ' },
    { receiptDetails: null },
    { total: 0 },
    { total: 1.5 },
    { total: '5000' },
    { total: Number.MAX_SAFE_INTEGER + 1 },
    { payerId: 'unknown' },
    { participants: input.participants.slice(0, 1) },
    { participants: [input.participants[0], input.participants[0]] },
    { splitType: 'custom' },
  ]) {
    assert.throws(() => prepareBill({ ...input, ...changes }), { status: 400 });
  }
});

function response() {
  return {
    statusCode: 200,
    locals: {},
    location(url) { this.url = url; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('controller menjalankan CRUD dan menjaga kode admin tetap privat', async () => {
  let stored;
  let insertAttempts = 0;
  const controller = billsController({
    async insertOne(bill) {
      if (++insertAttempts === 1) {
        throw Object.assign(new Error('Duplicate'), { code: 11000, keyPattern: { shareCode: 1 } });
      }
      stored = { ...bill, _id: 'bill-id' };
    },
    async findOne({ shareCode }) {
      return shareCode === stored?.shareCode ? stored : null;
    },
    async findOneAndUpdate(filter, { $set }, options) {
      assert.deepEqual(filter, { _id: stored._id });
      assert.equal(options.returnDocument, 'after');
      stored = { ...stored, ...$set };
      return stored;
    },
    async deleteOne(filter) {
      assert.deepEqual(filter, { _id: stored._id });
      stored = null;
      return { deletedCount: 1 };
    },
  });

  const created = response();
  await controller.create({ body: input }, created);
  assert.equal(created.statusCode, 201);
  const { shareCode, adminCode } = created.body;
  assert.equal(insertAttempts, 2);
  assert.match(shareCode, /^[A-Z2-9]{8}$/);
  assert.match(adminCode, /^[A-Za-z0-9_-]{16}$/);
  assert.equal(created.url, `/api/bills/${shareCode}`);
  assert.equal(stored.adminCodeHash, hashAdminCode(adminCode));
  assert.equal('adminCode' in stored, false);
  assert.equal('adminCodeHash' in created.body, false);

  const request = {
    params: { shareCode: shareCode.toLowerCase() },
    body: { ...input, total: 100001 },
    get: () => adminCode,
  };
  const read = response();
  await controller.read(request, read);
  assert.equal(read.statusCode, 200);
  assert.equal(read.body.total, 100000);
  assert.equal('adminCode' in read.body, false);
  assert.equal('adminCodeHash' in read.body, false);

  for (const code of [undefined, 'wrong', (adminCode[0] === 'A' ? 'B' : 'A') + adminCode.slice(1)]) {
    const unauthorized = response();
    await controller.authorize({ ...request, get: () => code }, unauthorized, assert.fail);
    assert.equal(unauthorized.statusCode, 401);
  }

  const updated = response();
  await controller.authorize(request, updated, () => {});
  await controller.update(request, updated);
  assert.equal(updated.statusCode, 200);
  assert.deepEqual(updated.body.participants.map(({ amount }) => amount), [33335, 33333, 33333]);
  assert.equal('adminCode' in updated.body, false);
  assert.equal('adminCodeHash' in updated.body, false);
  assert.equal(updated.body.shareCode, shareCode);

  const deleted = response();
  await controller.authorize(request, deleted, () => {});
  await controller.remove(request, deleted);
  assert.equal(deleted.statusCode, 200);

  const missing = response();
  await controller.read(request, missing);
  assert.equal(missing.statusCode, 404);
});
