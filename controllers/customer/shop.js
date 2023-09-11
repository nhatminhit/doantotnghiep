const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const User = require("../../models/users");
const Category = require("../../models/categories");
const Product = require("../../models/products");
const ImageProduct = require("../../models/imageproducts");
const Producer = require("../../models/producers");
const FeedbackProduct = require("../../models/feedbacks");
const OrderDetail = require('../../models/orderDetail');
const FavoriteProduct = require('../../models/favoriteProduct');
const Replies = require('../../models/replies');
const support = require("../../controllers/support");
const Cart = require('../../models/cart');

Product.belongsTo(Category, {
    foreignKey: {
        name: 'category_id',
    }
});

Category.hasMany(Product, {
    foreignKey: {
        name: 'category_id',
    }
});

Product.hasMany(ImageProduct, {
    foreignKey: {
        name: 'product_id',
    }
});

ImageProduct.belongsTo(Product, {
    foreignKey: {
        name: 'product_id',
    }
})

Producer.hasMany(Product, {
    forignKey: {
        name: 'producer_id'
    }
})

Product.belongsTo(Producer, {
    foreignKey: {
        name: 'producer_id'
    }
})

User.hasMany(FeedbackProduct, {
    foreignKey: {
        name: 'user_id'
    }
});

FeedbackProduct.belongsTo(User, {
    foreignKey: {
        name: 'user_id'
    }
});

Product.hasMany(FavoriteProduct, {
    foreignKey: {
        name: 'product_id'
    }
});

FavoriteProduct.belongsTo(Product, {
    foreignKey: {
        name: 'product_id'
    }
});

FeedbackProduct.hasMany(Replies, {
    foreignKey: {
        name: 'feedbackProduct_id'
    }
});

Replies.belongsTo(FeedbackProduct, {
    foreignKey: {
        name: 'feedbackProduct_id'
    }
});

