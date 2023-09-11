const FeedbackProduct = require('../../models/feedbacks');
const User = require('../../models/users');
const Products = require('../../models/products');
const Replies = require('../../models/replies');
const support = require('../support');

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

Products.hasMany(FeedbackProduct, {
    foreignKey: {
        name: 'product_id'
    }
});

FeedbackProduct.belongsTo(Products, {
    foreignKey: {
        name: 'product_id'
    }
})

FeedbackProduct.hasMany(Replies, {
    foreignKey: {
        name: 'feedbackProduct_id'
    }
})

Replies.belongsTo(FeedbackProduct, {
    foreignKey: {
        name: 'feedbackProduct_id'
    }
})

exports.listFeedbackProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const statusPage = req.query.status;
    const objectStatus = {
    };
    if (statusPage == "1") {
        objectStatus.status = "Chưa phản hồi"
    } else if (statusPage == "2") {
        objectStatus.status = "Đã phản hồi"
    }

    const listFeedbackProduct = await FeedbackProduct.findAll({
        attributes: ['id', 'content', 'createTime', 'rating', 'status', 'reviews'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['name']
            },
            {
                model: Products,
                required: false,
                attributes: ['id', 'name']
            },
        ],
        where: objectStatus
    });
    const totalPage = parseInt(Math.ceil(listFeedbackProduct.length / perPage));
    res.render("admin/danh-sach-binh-luan-san-pham", {
        title: "Danh sách bình luận sản phẩm",
        user: req.session.user,
        listFeedbackProduct: listFeedbackProduct.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.getReplyFeedbackProduct = async (req, res, next) => {
    const id = req.params.id;
    const existedFeedbackProduct = await FeedbackProduct.findByPk(id);
    if (!existedFeedbackProduct) {
        res.send("Bình luận không tồn tại");
        return;
    }
    const detailFeedbackProduct = await FeedbackProduct.findOne({
        attributes: ['id', 'createTime', 'content', 'status', 'rating', 'reviews'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['id', 'name', 'phone', 'email']
            },
            {
                model: Products,
                required: false,
                attributes: ['id', 'name']
            }
        ],
        where: {
            id: existedFeedbackProduct.id
        }
    });
    const listReplyFeedbackProduct = await Replies.findAll({
        attributes: ['id', 'content', 'createTime'],
        where: {
            feedbackProduct_id: id
        }
    });
    res.render("admin/phan-hoi-binh-luan-san-pham", {
        title: 'Phản hồi bình luận sản phẩm',
        user: req.session.user,
        detailFeedbackProduct: detailFeedbackProduct,
        listReplyFeedbackProduct: listReplyFeedbackProduct
    })
}

exports.postReplyFeedbackProduct = async (req, res, next) => {
    const replyFeedback = req.body;
    if (replyFeedback.content == "") {
        res.send("Bạn chưa nhập thông tin phản hồi bình luận sản phẩm");
        return;
    }
    const replyFeedbackProduct = await Replies.create({
        content: replyFeedback.content,
        createTime: support.time(),
        feedbackProduct_id: replyFeedback.id
    });

    const user = req.session.user;
    if (user.role == 1) {
        role = "Admin"
    } else if (user.role == 2) {
        role = "Nhân viên"
    }
    const updateFeedbackProduct = await FeedbackProduct.update({
        status: "Đã phản hồi",
    }, {
        where: {
            id: replyFeedback.id
        }
    })
    res.redirect(`/portal/feedback/product/reply/id=${replyFeedback.id}`);
}

exports.editReplyFeedbackProduct = async (req, res, next) => {
    const reply = req.body;
    const existedReplyFeedback = await Replies.findByPk(reply.id);
    if (!existedReplyFeedback) {
        res.send("Phản hồi bình luận không tồn tại");
        return;
    }
    const updateReplyFeedback = await Replies.update({
        content: reply.content
    }, {
        where: {
            id: reply.id
        }
    });
    res.redirect(`/portal/feedback/product/reply/id=${reply.commentId}`)
}

exports.deleteFeedbackProduct = async (req, res, next) => {
    const id = req.params.id;
    const existedFeedbackProduct = await FeedbackProduct.findByPk(id);
    if (!existedFeedbackProduct) {
        res.send("Bình luận sản phẩm không tồn tại");
        return;
    };
    const deleteFeedbackProduct = await FeedbackProduct.destroy({
        where: {
            id: existedFeedbackProduct.id
        }
    });
    res.redirect("/portal/feedback/product/list?page=1");
}

exports.deleteReplyFeedbackProduct = async (req, res, next) => {
    const id = req.params.id;
    const commentId = req.query.comment;
    const page = req.query.page;
    const existedReplyFeedbackProduct = await Replies.findByPk(id);
    if (!existedReplyFeedbackProduct) {
        res.send("Bình luận sản phẩm không tồn tại");
        return;
    };
    const deleteReplyFeedbackProduct = await Replies.destroy({
        where: {
            id: existedReplyFeedbackProduct.id
        }
    });
    if (page == "reply") {
        res.redirect(`/portal/feedback/product/reply/id=${commentId}`);
    } else if (page == "edit") {
        res.redirect(`/portal/feedback/product/edit/id=${commentId}`);
    }
}

exports.approveFeedbackProduct = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedFeedback = await FeedbackProduct.findByPk(id);
    if (!existedFeedback) {
        res.send("Đánh giá sản phẩm không tồn tại");
        return;
    }
    const updateReviews = await FeedbackProduct.update({
        reviews: "Đã duyệt"
    }, {
        where: {
            id: id
        }
    });
    if (page == "list") {
        res.redirect("/portal/feedback/product/list"); 
    } else if (page == "detail") {
        res.redirect(`/portal/feedback/product/reply/id=${id}`);
    }
}

exports.unapprovalFeedbackProduct = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedFeedback = await FeedbackProduct.findByPk(id);
    if (!existedFeedback) {
        res.send("Đánh giá sản phẩm không tồn tại");
        return;
    }
    const updateReviews = await FeedbackProduct.update({
        reviews: "Chưa duyệt"
    }, {
        where: {
            id: id
        }
    });
    if (page == "list") {
        res.redirect("/portal/feedback/product/list"); 
    } else if (page == "detail") {
        res.redirect(`/portal/feedback/product/reply/id=${id}`);
    }
}