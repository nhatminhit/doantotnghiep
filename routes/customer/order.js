var express = require('express');
var router = express.Router();
const cart = require('../../controllers/customer/cart');
const pay = require('../../controllers/customer/order');
const auth = require('../../controllers/auth');

router.get('/', auth.authen, pay.order);
router.post('/', pay.payment);
router.get('/list', auth.authen, pay.listOrder);
router.get('/detail/id=:id', pay.detailOrder);
router.get('/received', pay.receivedOrder);
router.get('/cancel', pay.cancelOrder);
router.post('/vnpay', pay.vnpay);
router.get('/vnpay_return', pay.vnpay_return);
router.get('/payment/id=:id&totalMoney=:totalMoney', pay.paymentBill);
router.post('/cancel', pay.cancelOrderOnline);

module.exports = router;