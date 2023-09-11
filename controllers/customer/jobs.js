const multer = require("multer");
const path = require('path');
const Jobs = require("../../models/jobs");
const Recruitment = require("../../models/recruitments");
const constant = require("../../commons/constant");
const support = require("../../controllers/support");

exports.listJobs = async (req, res, next) => {
    const listJobs = await Jobs.findAll({
        attributes: ['id', 'title', 'timeType', 'experience', 'location', 'salary', 'deadline']
    })
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/tuyen-dung", {
        title: "Tuyển dụng",
        user: req.session.user,
        listJobs: listJobs,
        currentTime: support.timeCurrent(),
        cart: cart,
        total: total
    })
}

exports.detailJob = async (req, res, next) => {
    const id = req.params.id;
    const detailJob = await Jobs.findOne({
        where: {
            id: id
        }
    });

    const listJobs = await Jobs.findAll({
        attributes: ['id', 'title', 'timeType', 'experience', 'location', 'salary', 'deadline']
    })

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    
    res.render("customer/chi-tiet-tuyen-dung", {
        title: detailJob.title,
        user: req.session.user,
        detailJob: detailJob,
        listJobs: listJobs,
        currentTime: support.timeCurrent(),
        cart: cart,
        total: total
        });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/file");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const maxSize = 1 * 1000 * 1000;
const upload = multer({
    storage: storage,
    limit: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        const filetypes = /doc|docx|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only support the " +
            "following filetypes - " +
            filetypes);
    },
}).single("file");

exports.recruitment = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const recruitment = await Recruitment.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            file: `/file/${req.file.filename}`,
            introduce: req.body.introduce,
            status: constant.STATUS_RECRUITMENT.PENDING,
            createTime: support.time(),
            job_id: req.body.jobId
        });
        const status = '/trang-thai-thanh-cong.png';
        const nameStatus = 'Ứng tuyển công việc thành công';
        const descriptionStatus = 'Bạn hãy để ý số điện thoại để nhân viên sẽ liên lạc với bạn nếu CV bạn phù hợp';
        const linkStatus = "/jobs";
        const nameLinkStatus = "Công việc khác";
        var cart = [];
        var total = 0;
        if (req.session.user != undefined) {
            cart = await support.getCart(req.session.user.id);
            total = await support.getTotal(req.session.user.id);
        }
        res.render('customer/thong-bao-trang-thai', {title: "Thông báo", user: req.session.user, status: status, nameStatus: nameStatus, descriptionStatus: descriptionStatus, linkStatus: linkStatus, nameLinkStatus: nameLinkStatus, cart: cart, total: total});
    });
    
}