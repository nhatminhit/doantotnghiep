var express = require('express');
var router = express.Router();
const commentNews = require('../../controllers/admin/commentNews');
const auth = require('../../controllers/auth');

router.get('/list', commentNews.listCommentNews);
router.get('/reply/id=:id', commentNews.getRepliesNews);
router.post('/reply', commentNews.postRepliesNews);
router.post('/editReply', commentNews.editRepliesNews);
router.get('/delete/id=:id', commentNews.deleteCommentNews);
router.get('/deleteReply/id=:id', commentNews.deleteRepliesNews);
router.get('/approve', commentNews.approveCommentNews);
router.get('/unapproval', commentNews.unapprovalCommentNews)

module.exports = router;