const Support = require('../../models/support');
const support = require('../../controllers/support');

exports.listSupport = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listSupport = await Support.findAll();
    const totalPage = parseInt(Math.ceil(listSupport.length / perPage));
    res.render("admin/danh-sach-ho-tro", {
        title: "Hỗ trợ",
        user: req.session.user,
        listSupport: listSupport.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.getAddSupport = async (req, res, next) => {
    res.render("admin/them-ho-tro", {title: "Thêm mới hỗ trợ", user: req.session.user});
}

exports.postAddSupport = async (req, res, next) => {
    const supportBody = req.body;
    if (supportBody.title == "" || supportBody.content == "") {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }
    const createSupport = await Support.create({
        title: supportBody.title,
        content: supportBody.content,
        createTime: support.time()
    })
    res.redirect("/portal/support/list");
}

exports.getEditSupport = async (req, res, next) => {
    const id = req.params.id;
    const existedSupport = await Support.findByPk(id);
    if (!existedSupport) {
        res.send("Không tồn tại bài hỗ trợ");
        return;
    }
    res.render("admin/sua-thong-tin-ho-tro", {
        title: "Sửa thông tin hỗ trợ",
        user: req.session.user,
        detailSupport: existedSupport
    });
}

exports.postEditSupport = async (req, res, next) => {
    const supportBody = req.body;
    if (supportBody.title == "" || supportBody.content == "") {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }
    const createSupport = await Support.update({
        title: supportBody.title,
        content: supportBody.content,
        createTime: support.time()
    }, {
        where: {
            id: supportBody.id
        }
    })
    res.redirect("/portal/support/list");
}

exports.deleteSupport = async (req, res, next) => {
    const id = req.params.id;
    const existedSupport = await Support.findByPk(id);
    if (!existedSupport) {
        res.send("Không tồn tại bài hỗ trợ");
        return;
    }
    const deleteSupport = await Support.destroy({
        where: {
            id: existedSupport.id
        }
    });
    res.redirect("/portal/support/list");
}