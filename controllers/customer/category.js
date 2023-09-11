const Product = require("../../models/products");
const Category = require("../../models/categories");
const ImageProduct = require('../../models/imageproducts');
const FavoriteProduct = require('../../models/favoriteProduct');
const OrderDetail = require('../../models/orderDetail');
const support = require("../../controllers/support");
const Sequelize = require("sequelize");

exports.productByCategory = async (req, res, next) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const getCategory = await Category.findByPk(id);
    const product = await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity'],
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
                category_id: id
            }
        }
    );
    const totalPage = parseInt(Math.ceil(product.length / perPage));
    const categories = await Category.findAll();
    const trademark = await Product.findAll({
        attributes: [Sequelize.fn('DISTINCT', Sequelize.col('trademark')), 'trademark'],
        order: [
            ['trademark']
        ]
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
    res.render("customer/cua-hang", {
        title: "Cửa hàng",
        user: req.session.user,
        categories: categories,
        pages: totalPage,
        current: page,
        perPage: perPage,
        listProduct: product.slice(start, end),
        averageRatingProduct: averageRatingProduct,
        trademark: trademark,
        cart: cart,
        total: total,
        favorite: favorite_productId,
        products_sold: products_sold,
        productsSold: productsSold,
        getCategory: getCategory
    });
}