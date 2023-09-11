const Product = require("../../models/products");
const ImageProduct = require("../../models/imageproducts");
const Cart = require("../../models/cart");
const support = require("../../controllers/support");

Product.hasMany(Cart, {
    foreignKey: {
        name: 'product_id'
    }
});

Cart.belongsTo(Product, {
    foreignKey: {
        name: 'product_id'
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
})

exports.openCart = async (req, res, next) => {
    const deleteProduct = await Cart.destroy({
        where: {
            quantity: 0,
            user_id: req.session.user.id
        }
    })

    const getCart = await Cart.findAll({
        attributes: ['id'],
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'quantity']
            }
        ],
        where: {
            user_id: req.session.user.id
        }
    });

    getCart.forEach(async (item) => {
        if (item.Product.quantity == 0) {
            const deleteCart = await Cart.destroy({
                where: {
                    product_id: item.Product.id,
                    user_id: req.session.user.id
                }
            })
        }
    })
    
    const cart = await Cart.findAll({
        attributes: ['id', 'quantity'],
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'name', 'price', 'oldPrice', 'quantity'],
                include: [
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
    
    total = 0;
    for (i = 0; i < cart.length; i++) {
        if (cart[i].Product.oldPrice > 0) {
            total += cart[i].quantity * cart[i].Product.oldPrice;
        } else {
            total += cart[i].quantity * cart[i].Product.price;
        }
    }

    var cartlist = [];
    var totallist = 0;
    if (req.session.user != undefined) {
        cartlist = await support.getCart(req.session.user.id);
        totallist = await support.getTotal(req.session.user.id);
    } else {
        req.session.back = "/cart";
    }
    res.render('customer/gio-hang', {title: "Giỏ hàng", user: req.session.user, cartList: cart, totalPrice: total, cart: cartlist, total: totallist});
}

exports.addProductCart = async (req, res, nex) => {
    const productId = req.body.productId;
    const number = req.body.numberCart;
    console.log(number);
    if (number <= 0) {
        const link = `/shop/detail/id=${productId}`;
        res.redirect(link);
        return;
    }
    const getQuantity = await Product.findOne({attributes: ['quantity'], where: {id: productId}});
    if (getQuantity.quantity < number){
        const link = `/shop/detail/id=${productId}`;
        res.redirect(link);
        return;
    }
    
    const existedCart = await Cart.findAll({
        where: {
            user_id: req.session.user.id,
        }
    })
    if (existedCart.length <= 0) {
        const createCart = await Cart.create({
            quantity: number,
            product_id: productId,
            user_id: req.session.user.id
        })
    } else {
        const existedProduct = await Cart.findOne({
            where: {
                product_id: productId
            }
        });
        if (!existedProduct) {
            const createCart = await Cart.create({
                quantity: number,
                product_id: productId,
                user_id: req.session.user.id
            })
        } else {
            const updateCart = await Cart.update({
                quantity: number
            }, {
                where: {
                    product_id: productId,
                    user_id: req.session.user.id
                }
            })
        }
    }
    res.redirect('/cart');
};

exports.deleteCart = async (req, res, next) => {
    const id = req.params.id;
    const deleteCart = await Cart.destroy({
        where: {
            id: id
        }
    });
    res.redirect('/cart');
}

exports.updateCart = async (req, res, next) => {
    const cartId = req.body.cartId;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    const totalPrice = req.body.totalPrice;
    const deleteProduct = await Cart.destroy({
        where: {
            quantity: 0,
            user_id: req.session.user.id
        }
    })
    total = 0;
    for (i = 0; i < cartId.length; i++) {
        const update = support.updateCart(cartId[i], quantity[i], productId[i], req.session.user.id);
        total += parseFloat(totalPrice);
    }
    
    res.redirect('/cart');
}

exports.deleteAllCart = async (req, res, next) => {
    const deleteAllCart = await Cart.destroy({
        where: {
            user_id: req.session.user.id
        }
    });
    res.redirect("/cart");
}