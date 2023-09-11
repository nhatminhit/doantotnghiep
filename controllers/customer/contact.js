const Contact = require("../../models/contacts");
const constant = require("../../commons/constant");
const support = require("../../controllers/support");

exports.contact = async (req, res, next) => {
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/lien-he", {
        title: "Liên hệ",
        user: req.session.user,
        cart: cart,
        total: total
    })
}

exports.sendContact = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const content = req.body.content;
    const createContact = await Contact.create({
        name: name,
        email: email,
        phone: phone,
        content: content,
        status: constant.STATUS_CONTACT.NO_PROCESS
    });
    const status = '/trang-thai-thanh-cong.png';
    const nameStatus = 'Góp ý kiến thành công';
    const descriptionStatus = 'Cảm ơn quý khách hàng đã góp ý kiến cho cửa hàng chúng tôi và chúng tôi sẽ nhận ý kiến và phát triển cửa hàng hoàn thiện hơn nữa.';
    linkStatus = "/";
    if (req.session.user != undefined) {
        linkStatus = "/home";
    } 
    const nameLinkStatus = "Về trang chủ"

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render('customer/thong-bao-trang-thai', {
        title: "Thông báo", 
        user: req.session.user, 
        status: status, 
        nameStatus: nameStatus, 
        descriptionStatus: descriptionStatus, 
        linkStatus: linkStatus, 
        nameLinkStatus: nameLinkStatus,
        cart: cart,
        total: total
    });
}