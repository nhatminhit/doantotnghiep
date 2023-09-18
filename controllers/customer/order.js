const User = require("../../models/users");
const Order = require("../../models/orders");
const Product = require("../../models/products");
const ImageProduct = require("../../models/imageproducts");
const Cart = require("../../models/cart");
const OrderDetail = require("../../models/orderDetail");
const constant = require("../../commons/constant");
const response = require("../../commons/response");
const support = require("../../controllers/support");
const Transport = require('../../models/transports');
const moment = require('moment');
const config = require('config');
const request = require('request');
const requests = require('requests')

Order.hasMany(OrderDetail, {
    foreignKey: {
        name: 'order_id'
    }
});

OrderDetail.belongsTo(Order, {
    foreignKey: {
        name: 'order_id'
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

Order.hasMany(Transport, {
    foreignKey: {
        name: 'order_id'
    }
});

Transport.belongsTo(Order, {
    foreignKey: {
        name: 'order_id'
    }
});

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

exports.order = async (req, res, next) => {
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
            user_id: req.session.user.id
        }
    });
    const customer = await User.findByPk(req.session.user.id);
    total = 0;
    for (i = 0; i < cart.length; i++) {
        support.totalPrice(cart[i].Product.oldPrice, cart[i].quantity, cart[i].Product.price);
    }
    shipFee = 0;
    if (total >= 500000) {
        shipFee = 0;
    } else {
        shipFee = 30000;
    }
    if (total > 0) {
        finalTotal = total + shipFee; }
    else {
        finalTotal = 0;
    }
    var cartlist = [];
    var totallist = 0;
    if (req.session.user != undefined) {
        cartlist = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render('customer/thanh-toan', { 
        title: "Thanh toán", 
        user: req.session.user, 
        product: cart, 
        customer: customer, 
        totalMoney: total, 
        shipFee: shipFee, 
        finalTotal: finalTotal,
        cart: cartlist,
        total: totallist});
}

exports.payment = async (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address;
    const note = req.body.note;
    const payment = req.body.bankCode;
    const shipFee = req.body.transport;
    const totalPrice = req.body.totalPrice;
    if (email == "" || name == "" || phone == "" || address == "") {
        res.send("Bạn chưa nhập đầy đủ thông tin");
        return;
    }
    const infor = await User.findByPk(req.session.user.id);

    let date = new Date();
    let orderId = moment(date).format('DDHHmmss');

    if (infor.email != email || infor.name != name || infor.phone != phone || infor.address != address) {
        const updateUser = await User.update({
            email: email,
            name: name,
            phone: phone,
            address: address
        }, {
            where: {
                id: req.session.user.id
            }
        })
    }

    if (payment == "VNPAY" || payment == "VNPAYQR" || payment == "VNBANK" || payment == "INTCARD") {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let config = require('config');
        
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = config.get('vnp_ReturnUrl');
        let amount = req.body.totalPrice;
        let bankCode = req.body.bankCode;
        let orderInfo = req.body.note;
        
        let locale = req.body.language || 'vn';
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount*100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_OrderInfo'] = orderInfo || 'other';
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        console.log(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        const createOrder = await support.createOrder(orderId, note, payment, constant.STATUS_ORDER.CONFIRM, constant.STATUS_PAYMENT.UNPAID, totalPrice, shipFee, req.session.user.id);
        const createTransport = await support.createTransport(createOrder.id);

        const cart = await support.cart(req.session.user.id);

        for (i = 0; i < cart.length; i++) {
            support.createOrderDetail(cart[i].quantity, cart[i].Product.id, createOrder.id, cart[i].Product.price);
            const quantityProduct = await Product.findOne({
                attributes: ['quantity'],
                where: {
                    id: cart[i].Product.id
                }
            });
            const updateQuantity = await Product.update({
                quantity: quantityProduct.quantity - cart[i].quantity
            }, {
                where: {
                    id: cart[i].Product.id
                }
            })
        }

        const deleteCart = await support.deleteCart(req.session.user.id);

        res.redirect(vnpUrl);

    } else if (payment == 'cash') {
        const createOrder = await support.createOrder(orderId, note, payment, constant.STATUS_ORDER.CONFIRM, constant.STATUS_PAYMENT.UNPAID, totalPrice, shipFee, req.session.user.id);
        const createTransport = await support.createTransport(createOrder.id);
        const cart = await support.cart(req.session.user.id);

        for (i = 0; i < cart.length; i++) {
            support.createOrderDetail(cart[i].quantity, cart[i].Product.id, createOrder.id, cart[i].Product.price);
            const quantityProduct = await Product.findOne({
                attributes: ['quantity'],
                where: {
                    id: cart[i].Product.id
                }
            });
            const updateQuantity = await Product.update({
                quantity: quantityProduct.quantity - cart[i].quantity
            }, {
                where: {
                    id: cart[i].Product.id
                }
            })
        }

        const deleteCart = await support.deleteCart(req.session.user.id);
        var cartlist = [];
        var total = 0;
        if (req.session.user != undefined) {
            cartlist = await support.getCart(req.session.user.id);
            total = await support.getTotal(req.session.user.id);
        }
        res.render('customer/thong-bao-trang-thai', { 
            title: "Thông báo", 
            user: req.session.user,
            status: response.ICON_STATUS_SUCCESS, 
            nameStatus: response.NAME_PAYMENT_SUCCESS, 
            descriptionStatus: response.DESCRIPTION_PAYMENT_SUCCESS, 
            linkStatus: response.LINK_STATUS_SUCCESS_PAYMENT, 
            nameLinkStatus: response.NAME_LINK_SUCCESS_PAYMENT,
            cart: cartlist,
            total: total});
    }
}

exports.listOrder = async (req, res, next) => {
    const listOrder = await Order.findAll({
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
                                attributes: ['id', 'image'],
                            }
                        ],
                    }
                ]
            }
        ],
        where: {
            user_id: req.session.user.id
        },
        order: [
            ['createTime', 'DESC'],
        ]
    });
    const confirmOrder = await support.getListOrderStatus(req.session.user.id, constant.STATUS_ORDER.CONFIRM);
    const confirmedOrder = await support.getListOrderStatus(req.session.user.id, constant.STATUS_ORDER.CONFIRMED)
    const deliveringOrder = await support.getListOrderStatus(req.session.user.id, constant.STATUS_ORDER.DELIVERY);
    const completeOrder = await support.getListOrderStatus(req.session.user.id, constant.STATUS_ORDER.COMPLETE);
    const cancelledOrder = await support.getListOrderStatus(req.session.user.id, constant.STATUS_ORDER.CANCEL);
    const totalOrder = await Order.count({where: {user_id: req.session.user.id}});
    const countConfirmOrder = await support.countStatusOrderUser(req.session.user.id, constant.STATUS_ORDER.CONFIRM);
    const countConfirmedOrder = await support.countStatusOrderUser(req.session.user.id, constant.STATUS_ORDER.CONFIRMED);
    const countDeliveryOrder = await support.countStatusOrderUser(req.session.user.id, constant.STATUS_ORDER.DELIVERY);
    const countCompleteOrder = await support.countStatusOrderUser(req.session.user.id, constant.STATUS_ORDER.COMPLETE);
    const countCancelledOrder = await support.countStatusOrderUser(req.session.user.id, constant.STATUS_ORDER.CANCEL);
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/don-hang", {
        title: "Đơn hàng",
        user: req.session.user,
        listOrder: listOrder,
        confirmOrder: confirmOrder,
        confirmedOrder: confirmedOrder,
        deliveringOrder: deliveringOrder,
        completeOrder: completeOrder,
        cancelledOrder: cancelledOrder,
        totalOrder: totalOrder,
        countConfirmOrder: countConfirmOrder,
        countConfirmedOrder: countConfirmedOrder,
        countDeliveryOrder: countDeliveryOrder,
        countCompleteOrder: countCompleteOrder,
        countCancelledOrder: countCancelledOrder,
        cart: cart,
        total: total
    });
}

