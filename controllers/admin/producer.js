const multer = require('multer');
const path = require('path');
const Producer = require('../../models/producers');

exports.listProducer = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listProducer = await Producer.findAll();
    const totalPage = parseInt(Math.ceil(listProducer.length / perPage));
    res.render('admin/danh-sach-nha-cung-cap', {
        title: 'Danh sách nhà cung cấp', 
        user: req.session.user, 
        listProducer: listProducer.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    });
}

exports.addProducer = async (req, res, next) => {
    res.render('admin/them-nha-cung-cap', {title: 'Thêm mới nhà cung cấp', user: req.session.user, error: ""});
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/producer");
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
}).single("image");

exports.postAddProducer = async (req, res, next) => {
    upload (req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const getProducer = req.body;
        const objectProducer = {
            name: getProducer.name,
            image: "",
            description: getProducer.description || ""
        };

        if (req.file != undefined) {
            objectProducer.image = `/producer/${req.file.filename}`
        } 
        if (getProducer.name == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
        const existedProducer = await Producer.findOne({
            where: {
                name: getProducer.name
            }
        });
        if (existedProducer) {
            res.render("admin/them-nha-cung-cap", {title: "Thêm mới nhà cung cấp", user: req.session.user, error: "Tên nhà cung cấp đã tồn tại"});
            return;
        }
        const addProducer = await Producer.create(objectProducer);
        console.log(objectProducer);
        res.redirect("/portal/producer/list");
    })
}

exports.editProducer = async (req, res, next) => {
    const id = req.params.id;
    const existedProducer = await Producer.findByPk(id);
    if (!existedProducer) {
        res.send("Nhà cung cấp không tồn tại");
        return;
    };
    const getProducer = await Producer.findOne({
        where: {
            id: existedProducer.id
        }
    });
    res.render('admin/sua-thong-tin-nha-cung-cap', {
        title: 'Sửa thông tin nhà cung cấp', 
        user: req.session.user, 
        error: "",
        getProducer: getProducer
    });
}

exports.postEditProducer = async (req, res, next) => {
    upload (req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const getProducer = req.body;
        const objectProducer = {
            name: getProducer.name,
            description: getProducer.description
        }
        if (req.file != undefined) {
            objectProducer.image = `/producer/${req.file.filename}`
        } 
        console.log(objectProducer);
        if (getProducer.name == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
        const updateProducer = await Producer.update(objectProducer, {
            where: {
                id: getProducer.id
            }
        });
        res.redirect("/portal/producer/list");
    })
}

exports.deleteProducer = async (req, res, next) => {
    const id = req.params.id;
    const existedProducer = await Producer.findByPk(id);
    if (!existedProducer) {
        res.send("Nhà cung cấp không tồn tại");
        return;
    }
    const deleteProducer = await Producer.destroy({
        where: {
            id: id
        }
    });
    res.redirect("/portal/producer/list");
}