exports.store = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            ]
        }
    )

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

    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const trademark = await Product.findAll({
        attributes: [Sequelize.fn('DISTINCT', Sequelize.col('trademark')), 'trademark'],
        order: [
            ['trademark']
        ]
    });

    const averageRatingProduct = await support.averageRating();

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    req.session.back = req.originalUrl;

    res.render("customer/cua-hang", {
        title: "Cửa hàng thuốc",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.newProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            order: [
                ['dateCreated', 'DESC'],
                [{ model: ImageProduct }, 'image', 'asc']
            ],
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const averageRatingProduct = await support.averageRating();
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

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.priceHighToLow = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            order: [
                ['price', 'DESC'],
                [{ model: ImageProduct }, 'image', 'asc']
            ],
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const averageRatingProduct = await support.averageRating();
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

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.priceLowToHigh = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            order: [
                ['price', 'ASC'],
                [{ model: ImageProduct }, 'image', 'asc']
            ],
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const averageRatingProduct = await support.averageRating();
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

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.getProductByPerpage = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            ]
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const averageRatingProduct = await support.averageRating();
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

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.filterProduct = async (req, res, next) => {
    const object = req.body.object || [];
    const _trademark = req.body.trademark || [];
    const price1 = req.body.price1;
    const price2 = req.body.price2;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
                [Op.or]: {
                    'object': object,
                    'trademark': _trademark,
                    'price': {
                        [Op.between]: [price1, price2]
                    },
                    [Op.and]: {
                        'object': object,
                        'trademark': _trademark,
                    },
                    [Op.and]: {
                        'object': object,
                        'trademark': _trademark,
                        'price': {
                            [Op.between]: [price1, price2]
                        }
                    },
                    [Op.and]: {
                        'object': object,
                        'price': {
                            [Op.between]: [price1, price2]
                        }
                    },
                    [Op.and]: {
                        'trademark': _trademark,
                        'price': {
                            [Op.between]: [price1, price2]
                        }
                    }
                }
            }
        }
    )
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const averageRatingProduct = await support.averageRating();

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

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.detailProduct = async (req, res, next) => {
    const id = req.params.id;
    const existedProduct = await Product.findByPk(id);
    if (!existedProduct) {
        return false;
    }
    const detailProduct = await Product.findOne({
        attributes: ['id', 'name', 'description', 'dateCreated', 'price', 'oldPrice', 'unit', 'uses', 'quantity', 'expiry', 'dosageForms', 'specification', 'trademark', 'support', 'ingredient', 'dosage', 'sideEffects', 'note', 'preserve', 'type', 'view'],
        include: [
            {
                model: Category,
                required: false,
                attributes: ['id', 'name']
            },
            {
                model: ImageProduct,
                required: false,
                attributes: ['image']
            },
            {
                model: Producer,
                required: false,
                attributes: ['id', 'name']
            }
        ],
        where: {
            id: id
        }
    });

    const view = await Product.update({
        view: detailProduct.view + 1
    }, {
        where: {
            id: id
        }
    });

    const feedbackProduct = await FeedbackProduct.findAll({
        attributes: ['content', 'createTime', 'rating'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['username', 'avatar']
            },
            {
                model: Replies,
                required: false,
                attributes: ['createTime', 'content']
            }
        ],
        where: {
            product_id: id,
            reviews: "Đã duyệt"
        }
    });

    const feedback5Star = await support.feedbackStar(id, 5);
    const feedback4Star = await support.feedbackStar(id, 4);
    const feedback3Star = await support.feedbackStar(id, 3);
    const feedback2Star = await support.feedbackStar(id, 2);
    const feedback1Star = await support.feedbackStar(id, 1);


    const relatedProduct = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'type'],
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
                category_id: detailProduct.Category.id
            }
        }
    )

    const allProduct = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'type'],
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
            order: [
                ['dateCreated', 'DESC']
            ],
            limit: 9
        }
    );

    const countProduct = await OrderDetail.count({
        where: {
            product_id: id
        }
    });

    const countFeedbackProduct = await FeedbackProduct.count({
        where: {
            product_id: id
        }
    });

    const averageRatingProduct = await support.averageRating();

    const averageRating = await FeedbackProduct.findOne({
        attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'rating']],
        where: {
            product_id: id
        }
    });

    var favoriteProduct = 0;
    if (req.session.user != null) {
        favoriteProduct = await FavoriteProduct.count({
            where: {
                product_id: id,
                user_id: req.session.user.id
            }
        });
    }
    const countFavoriteProduct = await FavoriteProduct.count({
        where: {
            product_id: id
        }
    });

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    req.session.back = req.originalUrl;

    res.render("customer/chi-tiet-san-pham", {
        title: detailProduct.name,
        user: req.session.user,
        detailProduct: detailProduct,
        comment: feedbackProduct,
        relatedProduct: relatedProduct,
        allProduct: allProduct,
        countProduct: countProduct,
        countFeedbackProduct: countFeedbackProduct,
        favoriteProduct: favoriteProduct,
        countFavoriteProduct: countFavoriteProduct,
        averageRatingProduct: averageRatingProduct,
        averageRating: averageRating,
        cart: cart,
        total: total,
        feedback5Star: feedback5Star,
        feedback4Star: feedback4Star,
        feedback3Star: feedback3Star,
        feedback2Star: feedback2Star,
        feedback1Star: feedback1Star,
    });
}

exports.feedbackProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const content = req.body.content;
    const rating = req.body.rating || 0;
    const feedbackProduct = await FeedbackProduct.create({
        content: content,
        createTime: support.time(),
        status: "Chưa phản hồi",
        reviews: "Chưa duyệt",
        rating: rating,
        product_id: productId,
        user_id: req.session.user.id
    });
    const existedComment = await FeedbackProduct.destroy({
        where: {
            content: ""
        }
    })
    res.redirect(`/shop/detail/id=${productId}`);
}

