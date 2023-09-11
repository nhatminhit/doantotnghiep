var express = require('express');
var router = express.Router();
const contact = require('../../controllers/customer/contact')
const auth = require('../../controllers/auth');

router.get('/', contact.contact);
router.post('/', contact.sendContact)

module.exports = router;