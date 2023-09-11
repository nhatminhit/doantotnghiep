var express = require('express');
var router = express.Router();
const category = require('../../controllers/customer/category');
const auth = require('../../controllers/auth');

router.get('/id=:id', category.productByCategory);

module.exports = router;