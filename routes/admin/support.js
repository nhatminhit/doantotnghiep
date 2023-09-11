var express = require('express');
var router = express.Router();
const supportPage = require('../../controllers/admin/support');
const auth = require('../../controllers/auth');

router.get('/list', supportPage.listSupport);
router.get('/add', supportPage.getAddSupport);
router.post('/add', supportPage.postAddSupport);
router.get('/edit/id=:id', supportPage.getEditSupport);
router.post('/edit', supportPage.postEditSupport);
router.get('/delete/id=:id', supportPage.deleteSupport);

module.exports = router;