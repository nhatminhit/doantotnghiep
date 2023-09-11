const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const Category = require("../../models/categories");
const Product = require("../../models/products");
const ImageProduct = require("../../models/imageproducts");
const Producer = require("../../models/producers");
const OrderDetail = require("../../models/orderDetail");
const Support = require("../../models/support");
const FavoriteProduct = require("../../models/favoriteProduct");
const constant = require("../../commons/constant");
const support = require("../../controllers/support");

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

Product.hasMany(OrderDetail, {
    foreignKey: {
        name: 'product_id'
    }
});

OrderDetail.belongsTo(Product, {
    foreignKey: {
        name: 'product_id'
    }
});

exports.home = async (req, res, next) => {
    const categories = await Category.findAll();
    const allProduct = await support.getAllProducts();
    const milk = await support.getProductType1(2);
    const eye = await support.getProductType1(6);
    const bloodPressure = await support.getProductType1(18);
    const children = await support.getProductType2('children');
    const adults = await support.getProductType2('adults');
    const elder = await support.getProductType2('elder');
    const hot = await support.getProductType3('hot');
    const beautify = await support.getProductType4([8, 9, 10]);
    const physiologic = await support.getProductType4([3, 4]);
    const nerve = await support.getProductType4([11, 12, 13]);
    const vitamin = await support.getProductType4([19, 20, 21]);
    const listNews = await support.getListNews();
    const listNewsSort = await support.getListNewsSort();
    const listJobs = await support.getListJobs(5);
    const averageRatingProduct = await support.averageRating();

    res.render("customer/trang-chu", {
        title: "Trang chủ",
        user: req.session.user,
        categories: categories,
        allProduct: allProduct,
        milk: milk,
        eye: eye,
        bloodPressure: bloodPressure,
        children: children,
        adults: adults,
        elder: elder,
        hot: hot,
        beautify: beautify,
        physiologic: physiologic,
        nerve: nerve,
        vitamin: vitamin,
        listNews: listNews,
        listNewsSort: listNewsSort,
        listJobs: listJobs,
        averageRatingProduct: averageRatingProduct,
        cart: [],
        total: 0
    });
}

exports.homeLogin = async (req, res, next) => {
    const categories = await Category.findAll();
    const allProduct = await support.getAllProducts();
    const milk = await support.getProductType1(2);
    const eye = await support.getProductType1(6);
    const bloodPressure = await support.getProductType1(18);
    const children = await support.getProductType2(constant.PRODUCT_OBJECT.CHILDREN);
    const adults = await support.getProductType2(constant.PRODUCT_OBJECT.ADULTS);
    const elder = await support.getProductType2(constant.PRODUCT_OBJECT.ELDER);
    const hot = await support.getProductType3('hot');
    const beautify = await support.getProductType4([8]);
    const physiologic = await support.getProductType4([2]);
    const nerve = await support.getProductType4([9, 18, 19]);
    const vitamin = await support.getProductType4([12, 13, 14, 16]);
    const listNews = await support.getListNews();
    const listNewsSort = await support.getListNewsSort();
    const listJobs = await support.getListJobs(5);
    const averageRatingProduct = await support.averageRating();
    const listProducer = await Producer.findAll({
        attributes: ['image']
    });

    var favorite_productId = []
    if (req.session.user != undefined) {
        const favorite = await FavoriteProduct.findAll({
            where: {
                user_id: req.session.user.id
            }
        });
        favorite.forEach((item) => {
            favorite_productId.push(item.product_id);
        })
    }

    var products_sold = [];
    const productsSold = await OrderDetail.findAll({
        attributes: ['product_id', [Sequelize.fn('count', Sequelize.col('product_id')), 'total']],
        group: ['product_id'],
        raw: true
    });

    productsSold.forEach((item1) => {
        products_sold.push(item1.product_id);
    })

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        total = await support.getTotal(req.session.user.id);
        cart = await support.getCart(req.session.user.id);
    }

    req.session.back = req.originalUrl;

    res.render("customer/trang-chu-login", {
        title: "Trang chủ",
        user: req.session.user,
        categories: categories,
        allProduct: allProduct,
        milk: milk,
        eye: eye,
        bloodPressure: bloodPressure,
        children: children,
        adults: adults,
        elder: elder,
        hot: hot,
        beautify: beautify,
        physiologic: physiologic,
        nerve: nerve,
        vitamin: vitamin,
        cart: cart,
        total: total,
        listNews: listNews,
        listNewsSort: listNewsSort,
        listJobs: listJobs,
        averageRatingProduct: averageRatingProduct,
        listProducer: listProducer,
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold,
    });
}

exports.searchProduct = async (req, res, next) => {
    const search = req.query.content;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'type', 'quantity'],
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
                }
            ],
            where: {
                name: {
                    [Op.like]: `%${search}%`
                }
            }
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const trademark = await Product.findAll({
        attributes: [Sequelize.fn('DISTINCT', Sequelize.col('trademark')), 'trademark'],
        order: [
            ['trademark']
        ]
    });

    var favorite_productId = []
    if (req.session.user != undefined) {
        const favorite = await FavoriteProduct.findAll({
            where: {
                user_id: req.session.user.id
            }
        });
        favorite.forEach((item) => {
            favorite_productId.push(item.product_id);
        })
    }

    var products_sold = [];
    const productsSold = await OrderDetail.findAll({
        attributes: ['product_id', [Sequelize.fn('count', Sequelize.col('product_id')), 'total']],
        group: ['product_id'],
        raw: true
    });

    productsSold.forEach((item1) => {
        products_sold.push(item1.product_id);
    })

    const averageRatingProduct = await support.averageRating();

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/tim-kiem", {
        title: "Tìm kiếm",
        user: req.session.user,
        categories: categories,
        pages: totalPage,
        current: page,
        perPage: perPage,
        listProduct: product.slice(start, end),
        averageRatingProduct: averageRatingProduct,
        cart: cart,
        total: total,
        trademark: trademark,
        search: search,
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold,
    });
}

exports.introduce = async (req, res, next) => {
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/gioi-thieu", {
        title: "Giới thiệu",
        user: req.session.user,
        cart: cart,
        total: total
    })
}

exports.listSupport = async (req, res, next) => {
    const listSupport = await Support.findAll({
        attributes: ['id', 'title', 'content']
    })
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/ho-tro", {
        title: "Hỗ trợ",
        user: req.session.user,
        listSupport: listSupport,
        cart: cart,
        total: total
    });
}