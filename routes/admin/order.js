var express = require('express');
var router = express.Router();
const order = require('../../controllers/admin/order');
const auth = require('../../controllers/auth');

router.get('/list', order.listOrder);
router.get('/add', order.getAddOrder);
router.post('/add', order.postAddOrder);
router.get('/status/id=:id', order.statusOrder);
router.post('/status', order.updateStatusOrder);
router.post('/statusPayment', order.updateStatusPayment);
router.post('/ship', order.shipOrder);
router.post('/ship/status', order.statusShipOrder);
router.get('/deleteTransport/id=:id', order.deleteTransport);
router.post('/handler', order.hanlderOrder);
router.get('/edit/id=:id', order.editOrder);
router.get('/delete/id=:id', order.deleteOrder);

module.exports = router;