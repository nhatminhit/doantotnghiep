const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require("../../models/users");
const constant = require("../../commons/constant");
const response = require("../../commons/response");
const support = require("../../controllers/support");
const { Op } = require("sequelize");

// Đăng ký tài khoản khách hàng.
exports.register = async (req, res, next) => {
    res.render('customer/dang-ky', { title: "Đăng ký tài khoản", user: req.session.user, success: "", error: "" });
}

exports.registerAccount = async (req, res, next) => {
    const username = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const repeatPassword = req.body.repeatPassword;

    if (!username || !email || !phone || !password || !repeatPassword) {
        res.render('customer/dang-ky', { 
            title: "Đăng ký tài khoản", 
            user: req.session.user, 
            success: "", 
            error: "Bạn chưa nhập đầy đủ thông tin" });
        return;
    }

    if (password != repeatPassword) {
        res.render('customer/dang-ky', { 
            title: "Đăng ký tài khoản", 
            user: req.session.user, 
            success: "", 
            error: "Mật khẩu không khớp nhau" });
        return;
    }

    const existedUser = await User.findOne({
        where: {
            [Op.or]: [
                {username: username}, 
                {email: email},
                {phone: phone}
            ]
        }
    });
    if (existedUser) {
        res.render('customer/dang-ky', { 
            title: "Đăng ký tài khoản", 
            user: req.session.user, 
            success: "", 
            error: "Tài khoản người dùng đã tồn tại." });
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const createUser = await User.create({
        name: "New User",
        username: username,
        email: email,
        password: hash,
        phone: phone,
        avatar: "/avatar/anhdaidien.jpg",
        role_id: constant.ROLE.CUSTOMER,
    });

    res.render("customer/dang-ky", {
        title: "Đăng ký tài khoản", 
        user: req.session.user,
        success: "Đăng ký tài khoản thành công",
        error: ""
    });
};

//Đăng nhập
exports.login = async (req, res, next) => {
    res.render('customer/dang-nhap', { title: "Đăng nhập", user: req.session.user, error: "" });
}

exports.loginAccount = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.render('customer/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.USER_NOT_ENTERED });
        return;
    }

    const existedUser = await User.findOne({ where: { email: email } });
    if (!existedUser) {
        res.render('customer/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.USER_NOT_EXIST });
        return;
    }
    const validPassword = await bcrypt.compare(password, existedUser.password);
    if (!validPassword) {
        res.render('customer/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.INCORRECT_PASSWORD });
        return;
    }
    const user = {
        id: existedUser.id,
        name: existedUser.name,
        username: existedUser.username,
        avatar: existedUser.avatar,
        email: existedUser.email,
        phone: existedUser.phone,
        gender: existedUser.gender,
        address: existedUser.address,
        birthday: existedUser.birthday,
        role: existedUser.role_id
    }
    req.session.user = user;
    if (req.session.back) {
        res.redirect(req.session.back);
    } else {
        res.redirect("/");
    }
    next();
}

//Đăng xuất
exports.logout = async (req, res, next) => {
    req.session.destroy();
    res.redirect("/")
}

//Tài khoản của tôi
exports.myaccount = async (req, res, next) => {
    const getUser = await User.findOne({ where: { id: req.session.user.id } });
    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);
    res.render('customer/gioi-thieu-tai-khoan', { title: "Tài khoản của tôi", user: getUser, cart: cart, total: total });
}

//Hồ sơ cá nhân
exports.myProfile = async (req, res, next) => {
    const getUser = await User.findOne({ where: { id: req.session.user.id } });
    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);
    res.render('customer/ho-so-ca-nhan', { title: "Hồ sơ của tôi", error: response.ADDRESS_NOT_SET, user: getUser, error1: "", success: "", success2: "", cart: cart, total: total });
}

//Cập nhật hồ sơ cá nhân
exports.updateProfile = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const birthday = req.body.birthday.split("-").reverse().join("/");
    const gender = req.body.gender;
    const address = req.body.address;
    const getUser = await User.findOne({ where: { id: req.session.user.id } });
    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);

    if (!name || !email || !phone || !birthday || !gender || !address) {
        res.render('customer/ho-so-ca-nhan', { title: "Hồ sơ của tôi", error: response.ADDRESS_NOT_SET, user: getUser, error1: response.USER_NOT_ENTERED, success: "", success2: "", cart: cart, total: total });
    };
    const existedUser = await User.findOne({ where: { email: email } });
    if (!existedUser) {
        res.render('customer/ho-so-ca-nhan', { title: "Hồ sơ của tôi", error: response.ADDRESS_NOT_SET, user: getUser, error1: response.USER_NOT_EXIST, success: "", success2: "", cart: cart, total: total });
    }

    const updateProfile = await User.update({
        name: name,
        email: email,
        phone: phone,
        birthday: birthday,
        gender: gender,
        address: address
    }, {
        where: { id: existedUser.id }
    });
    res.render("customer/ho-so-ca-nhan", { title: 'Hồ sơ cá nhân', error: response.ADDRESS_NOT_SET, user: getUser, error1: "", success: response.UPDATE_PROFILE_SUCCESS, success2: "", cart: cart, total: total });
}

