const Cart = require("../models/cart");
const OrderDetail = require("../models/orderDetail");
const Order = require("../models/orders");
const Product = require("../models/products");
const ImageProduct = require("../models/imageproducts");
const FavoriteProduct = require("../models/favoriteProduct");
const Category = require("../models/categories");
const News = require("../models/news");
const Jobs = require("../models/jobs");
const Transport = require("../models/transports");
const FeedbackProduct = require("../models/feedbacks");
const Comments = require("../models/comments");
const User = require("../models/users");
const Recruitment = require("../models/recruitments");
const Replies = require("../models/replies");
const { Op } = require("sequelize");
const sequelize = require('sequelize');
const moment = require('moment');
// ============================================ CLIENT =================================================
// =============== Trang chủ ========================
exports.getAllProducts = async () => {
    return await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity', 'type'],
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
            limit: 15
        }
    )
}

exports.getProductType1 = async (categoryId) => {
    return await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity', 'type'],
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
            where: {
                'category_id': categoryId
            },
            limit: 15
        }
    )
}

exports.getProductType2 = async (object) => {
    return await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity', 'type'],
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
                object: object
            },
            limit: 15
        }
    )
}

exports.getProductType3 = async (type) => {
    return await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity', 'type'],
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
                type: type
            },
            limit: 5
        }
    )
}

exports.getProductType4 = async (array) => {
    return await Product.findAll(
        {
            attributes: ['id', 'name', 'price', 'oldPrice', 'dateCreated', 'quantity', 'type'],
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
                'category_id': {
                    [Op.in]: array
                }
            },
            limit: 5
        }
    )
}

exports.getListNews = async () => {
    return await News.findAll({
        limit: 10
    })
}

exports.getListNewsSort = async () => {
    return await News.findAll({
        order: [['createTime', 'DESC']],
        limit: 5
    })
}

exports.getListJobs = async (limit) => {
    return await Jobs.findAll({
        attributes: ['id', 'title', 'salary'],
        order: [['deadline', 'ASC']],
        limit: limit
    })
}

// =================== Thời gian =======================
exports.time = () => {
    const d = new Date();
    const ngay = d.getDate();
    const thang = d.getMonth() + 1;
    const nam = d.getFullYear();
    const gio = d.getHours();
    const phut = d.getMinutes();
    const giay = d.getSeconds();
    return ngay + "/" + thang + "/" + nam + " " + gio + ":" + phut;
}

exports.timeCurrent = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return year + "-" + month + "-" + day;
}

exports.dateCreate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + "/" + month + "/" + year;
}

// =================== Cửa hàng =========================
exports.averageRating = async () => {
    return await FeedbackProduct.findAll({
        attributes: ['product_id', [sequelize.fn('avg', sequelize.col('rating')), 'rating']],
        group: ['product_id']
    });
}

// =================== Chi tiết sản phẩm ================
exports.feedbackStar = async (id, numberStar) => {
    return await FeedbackProduct.findAll({
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
            rating: numberStar,
            reviews: "Đã duyệt"
        }
    });
}

// =================== Giỏ hàng =========================
exports.updateCart = async (cartId, quantity, productId, userId) => {
    await Cart.update({
        quantity: quantity
    }, {
        where: {
            id: cartId,
            product_id: productId,
            user_id: userId
        }
    })
}

// =================== Đặt hàng ==========================
exports.getListOrderStatus = async (userId, status) => {
    return await Order.findAll({
        attributes: ['id', 'createTime', 'status', 'totalMoney', 'statusPayment', 'payments'],
        include: [
            {
                model: OrderDetail,
                required: false,
                attributes: ['quantity', 'price'],
                include: [
                    {
                        model: Product,
                        required: false,
                        attributes: ['name', 'oldPrice', 'price'],
                        include: [
                            {
                                model: ImageProduct,
                                required: false,
                                attributes: ['image']
                            }
                        ]
                    }
                ]
            }
        ],
        where: {
            user_id: userId,
            status: status
        },
        order: [
            ['createTime', 'DESC']
        ]
    });
}

exports.countStatusOrderUser = async (userId, status) => {
    return await Order.count({
        where: {
            user_id: userId,
            status: status
        }
    });
}

exports.createOrder = async (orderId, note, payment, status, statusPayment, totalPrice, shipFee, userId) => {
    const date = new Date();
    return await Order.create({
        id: orderId,
        note: note || "",
        createTime: this.time(),
        status: status,
        payments: payment,
        statusPayment: statusPayment,
        totalMoney: totalPrice,
        shipFee: shipFee,
        user_id: userId
    });
}

