var express = require('express');
var router = express.Router();
const user = require('../../controllers/customer/users');
const auth = require('../../controllers/auth');

// Đăng ký tài khoản khách hàng.
router.get('/register', user.register);
router.post('/registerAccount', user.registerAccount);

//Đăng nhập tài khoản
router.get('/login', user.login)
router.post('/loginAccount', user.loginAccount);

//Đăng xuất tài khoản
router.get('/logout', user.logout);

//Tài khoản của tôi
router.get('/myaccount', auth.authen, user.myaccount);

//Hồ sơ cá nhân
router.get('/myprofile', auth.authen, user.myProfile);

//Cập nhật thông tin cá nhân
router.post('/updateProfile', user.updateProfile);

//Upload avatar
router.post('/uploadAvatar', user.avatar);

//Trang thay đổi mật khẩu
router.get('/changePassword', auth.authen, user.changePassword);

//Cập nhật mật khẩu khác
router.post('/updatePassword', user.updatePassword);

//Quên mật khẩu
router.get('/forgotPassword', user.forgotPassword);

//Khôi phục mật khẩu
router.post('/passwordRecovery', user.passwordRecovery);

module.exports = router;