exports.favorite = async (req, res, next) => {
    const productFavorite = await FavoriteProduct.findAll({
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'name', 'uses', 'oldPrice', 'price', 'type', 'quantity'],
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
                ]
            }
        ],
        where: {
            user_id: req.session.user.id
        }
    });

    const averageRatingProduct = await support.averageRating();

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
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/san-pham-yeu-thich", {
        title: "Sản phẩm yêu thích",
        user: req.session.user,
        productFavorite: productFavorite,
        averageRatingProduct: averageRatingProduct,
        cart: cart,
        total: total,
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}

exports.favoriteProduct = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedFavorite = await FavoriteProduct.findOne({
        where: {
            user_id: req.session.user.id,
            product_id: id
        }
    });
    if (existedFavorite) {
        res.redirect('/shop/wishlist');
        return;
    }
    const createFavorite = await FavoriteProduct.create({
        product_id: id,
        user_id: req.session.user.id
    });

    const productFavorite = await FavoriteProduct.findAll({
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'name', 'uses', 'oldPrice', 'price', 'quantity', 'type'],
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
                ]
            }
        ],
        where: {
            user_id: req.session.user.id
        }
    });

    const averageRatingProduct = await support.averageRating();

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.redirect(req.session.back);
    // res.render("customer/san-pham-yeu-thich", {
    //     title: "Sản phẩm yêu thích",
    //     user: req.session.user,
    //     productFavorite: productFavorite,
    //     averageRatingProduct: averageRatingProduct,
    //     cart: cart,
    //     total: total
    // });
}

exports.deleteFavoriteProduct = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedFavoriteProduct = await FavoriteProduct.findOne({ where: { product_id: id, user_id: req.session.user.id } });
    if (!existedFavoriteProduct) {
        res.send("Không tồn tại sản phẩm yêu thích");
        return;
    }
    const deleteFavoriteProduct = await FavoriteProduct.destroy({
        where: {
            product_id: id,
            user_id: req.session.user.id
        }
    });
    if (page == "product" || page == "detail") {
        res.redirect(req.session.back);
    } else if (page == "wishlist") {
        res.redirect('/shop/wishlist');
    }
}

exports.deleteWishlist = async (req, res, next) => {
    const id = req.params.id;
    const deleteWishlist = await FavoriteProduct.destroy({
        where: {
            product_id: id,
            user_id: req.session.user.id
        }
    });
    res.redirect("/shop/wishlist");
}

exports.addProductCart = async (req, res, next) => {
    const id = req.params.id;
    const exitsedProduct = await Product.findByPk(id);
    if (!exitsedProduct) {
        res.send("Sản phẩm không tồn tại");
        return;
    }

    const existedCart = await Cart.findOne({ where: { product_id: id, user_id: req.session.user.id } });
    if (existedCart) {
        res.redirect("/cart");
        return;
    }

    const addProductCart = await Cart.create({
        product_id: id,
        quantity: 1,
        user_id: req.session.user.id
    });

    res.redirect("/cart");
}

exports.criteriaProduct = async (req, res, next) => {
    const gettrademark = req.query.trademark || "";
    const getproducer = req.query.producer || "";
    const criteriaProduct = {};
    if (gettrademark != "") {
        criteriaProduct.trademark = gettrademark;
    }
    if (getproducer != "") {
        criteriaProduct.producer_id = getproducer;
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'quantity', 'type'],
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
            where: criteriaProduct
        }
    )

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

    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const trademark = await Product.findAll({
        attributes: [Sequelize.fn('DISTINCT', Sequelize.col('trademark')), 'trademark'],
        order: [
            ['trademark']
        ]
    });

    const averageRatingProduct = await support.averageRating();

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    req.session.back = req.originalUrl;

    res.render("customer/cua-hang", {
        title: "Thực phẩm chức năng",
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
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold
    });
}