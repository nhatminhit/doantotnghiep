var express = require('express');
var router = express.Router();
const feedbackProduct = require('../../controllers/admin/feedbackProduct');
const auth = require('../../controllers/auth');

router.get('/list', feedbackProduct.listFeedbackProduct);
router.get('/reply/id=:id', feedbackProduct.getReplyFeedbackProduct);
router.post('/reply', feedbackProduct.postReplyFeedbackProduct);
router.post('/editReply', feedbackProduct.editReplyFeedbackProduct);
router.get('/delete/id=:id', feedbackProduct.deleteFeedbackProduct);
router.get('/deleteReply/id=:id', feedbackProduct.deleteReplyFeedbackProduct);
router.get('/approve', feedbackProduct.approveFeedbackProduct);
router.get('/unapproval', feedbackProduct.unapprovalFeedbackProduct)

module.exports = router;