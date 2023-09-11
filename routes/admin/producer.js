var express = require('express');
var router = express.Router();
const producer = require('../../controllers/admin/producer');
const auth = require('../../controllers/auth');

router.get('/list', producer.listProducer);
router.get('/add', producer.addProducer);
router.post('/add', producer.postAddProducer);
router.get('/edit/id=:id', producer.editProducer);
router.post('/edit', producer.postEditProducer);
router.get('/delete/id=:id', producer.deleteProducer);

module.exports = router;