exports.createTransport = async (orderId) => {
    await Transport.create({
        status: "Đơn hàng đã được đặt thành công",
        createTime: this.time(),
        order_id: orderId
    });
}

exports.cart = async (userId) => {
    return await Cart.findAll({
        attributes: ['id', 'quantity'],
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'price'],
            }
        ],
        where: {
            user_id: userId
        }
    });
}

exports.deleteCart = async (userId) => {
    await Cart.destroy({
        where: {
            user_id: userId
        }
    });
}

exports.createOrderDetail = async (quantity, productId, orderId, price) => {
    await OrderDetail.create({
        quantity: quantity,
        product_id: productId,
        order_id: orderId,
        price: price
    })
}

exports.totalPrice = (oldPrice, quantity, price) => {
    if (oldPrice > 0) {
        total += quantity * oldPrice;
    } else {
        total += quantity * price;
    }
}

exports.productWishList = async (userid) => {
    await FavoriteProduct.findAll({
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'name', 'uses', 'oldPrice', 'price'],
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
            user_id: userid
        }
    })
}

exports.getCart = async (userid) => {
    return await Cart.findAll({
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
            user_id: userid
        }
    })
}

exports.getTotal = async (userid) => {
    const cart = await Cart.findAll({
        attributes: ['id', 'quantity'],
        include: [
            {
                model: Product,
                required: false,
                attributes: ['id', 'name', 'price', 'oldPrice'],
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
            user_id: userid
        }
    })
    total = 0;
    for (i = 0; i < cart.length; i++) {
        if (cart[i].Product.oldPrice > 0) {
            total += cart[i].quantity * cart[i].Product.oldPrice;
        } else {
            total += cart[i].quantity * cart[i].Product.price;
        }
    }
    return total;
}

// ===================== Thông báo ==========================
exports.notification = async (status, nameStatus, descriptionStatus, linkStatus, nameLinkStatus, ré) => {
    res.render('customer/thong-bao-trang-thai', {

        user: req.session.user,
        status,
        nameStatus,
        descriptionStatus,
        linkStatus,
        nameLinkStatus
    });
}

// ============================================== ADMIN ===============================================
// ===================== Dashboard ==========================
exports.countUser = async (role) => {
    return await User.count({
        where: {
            role_id: role
        }
    })
}

exports.countProduct = async (type) => {
    return await Product.count({
        where: {
            type: type
        }
    })
}

exports.countObjectProduct = async (object) => {
    return await Product.count({
        where: {
            object: object
        }
    })
}

exports.countStatusOrder = async (statusOrder) => {
    return await Order.count({
        where: {
            status: statusOrder
        }
    })
}

exports.countPaymentOrder = async (statusPayment) => {
    return await Order.count({
        where: {
            statusPayment: statusPayment
        }
    })
}

exports.countTime1Job = async () => {
    const date = new Date();
    const currentDate = date.getFullYear() + " - " + date.getMonth() + 1 + " - " + date.getDay();
    return await Jobs.count({
        where: {
            deadline: {
                [Op.lte]: currentDate
            }
        }
    })
}

exports.countTime2Job = async () => {
    const date = new Date();
    const currentDate = date.getFullYear() + " - " + date.getMonth() + 1 + " - " + date.getDay();
    return await Jobs.count({
        where: {
            deadline: {
                [Op.gt]: currentDate
            }
        }
    })
}

exports.countTypeTimeJob = async (time) => {
    return await Jobs.count({
        where: {
            timeType: time
        }
    })
}

exports.countStatusFeedbackProduct = async (status) => {
    return await FeedbackProduct.count({
        where: {
            status: status
        }
    })
}

exports.countStatusCommentNews = async (status) => {
    return await Comments.count({
        where: {
            status: status
        }
    })
}

exports.countStatusRecruitment = async (status) => {
    return await Recruitment.count({
        where: {
            status: status
        }
    })
}

exports.countReviewsFeedback = async (status) => {
    return await FeedbackProduct.count({
        where: {
            reviews: status
        }
    })
}

exports.countReviewsNews = async (status) => {
    return await Comments.count({
        where: {
            reviews: status
        }
    })
}
// =========================== Order ==========================
exports.orderAdmin = async (productId, orderId, quantity, price) => {
    await OrderDetail.create({
        product_id: productId,
        order_id: orderId,
        quantity: quantity,
        price: price
    })
}