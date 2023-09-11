var express = require('express');
var router = express.Router();
const jobs = require('../../controllers/customer/jobs');
const auth = require('../../controllers/auth');

router.get('/', jobs.listJobs);
router.get('/detail/id=:id', jobs.detailJob);
router.post('/recruitment', jobs.recruitment);

module.exports = router;