var express = require('express');
var router = express.Router();
const jobs = require('../../controllers/admin/jobs');
const auth = require('../../controllers/auth');

router.get('/list', jobs.listJobs);
router.get('/add', jobs.getAddJobs);
router.post('/add', jobs.postAddJobs);
router.get('/edit/id=:id', jobs.getEditJobs);
router.post('/edit', jobs.postEditJobs);
router.get('/delete/id=:id', jobs.deleteJobs);

module.exports = router;