exports.receivedOrder = async (req, res, next) => {
    const id = req.query.id;
    // const existedOrder = await Order.findByPk(id);
    // if (!existedOrder) {
    //     res.send("Không tồn tại đơn hàng");
    // }
    const updateOrder = await Order.update({
        status: constant.STATUS_ORDER.COMPLETE
    }, {
        where: {
            id: id
        }
    });
    res.redirect('/order/list');
}

exports.cancelOrder = async (req, res, next) => {
    const id = req.query.id;
    const existedOrder = await Order.findByPk(id);
    if (!existedOrder) {
        res.send("Không tồn tại đơn hàng");
    }
    const updateOrder = await Order.update({
        status: constant.STATUS_ORDER.CANCEL
    }, {
        where: {
            id: id
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
            id: id
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
    res.redirect('/order/list');
}

exports.detailOrder = async (req, res, next) => {
    const id = req.params.id;
    // const existedOrder = await Order.findByPk(id);
    // if (!existedOrder) {
    //     res.send("Không tìm thấy id đơn hàng");
    // }
    const detailOrder = await Order.findOne({
        attributes: ['id', 'createTime', 'status', 'totalMoney', 'shipFee', 'ship', 'shipCode', 'payments', 'statusPayment'],
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
            },
            {
                model: User,
                required: false,
                attributes: ['name', 'email', 'phone', 'address']
            }
        ],
        where: {
            user_id: req.session.user.id,
            id: id
        }
    });
    const getTransport = await Transport.findAll({
        where: {
            order_id: id
        },
        order: [
            ['id', 'DESC']
        ]
    });

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }

    res.render('customer/chi-tiet-don-hang', {
        title: "Chi tiết đơn hàng",
        user: req.session.user,
        detailOrder: detailOrder,
        getTransport: getTransport,
        cart: cart,
        total: total
    });
}

