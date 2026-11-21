const { Router, json } = require('express');
const { billsController } = require('../controllers/bills');

function billsRoutes(bills) {
  const router = Router();
  const controller = billsController(bills);
  const parseJson = json();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.post('/', parseJson, controller.create);
  router.get('/:shareCode', controller.read);
  router.put('/:shareCode', controller.authorize, parseJson, controller.update);
  router.delete('/:shareCode', controller.authorize, controller.remove);
  return router;
}

module.exports = { billsRoutes };
