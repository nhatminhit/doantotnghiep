const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const User = require("../../models/users");
const Role = require("../../models/roles");
const response = require("../../commons/response");

Role.hasMany(User, {
    foreignKey: {
        name: 'role_id'
    }
});

User.belongsTo(Role, {
    foreignKey: {
        name: 'role_id'
    }
});

exports.login = async (req, res, next) => {
    res.render('admin/dang-nhap', { title: "Đăng nhập", user: req.session.user, error: "" });
}

exports.loginAccount = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.render('admin/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.USER_NOT_ENTERED });
        return;
    }

    const existedUser = await User.findOne({ where: { email: email } });
    if (!existedUser) {
        res.render('admin/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.USER_NOT_EXIST });
        return;
    }
    const validPassword = await bcrypt.compare(password, existedUser.password);
    if (!validPassword) {
        res.render('admin/dang-nhap', { title: 'Đăng nhập', user: req.session.user, error: response.INCORRECT_PASSWORD });
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
    res.redirect("/portal");
    next();
}

exports.forgotPassword = async (req, res, next) => {
    res.render('admin/khoi-phuc-mat-khau', {title: "Khôi phục mật khẩu", user: req.session.user, error1: ""});
}

exports.passwordRecovery = async (req, res, next) => {
    const email = req.body.email;
    const checkUser = await User.findOne({where: {email: email}});
    if (!checkUser) {
        res.render('admin/khoi-phuc-mat-khau', { title: 'Khôi phục mật khẩu', user: req.session.user, error1: response.USER_NOT_EXIST});
        return;
    }

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var string_length = 6;
    var randomstring = '';
    for (var i = 0; i< string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
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
        subject: 'Khôi phục mật khẩu - Admin',
        html: content
    }
    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' +  info.response);
        }
    });
    res.redirect('/portal/users/logIn');
}

exports.profile = async (req, res, next) => {
    const inforUser = await User.findByPk(req.session.user.id);
    res.render('admin/ho-so-ca-nhan', {title: "Hồ sơ của tôi", inforUser: inforUser, user: req.session.user});
}

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

exports.uploadAvatar = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const fileAvatar = `avatar/${req.file.filename}`;
        const updateAvatar = await User.update({ avatar: fileAvatar }, {
            where: { id: req.session.user.id }
        })
        console.log(req.file);
    });
    res.redirect("/portal/users/profile");
};

exports.updateProfile = async (req, res, next) => {
    const inforUser = await User.findByPk(req.session.user.id);
    res.render("admin/chinh-sua-thong-tin", {title: "Chỉnh sửa thông tin cá nhân", user: req.session.user, inforUser: inforUser})
}

exports.editProfile = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const gender = req.body.gender;
    const address = req.body.address;
    const updateProfile = await User.update({
        name: name,
        email: email,
        phone: phone,
        gender: gender,
        address: address,
    }, {
        where: {
            id: req.session.user.id
        }
    });
    res.redirect("/portal/users/profile");
}

exports.changePassword = async (req, res, next) => {
    res.render("admin/thay-doi-mat-khau", {title: "Thay đổi mật khẩu", user: req.session.user, error1: "", error2: "", success: ""});
}

exports.editPassword = async (req, res, next) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const repeatPassword = req.body.repeatPassword;

    if (newPassword != repeatPassword) {
        res.render('admin/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: response.PASSWORD_INCORRECT, error2: "", success: ""});
        return;
    }
    const getUser = await User.findByPk(req.session.user.id);
    const checkPassword = await bcrypt.compare(currentPassword, getUser.password);

    if (!checkPassword) {
        res.render('admin/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: response.CURRENTPASSWORD_NOT_CORRECT, success: ""});
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    const updatePassword = await User.update({ password: hash }, { where: { id: getUser.id } });
    res.render('admin/thay-doi-mat-khau', { title: 'Thay đổi mật khẩu', user: req.session.user, error1: "", error2: "", success: response.UPDATE_PASSWORD_SUCCESS});
}

exports.listUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listUser = await User.findAll({
        include: [
            {
                model: Role,
                required: false,
                attributes: ['description']
            }
        ]
    });
    const totalPage = parseInt(Math.ceil(listUser.length / perPage));
    res.render("admin/danh-sach-nguoi-dung", {
        title: "Danh sách người dùng", 
        user: req.session.user, 
        listUser: listUser.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    }); 
}

exports.getAddUser = async (req, res, next) => {
    res.render("admin/them-nguoi-dung", {title: "Thêm mới người dùng", user: req.session.user});
}

exports.postAddUser = async (req, res, next) => {
    const user = req.body;
    if (user.name == "" || user.username == "" || user.email == "" || user.password == "" || user.phone == "" || user.role == "") {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    const addUser = await User.create({
        name: user.name || "New User",
        username: user.username,
        email: user.email,
        password: hash,
        phone: user.phone,
        gender: user.gender || "",
        role_id: user.role,
        address: user.address || "",
        avatar: "/avatar/anhdaidien.jpg",
        birthday: user.birthday || "",
    });
    res.redirect('/portal/users/list');
}

exports.getEditUser = async (req, res, next) => {
    const id = req.params.id;
    const getUser = await User.findByPk(id);
    if (!getUser) {
        res.send("Người dùng không tồn tại");
        return;
    }
    res.render("admin/sua-thong-tin-nguoi-dung", {title: "Sửa thông tin người dùng", user: req.session.user, getUser: getUser});
}

exports.postEidtUser = async (req, res, next) => {
    const user = req.body;
    if (user.name == "" || user.username == "" || user.email == "" || user.password == "" || user.phone == "" || user.role == "") {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }
    const addUser = await User.update({
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender || "",
        role_id: user.role,
        address: user.address || "",
        birthday: user.birthday || "",
    }, {
        where: {
            id: user.id
        }
    });
    res.redirect('/portal/users/list');
}

exports.deleteUser = async (req, res, next) => {
    const id = req.params.id;
    const existedUser = await User.findByPk(id);
    if (!existedUser) {
        res.send("Người dùng không tồn tại");
    }
    const deleteUser = await User.destroy({where: {id: existedUser.id}});
    res.redirect("/portal/users/list");
}

exports.logout = async (req, res, next) => {
    req.session.destroy();
    res.redirect("/portal/users/login");
}