exports.vnpay = async (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let config = require('config');
    
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = config.get('vnp_ReturnUrl');
    let orderId = req.body.orderId;
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    
    let locale = req.body.language || 'vn';
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    console.log(signed);
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);

    res.redirect(vnpUrl)
}

exports.vnpay_return = async (req, res, next) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderId = vnp_Params['vnp_TxnRef'];
    let note = vnp_Params['vnp_OrderInfo'];
    let payment = vnp_Params['vnp_BankCode'];
    let totalPrice = vnp_Params['vnp_Amount']/100;

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let config = require('config');
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 

    var paymentStatus = '0';
    var checkOrderId = false;
    var checkAmount = false
    var existedOrder = await Order.findOne({where: {id: orderId}});
  
    if (existedOrder.id == orderId) {
        checkOrderId = true;
    }
    if (existedOrder.totalMoney == totalPrice) {
        checkAmount = true;
    }

    if(secureHash === signed){
        const code = vnp_Params['vnp_ResponseCode'];
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == "0") {
                    if (code == "00") {
                        paymentStatus = "1";
                        const updateStatusOrder = await Order.update({
                            statusPayment: constant.STATUS_PAYMENT.PAID,
                            payment: payment
                        }, {
                            where: {
                                id: orderId
                            }
                        });
                        const status = '/trang-thai-thanh-cong.png';
                        const nameStatus = 'Đặt hàng thành công';
                        const descriptionStatus = 'Bạn hãy vào trang đơn hàng để theo dõi đơn hàng nhé.';
                        const linkStatus = "/order/list";
                        const nameLinkStatus = "Theo dõi đơn hàng"
                        var cart = [];
                        var total = 0;
                        if (req.session.user != undefined) {
                            cart = await support.getCart(req.session.user.id);
                            total = await support.getTotal(req.session.user.id);
                        }
                        res.render('customer/thong-bao-trang-thai', { title: "Thông báo", user: req.session.user, status: status, nameStatus: nameStatus, descriptionStatus: descriptionStatus, linkStatus: linkStatus, nameLinkStatus: nameLinkStatus, cart: cart, total: total });
                    } else {
                        paymentStatus = "2";
                        var cart = [];
                        var total = 0;
                        if (req.session.user != undefined) {
                            cart = await support.getCart(req.session.user.id);
                            total = await support.getTotal(req.session.user.id);
                        }
                        res.render('customer/thong-bao-trang-thai', { 
                            title: "Thông báo", 
                            user: req.session.user,
                            status: response.ICON_STATUS_FAILED, 
                            nameStatus: response.NAME_PAYMENT_FAILED, 
                            descriptionStatus: response.DESCRIPTION_PAYMENT_FAILED, 
                            linkStatus: response.LINK_STATUS_FAILED_PAYMENT, 
                            nameLinkStatus: response.NAME_LINK_FAILED_PAYMENT,
                            cart: cart,
                            total: total
                        });
                    }
                } else {
                    res.send("Đơn hàng này đã cập nhật trạng thái");
                }
            } else {
                res.send("Tiền không khớp");
            }
        } else {
            res.send("Đơn hàng không tồn tại");
        }
    } else{
        const status = '/trang-thai-thanh-cong.png';
        const nameStatus = 'Đặt hàng thất bại';
        const descriptionStatus = 'Bạn hãy vào trang thanh toán và thanh toán lại đơn hàng nhé.';
        const linkStatus = "";
        const nameLinkStatus = "Theo dõi đơn hàng"
        var cart = [];
        var total = 0;
        if (req.session.user != undefined) {
            cart = await support.getCart(req.session.user.id);
            total = await support.getTotal(req.session.user.id);
        }
        res.render('customer/thong-bao-trang-thai', { title: "Thông báo", user: req.session.user, status: status, nameStatus: nameStatus, descriptionStatus: descriptionStatus, linkStatus: linkStatus, nameLinkStatus: nameLinkStatus, cart: cart, total: total });
    }
}

exports.paymentBill = async (req, res, next) => {
    const id = req.params.id;
    const totalMoney = req.params.totalMoney;
    console.log(id, totalMoney);

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/thanh-toan-hoa-don", {
        title: "Thanh toán hóa đơn", 
        user: req.session.user,
        id: id,
        totalMoney: totalMoney,
        cart: cart,
        total: total
    });
}

exports.cancelOrderOnline = async (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let config = require('config');
    let crypto = require("crypto");
   
    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = createDate;
    let vnp_Amount = req.body.amount*100;
    let vnp_TransactionType = "02";
    let vnp_CreateBy = "Cửa hàng thuốc Nhật Minh";
    console.log(vnp_TxnRef, vnp_TransactionDate, vnp_Amount);

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
            res.redirect('/order/list');
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}