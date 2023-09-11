var express = require('express');
var router = express.Router();
const news = require('../../controllers/admin/news');
const auth = require('../../controllers/auth');

router.get('/list', news.listNews);
router.get('/add', news.addNews);
router.post('/add', news.postAddNews);
router.get('/edit/id=:id', news.getEditNews);
router.post('/edit', news.postEditNews);
router.get('/delete/id=:id', news.deleteNews);

module.exports = router; 