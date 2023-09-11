const nodemailer = require('nodemailer');
const Recruitment = require('../../models/recruitments');
const Jobs = require('../../models/jobs');
const User = require('../../models/users');
const constant = require('../../commons/constant');

Jobs.hasMany(Recruitment, {
    foreignKey: {
        name: 'job_id'
    }
});

Recruitment.belongsTo(Jobs, {
    foreignKey: {
        name: 'job_id'
    }
});

exports.listRecruitment = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listRecruitment = await Recruitment.findAll({
        attributes: ['id', 'name', 'phone', 'email', 'createTime', 'file', 'status'],
        include: [
            {
                model: Jobs,
                required: false,
                attributes: ['title']
            }
        ]
    });
    const totalPage = parseInt(Math.ceil(listRecruitment.length / perPage));
    res.render("admin/danh-sach-ung-tuyen", {
        title: "Danh sách ứng tuyển",
        user: req.session.user,
        listRecruitment: listRecruitment.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.readCVRecruitment = async (req, res, next) => {
    const id = req.params.id;
    const existedRecruitment = await Recruitment.findByPk(id);
    if (!existedRecruitment) {
        res.send("Ứng tuyển không tồn tại");
        return;
    }

    const getCVRecruitment = await Recruitment.findOne({
        attributes: ['name', 'file'],
        where: {
            id: existedRecruitment.id
        }
    });

    res.render("admin/doc-file-cv", {
        title: getCVRecruitment.name,
        user: req.session.user,
        getCVRecruitment: getCVRecruitment
    })
}

exports.updateStatusRecruitment = async (req, res, next) => {
    const statusBody = req.body;
    const objectRecruitment = {
        status: statusBody.status
    }
    if (statusBody.status == constant.STATUS_RECRUITMENT.APPROVED) {
        objectRecruitment.user_id = req.session.user.id
    }
    const updateStatus = await Recruitment.update(objectRecruitment, {
        where: {
            id: statusBody.id
        }
    });
    if (statusBody.page == "list") {
        res.redirect("/portal/recruitment/list");
    } else if (statusBody.page == "detail") {
        res.redirect(`/portal/recruitment/edit/id=${statusBody.id}`)
    }
}

exports.getEditRecruitment = async (req, res, next) => {
    const id = req.params.id;
    const existedRecruitment = await Recruitment.findByPk(id);
    if (!existedRecruitment) {
        res.send("Đơn ứng tuyển không tồn tại");
        return;
    }
    const detailRecruitment = await Recruitment.findOne({
        attribute: ['id', 'name', 'phone', 'email', 'createTime', 'status', 'user_id', 'introduce', 'file'],
        include: [
            {
                model: Jobs,
                required: false,
                attributes: ['id', 'title']
            }
        ],
        where: {
            id: existedRecruitment.id
        }
    })
    res.render("admin/chi-tiet-ung-tuyen", {
        title: "Chi tiết thông tin ứng tuyển",
        user: req.session.user,
        detailRecruitment: detailRecruitment
    })
}

exports.updateDetailStatusRecruitment = async (req, res, next) => {
    const id = req.params.id;
    const existedRecruitment = await Recruitment.findByPk(id);
    if (!existedRecruitment) {
        res.send("Đơn ứng tuyển không tồn tại");
        return;
    }
    const updateStatusRecruitment = await Recruitment.update({
        status: constant.STATUS_RECRUITMENT.APPROVED,
        user_id: req.session.user.id
    }, {
        where: {
            id: existedRecruitment.id
        }
    });
    res.redirect(`/portal/recruitment/edit/id=${id}`);
}

exports.sendLetterRecruitment = async (req, res, next) => {
    const letterBody = req.body;
    if (letterBody.email == "" || letterBody.letter == "") {
        res.send("Bạn chưa nhập nội dung thư");
        return;
    }

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

    const content = letterBody.letter;
    const mainOptions = {
        from: 'quanfunny19@gmail.com',
        to: 'quanfunny19@gmail.com',
        subject: 'Thư gửi công việc',
        html: content
    }
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
    res.redirect(`/portal/recruitment/edit/id=${letterBody.id}`)
}

exports.deleteRecruitment = async (req, res, next) => {
    const id = req.params.id;
    const existedRecruitment = await Recruitment.findByPk(id);
    if (!existedRecruitment) {
        res.send("Đơn ứng tuyển không tồn tại");
        return;
    }
    const deleteRecruitment = await Recruitment.destroy({
        where: {
            id: existedRecruitment.id
        }
    });
    res.redirect("/portal/recruitment/list");
}