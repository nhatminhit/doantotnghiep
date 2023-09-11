var express = require('express');
var router = express.Router();
const contact = require('../../controllers/admin/contact');
const auth = require('../../controllers/auth');

router.get('/list', contact.listContact);
router.get('/detail/id=:id', contact.detailContact);
router.post('/send', contact.sendLetterContact); 
router.get('/delete/id=:id', contact.deleteContact);

module.exports = router;