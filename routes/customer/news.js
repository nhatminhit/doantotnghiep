var express = require('express');
var router = express.Router();
const news = require('../../controllers/customer/news');
const auth = require('../../controllers/auth');

router.get('/', news.listNews);
router.get('/detail/id=:id', news.detailNews);
router.post('/comment', news.commentNews);

module.exports = router;