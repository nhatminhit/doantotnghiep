const multer = require('multer');
const { Op } = require('sequelize');
const path = require('path');
const Order = require('../../models/orders');
const User = require('../../models/users');
const Transport = require('../../models/transports');
const OrderDetail = require('../../models/orderDetail');
const Product = require('../../models/products');
const ImageProduct = require('../../models/imageproducts');
const Role = require('../../models/roles');
const support = require('../../controllers/support');
const constant = require('../../commons/constant');
const moment = require('moment');
const config = require('config');
const request = require('request');

User.hasMany(Order, {
    foreignKey: {
        name: 'user_id'
    }
});

Order.belongsTo(User, {
    foreignKey: {
        name: 'user_id'
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

Role.hasMany(User, {
    foreignKey: {
        name: 'role_id'
    }
});

User.belongsTo(Role, {
    foreignKey: {
        name: 'role_id'
    }
});

exports.listOrder = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    
    const listOrder = await Order.findAll({
        attributes: ['id', 'createTime', 'status', 'payments', 'statusPayment', 'totalMoney', 'ship'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['name']
            }
        ]
    })
    const totalPage = parseInt(Math.ceil(listOrder.length / perPage));
    const listTransport = await Transport.findAll();
    const listUser = await User.findAll({
        attributes: ['id', 'name', 'role_id'],
        include: [
            {
                model: Role,
                required: false,
                attributes: ['description']
            }
        ],
        where: {
            role_id: {
                [Op.in]: [constant.ROLE.ADMIN, constant.ROLE.EMPLOYEE]
            }
        }
    });
    
    res.render("admin/danh-sach-don-hang", {
        title: 'Danh sách đơn hàng', 
        user: req.session.user, 
        listOrder: listOrder.slice(start, end),
        listTransport: listTransport,
        listUser: listUser,
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.getAddOrder = async (req, res, next) => {
    const currentTime = support.dateCreate();
    res.render("admin/them-don-hang", {
        title: "Thêm mới đơn hàng", 
        user: req.session.user,
        dateCreate: currentTime
    });
}

exports.postAddOrder = async (req, res, next) => {
    const orderBody = req.body;
    const product = orderBody.idProduct;
    const quantity = orderBody.quantity;

    if (orderBody.nameCustomer == "" || orderBody.phone == "" || orderBody.nameProduct ) {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }

    for (i = 0; i < product.length; i++) {
        const getQuantityProduct = await Product.findOne({
            attributes: ['quantity'],
            where: {
                id: product[i]
            }
        });
        if (getQuantityProduct.quantity <= 0) {
            res.send("Sản phẩm" + product[i] + " hết hàng");
            return;
        }
    }
    const createUser = await User.create({
        name: orderBody.nameCustomer,
        username: "",
        email: orderBody.email || "",
        password: "",
        role_id: constant.ROLE.CUSTOMER,
        phone: orderBody.phone,
        gender: orderBody.gender,
        birthday: "",
        avatar: "/avatar/anhdaidien.jpg",
        address: orderBody.address || ""
    });

    totalPrice = 0;
    const getPriceProduct = await Product.findAll({
        attributes: ['price', 'oldPrice'],
        where: {
            id: {
                [Op.in]: product
            }
        }
    });

    for (i = 0; i < getPriceProduct.length; i++) {
        if (getPriceProduct[i].oldPrice > 0) {
            totalPrice += getPriceProduct[i].oldPrice*quantity[i];
        } else {
            totalPrice += getPriceProduct[i].price*quantity[i];
        }
    }

    let date = new Date();
    let orderId = moment(date).format('DDHHmmss');
    const user = req.session.user;
    if (user.role == 1) {
        role = "Admin";
    } else if (user.role == 2) {
        role = "Nhân viên"
    }
    const createOrder = await Order.create({
        id: orderId,
        note: constant.STATUS_ORDER.DIRECT,
        createTime: support.time(),
        status: constant.STATUS_ORDER.DIRECT,
        payments: orderBody.payments,
        statusPayment: constant.STATUS_PAYMENT.PAID,
        totalMoney: totalPrice,
        ship: constant.STATUS_ORDER.DIRECT,
        shipCode: "",
        shipFee: 0,
        user_id: createUser.id
    })
    for (i = 0; i < product.length; i++) {
        if (getPriceProduct[i].oldPrice > 0) {
            const createOrderDetail = await support.orderAdmin(product[i], createOrder.id, quantity[i], getPriceProduct[i].oldPrice);
        } else {
            const createOrderDetail = await support.orderAdmin(product[i], createOrder.id, quantity[i], getPriceProduct[i].price);
        }
        const getQuantity = await Product.findOne({
            attributes: ['quantity'],
            where: {
                id: product[i]
            }
        });
        const updateProduct = await Product.update({
            quantity: getQuantity.quantity - quantity[i]
        }, {
            where: {
                id: product[i]
            }
        })
    }

    res.redirect(`/portal/order/edit/id=${createOrder.id}`);
}

exports.statusOrder = async (req, res, next) => {
    const id = req.params.id;
    const updateStatuOrder = await Order.update({
        status: "Đã xác nhận",
    }, {
        where: {
            id: id
        }
    });
    res.redirect(`/portal/order/edit/id=${id}`);
}

exports.updateStatusOrder = async (req, res, next) => {
    const statusOrder = req.body;
    if (statusOrder.statusDelivery == "Đã hủy") {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
    
        let config = require('config');
        let crypto = require("crypto");
       
        let vnp_TmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnp_Api = config.get('vnp_Api');
    
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
    
        let vnp_TxnRef = req.body.id;
        let vnp_TransactionDate = createDate;
        let vnp_Amount = req.body.amount*100;
        let vnp_TransactionType = "02";
        let vnp_CreateBy = "Cửa hàng TPCN Văn Quân";
    
        let vnp_RequestId = moment(date).format('HHmmss');
        let vnp_Version = '2.1.0';
        let vnp_Command = 'refund';
        let vnp_OrderInfo = 'Hoàn tiền GD mã:' + vnp_TxnRef;
                
        let vnp_IpAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        
        let vnp_CreateDate = createDate;
        
        let vnp_TransactionNo = '0';
            
        let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
        let hmac = crypto.createHmac("sha512", secretKey);
        let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");
    
        let dataObj = {
            'vnp_RequestId': vnp_RequestId,
            'vnp_Version': vnp_Version,
            'vnp_Command': vnp_Command,
            'vnp_TmnCode': vnp_TmnCode,
            'vnp_TransactionType': vnp_TransactionType,
            'vnp_TxnRef': vnp_TxnRef,
            'vnp_Amount': vnp_Amount,
            'vnp_TransactionNo': vnp_TransactionNo,
            'vnp_CreateBy': vnp_CreateBy,
            'vnp_OrderInfo': vnp_OrderInfo,
            'vnp_TransactionDate': vnp_TransactionDate,
            'vnp_CreateDate': vnp_CreateDate,
            'vnp_IpAddr': vnp_IpAddr,
            'vnp_SecureHash': vnp_SecureHash
        };
    
        request({
            url: vnp_Api,
            method: "POST",
            json: true,   
            body: dataObj
                }, function (error, response, body){
                    console.log(body)
                });
    
                const existedOrder = await Order.findByPk(vnp_TxnRef);
                if (!existedOrder) {
                    res.send("Không tồn tại đơn hàng");
                }
                const updateOrder = await Order.update({
                    status: constant.STATUS_ORDER.CANCEL,
                    statusPayment: constant.STATUS_PAYMENT.REFUND
                }, {
                    where: {
                        id: vnp_TxnRef
                    }
                });
                const order = await Order.findOne({
                    attributes: ['id'],
                    include: [
                        {
                            model: OrderDetail,
                            required: false,
                            attributes: ['product_id', 'quantity'],
                        }
                    ],
                    where: {
                        user_id: req.session.user.id,
                        id: vnp_TxnRef
                    }
                });
            
                for (i = 0; i < order.OrderDetails.length; i++) {
                    const getQuantity = await Product.findOne({
                        attributes: ['quantity'],
                        where: {
                            id: order.OrderDetails[i].product_id
                        }
                    })
            
                    const updateQuantity = await Product.update({
                        quantity: getQuantity.quantity + parseInt(order.OrderDetails[i].quantity)
                    }, {
                        where: {
                            id: order.OrderDetails[i].product_id
                        }
                    });
                }
    }
    const updateStatus = await Order.update({
        status: statusOrder.statusDelivery
    }, {
        where: {
            id: statusOrder.id
        }
    });
    if (statusOrder.page == "list") {
        res.redirect("/portal/order/list"); }
    else if (statusOrder.page == "detail") {
        res.redirect(`/portal/order/edit/id=${statusOrder.id}`);
    }
}

exports.updateStatusPayment = async (req, res, next) => {
    const statusPayment = req.body;
    const updateStatusPayment = await Order.update({
        statusPayment: statusPayment.statusPayment
    }, {
        where: {
            id: statusPayment.id
        }
    });
    if (statusPayment.page == "list") {
        res.redirect("/portal/order/list"); }
    else if (statusPayment.page == "detail") {
        res.redirect(`/portal/order/edit/id=${statusPayment.id}`);
    }
}

exports.shipOrder = async (req, res, next) => {
    const ship = req.body;
    if (ship.nameShip == "" || ship.shipCode == "") {
        res.send("Bạn chưa điền đầy đủ thông tin");
        return;
    }
    const shipOrder = await Order.update({
        ship: ship.nameShip,
        shipCode: ship.shipCode
    }, {
        where: {
            id: ship.id
        }
    });
    if (ship.page == "list") {
        res.redirect("/portal/order/list"); }
    else if (ship.page == "detail") {
        res.redirect(`/portal/order/edit/id=${ship.id}`);
    }
}

exports.statusShipOrder = async (req, res, next) => {
    const ship = req.body;
    if (ship.statusShip == 0) {
        res.send("Bạn chưa chọn trạng thái giao hàng");
        return;
    }
    const shipOrder = await Transport.create({
        status: ship.statusShip,
        createTime: support.time(),
        order_id: ship.id
    });
    if (ship.page == "list") {
        res.redirect("/portal/order/list"); }
    else if (ship.page == "detail") {
        res.redirect(`/portal/order/edit/id=${ship.id}`);
    }
}

exports.deleteTransport = async (req, res, next) => {
    const id = req.params.id;
    const existedTransport = await Transport.findByPk(id);
    if (!existedTransport) {
        res.send("Trạng thái vận chuyển của đơn hàng không tồn tại");
        return;
    }   
    const deleteTransport = await Transport.destroy({
        where: {
            id: existedTransport.id
        }
    });
    console.log("================", req.query.status);
    if (req.query.status == "list") {
        res.redirect('/portal/order/list');
    } else if (req.query.status == "edit") {
        res.redirect(`/portal/order/edit/id=${req.query.orderId}`)
    }
}

exports.hanlderOrder = async (req, res, next) => {
    const handlerOrder = req.body;
    const updateHandler = await Order.update({
        handler: handlerOrder.handler
    }, {
        where: {
            id: handlerOrder.id
        }
    });
    if (handlerOrder.page == "list") {
        res.redirect("/portal/order/list"); }
    else if (handlerOrder.page == "detail") {
        res.redirect(`/portal/order/edit/id=${handlerOrder.id}`);
    }
}

exports.editOrder = async (req, res, next) => {
    const id = req.params.id;
    const detailOrder = await Order.findOne({
        attributes: ['id', 'note', 'createTime', 'status', 'payments', 'statusPayment', 'totalMoney', 'ship', 'shipCode', 'shipFee'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['id', 'name', 'phone', 'email', 'address']
            }
        ],
        where: {
            id: id
        }
    }); 
    const getDetailOrder = await OrderDetail.findAll({
        attributes: ['product_id', 'quantity'],
        include: [
            {
                model: Product,
                required: false,
                attributes: ['name', 'price', 'oldPrice'],
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
            order_id: id
        }
    });
    const listTransport = await Transport.findAll({
        where: {
            order_id: id
        }
    });
    const listUser = await User.findAll({
        attributes: ['id', 'name', 'role_id'],
        include: [
            {
                model: Role,
                required: false,
                attributes: ['description']
            }
        ],
        where: {
            role_id: {
                [Op.in]: [constant.ROLE.ADMIN, constant.ROLE.EMPLOYEE]
            }
        }
    })
    res.render("admin/chi-tiet-don-hang", {
        title: "Chi tiết đơn hàng", 
        user: req.session.user,
        detailOrder: detailOrder,
        listTransport: listTransport,
        listUser: listUser,
        getDetailOrder: getDetailOrder
    });
}

exports.deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    const existedOrder = await Order.findByPk(id);
    if (!existedOrder) {
        res.send("Đơn hàng không tồn tại");
        return;
    }
    const deleteOrder = await Order.destroy({
        where: {
            id: existedOrder.id
        }
    });

    const getOrderDetail = await OrderDetail.findAll({
        attributes: ['product_id', 'quantity'],
        where: {
            order_id: id
        }
    });

    for (i = 0; i < getOrderDetail.length; i++) {
        const getQuantity = await Product.findOne({
            attributes: ['quantity'],
            where: {
                id: getOrderDetail[i].product_id
            }
        })

        const updateQuantity = await Product.update({
            quantity: getQuantity.quantity + parseInt(getOrderDetail[i].quantity)
        }, {
            where: {
                id: getOrderDetail[i].product_id
            }
        });
    };

    const deleteOrderDetail = await OrderDetail.destroy({
        where: {
            order_id: existedOrder.id
        }
    });

    res.redirect("/portal/order/list");
}