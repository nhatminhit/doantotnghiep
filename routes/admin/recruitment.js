var express = require('express');
var router = express.Router();
const recruitment = require('../../controllers/admin/recruitment');
const auth = require('../../controllers/auth');

router.get('/list', recruitment.listRecruitment);
router.get('/read/id=:id', recruitment.readCVRecruitment);
router.post('/status', recruitment.updateStatusRecruitment);
router.get('/edit/id=:id', recruitment.getEditRecruitment);
router.get('/detail/status/id=:id', recruitment.updateDetailStatusRecruitment);
router.post('/send', recruitment.sendLetterRecruitment);
router.get('/delete/id=:id', recruitment.deleteRecruitment);

module.exports = router;