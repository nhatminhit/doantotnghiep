var express = require('express');
var router = express.Router();
const cart = require('../../controllers/customer/cart');
const auth = require('../../controllers/auth');

router.get('/', auth.authen, cart.openCart);
router.post('/addProductCart', auth.authen, cart.addProductCart);
router.get('/delete/id=:id', cart.deleteCart);
router.post('/update', cart.updateCart);
router.get('/deleteAll', cart.deleteAllCart);

module.exports = router;