//Cập nhật ảnh đại diện
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatar");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg");
    }
});

const maxSize = 1 * 1000 * 1000;
const upload = multer({
    storage: storage,
    limit: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only support the " +
            "following filetypes - " +
            filetypes);
    },
}).single("avatar");

exports.avatar = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        if (req.file == undefined) {
            res.send("Không tìm thấy ảnh");
            return;
        }
        const fileAvatar = `/avatar/${req.file.filename}`;
        const updateAvatar = await User.update({ avatar: fileAvatar }, {
            where: { id: req.session.user.id }
        })
    });
    const getUser = await User.findOne({ where: { id: req.session.user.id } });

    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);

    res.render("customer/ho-so-ca-nhan", { title: 'Hồ sơ cá nhân', error: response.ADDRESS_NOT_SET, user: getUser, error1: "", success: "", success2: response.UPDATE_AVATAR_SUCCESS, cart: cart, total: total });
};

exports.changePassword = async (req, res, next) => {
    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);
    res.render('customer/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: "", error3: "", success: "", cart: cart, total: total });
}

exports.updatePassword = async (req, res, next) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const repeatPassword = req.body.repeatPassword;

    cart = await support.getCart(req.session.user.id);
    total = await support.getTotal(req.session.user.id);

    if (!currentPassword || !newPassword || !repeatPassword) {
        res.render('customer/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: response.USER_NOT_ENTERED, error2: "", error3: "", success: "", cart: cart, total: total });
        return;
    }
    if (newPassword != repeatPassword) {
        res.render('customer/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: response.PASSWORD_INCORRECT, error3: "", success: "", cart: cart, total: total });
        return;
    }
    const getUser = await User.findByPk(req.session.user.id);
    const checkPassword = await bcrypt.compare(currentPassword, getUser.password);

    if (!checkPassword) {
        res.render('customer/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: "", error3: response.CURRENTPASSWORD_NOT_CORRECT, success: "", cart: cart, total: total });
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    const updatePassword = await User.update({ password: hash }, { where: { id: getUser.id } });
    res.render('customer/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: "", error3: "", success: response.UPDATE_PASSWORD_SUCCESS, cart: cart, total: total });
}

exports.forgotPassword = async (req, res, next) => {
    res.render('customer/quen-mat-khau', { title: 'Quên mật khẩu', user: req.session.user, error1: "" });
}

exports.passwordRecovery = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const checkUser = await User.findOne({ where: { username: username, email: email } });
    cart = [];
    total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    if (!checkUser) {
        res.render('customer/quen-mat-khau', { title: 'Quên mật khẩu', user: req.session.user, error1: response.USER_NOT_EXIST, cart: cart, total: total });
    }

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var string_length = 6;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }

    const newPassword = randomstring;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(randomstring, salt);
    const updatePassword = await User.update({ password: hash }, { where: { email: email } });
    console.log("Mật khẩu: ", randomstring);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'quanfunny19@gmail.com',
            pass: 'kslwccyytmotngbc'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const content = `
    <div style="padding: 10px; background-color: #003375">
        <div style="padding: 10px; background-color: white;">
            <p>Mật khẩu mới của bạn là: <b style="color: blue;">${randomstring}</b></p>
        </div>
    </div>
`;
    const mainOptions = {
        from: 'quanfunny19@gmail.com',
        to: 'quanfunny19@gmail.com',
        subject: 'Khôi phục mật khẩu',
        html: content
    }
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

    const status = '/trang-thai-thanh-cong.png';
    const nameStatus = 'Khôi phục mật khẩu thành công';
    const descriptionStatus = 'Bạn hãy vào email để lấy mật khẩu mới và đăng nhập và trang website. Sau đó thay đổi mật khẩu mới.';
    const linkStatus = "/users/login";
    const nameLinkStatus = "Đăng nhập";
    res.render('customer/thong-bao-trang-thai', { title: "Thông báo", user: req.session.user, status: status, nameStatus: nameStatus, descriptionStatus: descriptionStatus, linkStatus: linkStatus, nameLinkStatus: nameLinkStatus, cart: cart, total: total });
}