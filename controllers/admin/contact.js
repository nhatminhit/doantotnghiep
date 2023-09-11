const nodemailer = require('nodemailer');
const Contact = require('../../models/contacts');
const constant = require('../../commons/constant');

exports.listContact = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listContact = await Contact.findAll();
    const totalPage = parseInt(Math.ceil(listContact.length / perPage));
    res.render("admin/danh-sach-lien-he", {
        title: "Danh sách liên hệ",
        user: req.session.user,
        listContact: listContact.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.detailContact = async (req, res, next) => {
    const id = req.params.id;
    const existedContact = await Contact.findByPk(id);
    if (!existedContact) {
        res.send("Liên hệ không tồn tại");
        return;
    }
    const detailContact = await Contact.findOne({
        where: {
            id: existedContact.id
        }
    });
    res.render("admin/chi-tiet-lien-he", {
        title: "Chi tiết thông tin liên hệ",
        user: req.session.user,
        detailContact: detailContact
    })
}

exports.sendLetterContact = async (req, res, next) => {
    const letterBody = req.body;
    if (letterBody.email == "" || letterBody.response == "") {
        res.send("Bạn chưa điền nội dung thư");
        return;
    }
    console.log(letterBody);
    const updateResponseContact = await Contact.update({
        response: letterBody.response,
        status: constant.STATUS_CONTACT.PROCESSED
    }, {
        where: {
            id: letterBody.id
        }
    })
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

    const content = letterBody.response;
    const mainOptions = {
        from: 'quanfunny19@gmail.com',
        to: 'quanfunny19@gmail.com',
        subject: 'Thư cảm ơn đóng góp ý kiến cho cửa hàng',
        html: content
    }
    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' +  info.response);
        }
    });
    res.redirect(`/portal/contact/detail/id=${letterBody.id}`);
}

exports.deleteContact = async (req, res, next) => {
    const id = req.params.id;
    const existedContact = await Contact.findByPk(id);
    if (!existedContact) {
        res.send("Ý kiến đóng góp của khách hàng không tồn tại");
        return;
    }
    const deleteContact = await Contact.destroy({
        where: {
            id: existedContact.id
        }
    });
    res.redirect("/portal/contact/list");
}