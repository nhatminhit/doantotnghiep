const multer = require('multer');
const path = require('path');
const Category = require("../../models/categories");

exports.listCategory = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listCategory = await Category.findAll();
    const totalPage = parseInt(Math.ceil(listCategory.length / perPage));
    res.render("admin/danh-sach-danh-muc", {
        title: "Danh sách danh mục", 
        user: req.session.user, 
        listCategory: listCategory.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    });
}

exports.addCategory = async (req, res, next) => {
    res.render("admin/them-danh-muc", {title: "Thêm mới danh mục", user: req.session.user})
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/categories");
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

exports.postAddCategory = async (req, res, next) => {
    upload(req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const getCategory = req.body;
        const addCategory = await Category.create({
            name: getCategory.name,
            image: `/category/${req.file.filename}`,
            description: getCategory.description || ""
        });
        res.redirect("/portal/category/list");
    });
}

exports.editCategory = async (req, res, next) => {
    const id = req.params.id;
    const existedCategory = await Category.findByPk(id);
    if (!existedCategory) {
        res.send("Danh mục không tồn tại");
        return;
    }
    res.render("admin/sua-thong-tin-danh-muc", {title: "Sửa thông tin danh mục", user: req.session.user, getCategory: existedCategory});
}

exports.postEditCategory = async (req, res, next) => {
    upload(req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const getCategory = req.body;
        const addCategory = await Category.update({
            name: getCategory.name,
            image: `/category/${req.file.filename}`,
            description: getCategory.description || ""
        }, {
            where: {
                id: getCategory.id
            }
        });
        res.redirect("/portal/category/list");
    });
}

exports.deleteCategory = async (req, res, next) => {
    const id = req.params.id;
    const existedCategory = await Category.findByPk(id);
    if (!existedCategory) {
        res.send("Danh mục không tồn tại");
        return;
    }
    const deleteCategory = await Category.destroy({where: {id: existedCategory.id}});
    res.redirect("/portal/category/list");
}