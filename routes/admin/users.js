var express = require('express');
var router = express.Router();
const user = require('../../controllers/admin/users');
const auth = require('../../controllers/auth');

router.get('/login', user.login);
router.post('/login', user.loginAccount);
router.get('/forgotPassword', user.forgotPassword);
router.post('/forgotPassword', user.passwordRecovery);
router.get('/profile', auth.authenAdmin, user.profile);
router.post('/uploadAvatar', user.uploadAvatar);
router.get('/updateProfile', user.updateProfile);
router.post('/updateProfile', user.editProfile);
router.get('/changePassword', user.changePassword);
router.post('/changePassword', user.editPassword);
router.get('/list', user.listUser);
router.get('/add', user.getAddUser);
router.post('/add', user.postAddUser);
router.get('/edit/id=:id', user.getEditUser);
router.post('/edit', user.postEidtUser);
router.get('/delete/id=:id', user.deleteUser);
router.get('/logout', user.logout);

module.exports = router;