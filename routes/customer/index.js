var express = require('express');
var router = express.Router();
const index = require('../../controllers/customer/index');
const auth = require('../../controllers/auth');

// router.get('/', index.home);
router.get('/', index.homeLogin);
router.get('/search', index.searchProduct);
router.get('/introduce', index.introduce);
router.get('/support', index.listSupport);

module.exports = router;
