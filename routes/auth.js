var express = require('express');
var router = express.Router();
const User = require('../models/users');
const index = require('../controllers/customer/index');
const auth = require('../controllers/auth');

/* GET home page. */
router.get('/authen', auth.authen);


module.exports = router;
