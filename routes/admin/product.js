var express = require('express');
var router = express.Router();
const product = require('../../controllers/admin/product');
const auth = require('../../controllers/auth');

router.get('/list', product.listProduct);
router.get('/add', product.addProduct);
router.post('/add', product.postAddProduct);
router.get('/edit/id=:id', product.editProduct);
router.post('/edit', product.postEditProduct);
router.get('/delete/id=:id', product.deleteProduct);

module.exports = router;