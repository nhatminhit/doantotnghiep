var express = require('express');
var router = express.Router();
const index = require('../../controllers/admin/index');
const auth = require('../../controllers/auth');

router.get('/', auth.authenAdmin, index.dashboard);

module.exports = router;