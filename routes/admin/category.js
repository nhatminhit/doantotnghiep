var express = require('express');
var router = express.Router();
const category = require('../../controllers/admin/category');
const auth = require('../../controllers/auth');

router.get("/list", category.listCategory);
router.get("/add", category.addCategory);
router.post("/add", category.postAddCategory);
router.get("/edit/id=:id", category.editCategory);
router.post("/edit", category.postEditCategory);
router.get("/delete/id=:id", category.deleteCategory);

module.exports = router;