const multer = require('multer');
const path = require('path');
const News = require('../../models/news');
const support = require('../../controllers/support');

exports.listNews = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listNews = await News.findAll({
        attributes: ['id', 'title', 'image', 'createTime', 'creator', 'type', 'view']
    });
    const totalPage = parseInt(Math.ceil(listNews.length / perPage));
    res.render("admin/danh-sach-tin-tuc", {
        title: "Danh sách tin tức", 
        user: req.session.user, 
        listNews: listNews.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    });
}

exports.addNews = async (req, res, next) => {
    const dateCreated = support.dateCreate();
    res.render("admin/them-tin-tuc", {title: "Thêm mới tin tức", user: req.session.user, dateCreated: dateCreated});
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/news");
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
        const filetypes = /jpg|jpeg|png/;
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

exports.postAddNews = async (req, res, next) => {
    upload(req, res, async function() {
        const newsBody = req.body;
        if (newsBody.title == "" || newsBody.dateCreated == "" || newsBody.creator == "" || req.file == undefined || newsBody.content == "" || newsBody.description == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
        const createNews = await News.create({
            title: newsBody.title,
            content: newsBody.content,
            image: `/news/${req.file.filename}`,
            createTime: support.time(),
            creator: newsBody.creator,
            type: newsBody.type,
            description: newsBody.description,
            view: 0
        });
        res.redirect('/portal/news/list');
    }); 
    
}

exports.getEditNews = async (req, res, next) => {
    const id = req.params.id;
    const existedNews = await News.findByPk(id);
    if (!existedNews) {
        res.send("Tin tức không tồn tại");
        return;
    }
    res.render("admin/sua-thong-tin-tin-tuc", {
        title: "Sửa thông tin tin tức",
        user: req.session.user,
        detailNews: existedNews
    })
}

exports.postEditNews = async (req, res, next) => {
    upload(req, res, async function() {
        const newsBody = req.body;
        if (newsBody.title == "" || newsBody.dateCreated == "" || newsBody.creator == "" || newsBody.content == "" || newsBody.description == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
        const objectNews = {
            title: newsBody.title,
            content: newsBody.content,
            type: newsBody.type,
            description: newsBody.description
        }
        if (req.file != undefined) {
            objectNews.image = `/news/${req.file.filename}`
        }
        const updateNews = await News.update(objectNews, {
            where: {
                id: newsBody.id
            }
        })
        res.redirect(`/portal/news/list`)
    });
}

exports.deleteNews = async (req, res, next) => {
    const id = req.params.id;
    const existedNews = await News.findByPk(id);
    if (!existedNews) {
        res.send("Tin tức không tồn tại");
        return;
    }
    const deleteNews = await News.destroy({
        where: {
            id: existedNews.id
        }
    });
    res.redirect("/portal/news/list");
}