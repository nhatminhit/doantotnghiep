const Product = require('../../models/products');
const Category = require('../../models/categories');
const ImageProduct = require('../../models/imageproducts');
const Producer = require('../../models/producers');
const support = require('../../controllers/support');
const multer = require('multer');
const path = require('path');

Product.belongsTo(Category, {
    foreignKey: {
        name: 'category_id',
    }
});

Category.hasMany(Product, {
    foreignKey: {
        name: 'category_id',
    }
})

Product.hasMany(ImageProduct, {
    foreignKey: {
        name: 'product_id',
    }
});

ImageProduct.belongsTo(Product, {
    foreignKey: {
        name: 'product_id',
    }
});

Producer.hasMany(Product,  {
    foreignKey: {
        name: 'producer_id',
    }
});

Product.belongsTo(Producer, {
    foreignKey: {
        name: 'producer_id',
    }
})

exports.listProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listProduct = await Product.findAll({
        attributes: ['id', 'name', 'unit', 'quantity', 'price', 'oldPrice', 'dateCreated', 'view', 'type'],
        include: [
            {
                model: Category,
                required: false,
                attributes: ['name']
            },
            {
                model: ImageProduct,
                required: false,
                attributes: ['image']
            },
            {
                model: Producer,
                required: false,
                attributes: ['name']
            }
        ],
        // order: [
        //     ['id', 'DESC']
        // ]
    });
    const totalPage = parseInt(Math.ceil(listProduct.length / perPage));
    res.render("admin/danh-sach-san-pham", {
        title: "Danh sách sản phẩm", 
        user: req.session.user, 
        listProduct: listProduct.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    });
}

exports.addProduct = async (req, res, next) => {
    const dateCreated = support.dateCreate();
    const getCategory = await Category.findAll({
        attributes: ['id', 'name']
    });
    const getProducer = await Producer.findAll({
        attributes: ['id', 'name']
    });
    res.render("admin/them-san-pham", {
        title: "Thêm mới sản phẩm", 
        user: req.session.user, 
        dateCreated: dateCreated,
        getCategory: getCategory,
        getProducer: getProducer
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/products");
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
}).array("image");

exports.postAddProduct = async (req, res, next) => {
    upload(req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }
        const getProduct = req.body;

        const listImage = [];
        req.files.forEach((item) => {
            listImage.push({image: `/product/${item.filename}`});
        })
        if (getProduct.uses == "" || getProduct.description == ""  || getProduct.category == 0 || getProduct.producer == 0 || listImage.length == 0) {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
       
        const createProduct = await Product.create({
            name: getProduct.name,
            dateCreated: getProduct.dateCreated,
            quantity: getProduct.quantity,
            price: getProduct.price,
            oldPrice: getProduct.oldPrice || 0,
            unit: getProduct.unit,
            type: getProduct.type,
            object: getProduct.object,
            trademark: getProduct.trademark,
            dosageForms: getProduct.dosageForms,
            specification: getProduct.specification,
            expiry: getProduct.expiry,
            category_id: getProduct.category,
            producer_id: getProduct.producer,
            uses: getProduct.uses,
            description: getProduct.description,
            support: getProduct.support,
            ingredient: getProduct.ingredient,
            dosage: getProduct.dosage,
            sideEffects: getProduct.sideEffects,
            note: getProduct.note,
            preserve: getProduct.preserve,
            view: 0,
        })
        const listImageProduct = listImage.map((item) => ({
            product_id: createProduct.id,
            image: item.image,
          }));
        const createImageProduct = await ImageProduct.bulkCreate(listImageProduct);
        res.redirect("/portal/product/list");
    });
}

exports.editProduct = async (req, res, next) => {
    const id = req.params.id;
    const getCategory = await Category.findAll({
        attributes: ['id', 'name']
    });
    const getProducer = await Producer.findAll({
        attributes: ['id', 'name']
    });
    const getProduct = await Product.findOne({
        attributes: ['id', 'name', 'dateCreated', 'quantity', 'price', 'oldPrice', 'unit', 'type', 'object', 'trademark', 'dosageForms', 'specification', 'expiry', 'category_id', 'producer_id', 'uses', 'description', 'support', 'ingredient', 'dosage', 'sideEffects', 'note', 'preserve'],
        where: {
            id: id
        }
    });
    res.render("admin/sua-thong-tin-san-pham", {
        title: 'Sửa thông tin sản phẩm', 
        getCategory: getCategory,
        getProducer: getProducer,
        user: req.session.user, 
        getProduct: getProduct
    });
}

exports.postEditProduct = async (req, res, next) => {
    upload(req, res, async function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success, Image uploaded!");
        }

        const getProduct = req.body;

        const listImage = [];
        req.files.forEach((item) => {
            listImage.push({image: `/product/${item.filename}`});
        });

        if (getProduct.uses == "" || getProduct.description == ""  || getProduct.category == 0 || getProduct.producer == 0) {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
        }
       
        const createProduct = await Product.update({
            name: getProduct.name,
            quantity: getProduct.quantity,
            price: getProduct.price,
            oldPrice: getProduct.oldPrice,
            unit: getProduct.unit,
            type: getProduct.type,
            object: getProduct.object,
            trademark: getProduct.trademark,
            dosageForms: getProduct.dosageForms,
            specification: getProduct.specification,
            expiry: getProduct.expiry,
            category_id: getProduct.category,
            producer_id: getProduct.producer,
            uses: getProduct.uses,
            description: getProduct.description,
            support: getProduct.support,
            ingredient: getProduct.ingredient,
            dosage: getProduct.dosage,
            sideEffects: getProduct.sideEffects,
            note: getProduct.note,
            preserve: getProduct.preserve,
        }, {
            where: {
                id: getProduct.id
            }
        })
        if (listImage.length > 0) {
            const existedImageProduct = await ImageProduct.findAll({
                where: {
                    product_id: getProduct.id
                }
            });
            if (existedImageProduct.length > 0) {
                const deleteImageProduct = await ImageProduct.destroy({
                    where: {
                        product_id: getProduct.id
                    }
                })
            }
            const listImageProduct = listImage.map((item) => ({
                product_id: getProduct.id,
                image: item.image,
              }));
            const createImageProduct = await ImageProduct.bulkCreate(listImageProduct);
        }
        res.redirect("/portal/product/list");
    });
}

exports.deleteProduct = async (req, res, next) => {
    const id = req.params.id;
    const existedProduct = await Product.findByPk(id);
    const existedImageProduct = await ImageProduct.findAll({
        where: {
            product_id: id
        }
    });
    if (!existedProduct) {
        res.send("Không tồn tại sản phẩm");
        return;
    }
    const deleteProduct = await Product.destroy({
        where: {
            id: id
        }
    });
    if (existedImageProduct.length > 0) {
        const deleteImageProduct = await ImageProduct.destroy({
            where: {
                product_id: id
            }
        })
    }

    res.redirect("/portal/product/list");
}