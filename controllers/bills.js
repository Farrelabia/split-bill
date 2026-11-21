const { timingSafeEqual } = require('node:crypto');
const { prepareBill, hashAdminCode, createBill, publicBill } = require('../models/bill');

function notFound(res) {
  return res.status(404).json({ error: 'Tagihan tidak ditemukan.' });
}

function billsController(bills) {
  async function authorize(req, res, next) {
    const adminCode = req.get('x-admin-code');
    if (!adminCode || !/^[A-Za-z0-9_-]{16}$/.test(adminCode)) {
      return res.status(401).json({ error: 'Kode admin kosong atau salah.' });
    }

    const shareCode = req.params.shareCode.toUpperCase();
    const bill = await bills.findOne({ shareCode }, { projection: { adminCodeHash: 1 } });
    if (!bill) return notFound(res);

    const suppliedHash = Buffer.from(hashAdminCode(adminCode), 'hex');
    if (!timingSafeEqual(suppliedHash, Buffer.from(bill.adminCodeHash, 'hex'))) {
      return res.status(401).json({ error: 'Kode admin kosong atau salah.' });
    }

    res.locals.billId = bill._id;
    next();
  }

  return {
    authorize,
    async create(req, res) {
      const { bill, adminCode } = await createBill(bills, prepareBill(req.body));
      res.location(`/api/bills/${bill.shareCode}`).status(201).json({ ...publicBill(bill), adminCode });
    },
    async read(req, res) {
      const bill = await bills.findOne({ shareCode: req.params.shareCode.toUpperCase() });
      if (!bill) return notFound(res);
      res.json(publicBill(bill));
    },
    async update(req, res) {
      const data = prepareBill(req.body);
      const bill = await bills.findOneAndUpdate(
        { _id: res.locals.billId },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!bill) return notFound(res);
      res.json(publicBill(bill));
    },
    async remove(req, res) {
      const result = await bills.deleteOne({ _id: res.locals.billId });
      if (!result.deletedCount) return notFound(res);
      res.json({ message: 'Tagihan berhasil dihapus.' });
    },
  };
}

module.exports = { billsController };
