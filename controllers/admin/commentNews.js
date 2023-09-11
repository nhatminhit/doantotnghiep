const Comments = require('../../models/comments');
const User = require('../../models/users');
const News = require('../../models/news');
const Replies = require('../../models/replies');
const support = require('../../controllers/support');

User.hasMany(Comments, {
    foreignKey: {
        name: 'user_id'
    }
});

Comments.belongsTo(User, {
    foreignKey: {
        name: 'user_id'
    }
});

News.hasMany(Comments, {
    foreignKey: {
        name: 'news_id'
    }
});

Comments.belongsTo(News, {
    foreignKey: {
        name: 'news_id'
    }
})

exports.listCommentNews = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const statusPage = req.query.status;
    const objectStatus = {};
    if (statusPage == "1") {
        objectStatus.status = "Chưa phản hồi"
    } else if (statusPage == "2") {
        objectStatus.status = "Đã phản hồi"
    }
    const listCommentNews = await Comments.findAll({
        attributes: ['id', 'content', 'createTime', 'status', 'reviews'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['name']
            },
            {
                model: News,
                required: false,
                attributes: ['title']
            }
        ],
        where: objectStatus
    });
    const totalPage = parseInt(Math.ceil(listCommentNews.length / perPage));
    res.render("admin/danh-sach-binh-luan-tin-tuc", {
        title: "Danh sách bình luận tin tức",
        user: req.session.user,
        listCommentNews: listCommentNews.slice(start, end),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.getRepliesNews = async (req, res, next) => {
    const id = req.params.id;
    const existedCommentNews = await Comments.findByPk(id);
    if (!existedCommentNews) {
        res.send("Bình luận không tồn tại");
        return;
    }
    const detailCommentNews = await Comments.findOne({
        attributes: ['id', 'createTime', 'content', 'status', 'reviews'],
        include: [
            {
                model: User,
                required: false,
                attributes: ['id', 'name', 'phone', 'email']
            },
            {
                model: News,
                required: false,
                attributes: ['id', 'title']
            }
        ],
        where: {
            id: existedCommentNews.id
        }
    });
    const listRepliesNews = await Replies.findAll({
        attributes: ['id', 'content', 'createTime'],
        where: {
            commentNews_id: id
        }
    });
    res.render("admin/phan-hoi-binh-luan-tin-tuc", {
        title: 'Phản hồi bình luận tin tức',
        user: req.session.user,
        detailCommentNews: detailCommentNews,
        listRepliesNews: listRepliesNews
    })
}

exports.postRepliesNews = async (req, res, next) => {
    const replyComment = req.body;
    if (replyComment.content == "") {
        res.send("Bạn chưa nhập thông tin phản hồi bình luận tin tức");
        return;
    }
    const replyCommentNews = await Replies.create({
        content: replyComment.content,
        createTime: support.time(),
        commentNews_id: replyComment.id,
    });

    const user = req.session.user;
    if (user.role == 1) {
        role = "Admin"
    } else if (user.role == 2) {
        role = "Nhân viên"
    }
    const updateCommentNews = await Comments.update({
        status: "Đã phản hồi",
    }, {
        where: {
            id: replyComment.id
        }
    })
    res.redirect(`/portal/comment/news/reply/id=${replyComment.id}`);
}

exports.editRepliesNews = async (req, res, next) => {
    const reply = req.body;
    const existedReplyComment = await Replies.findByPk(reply.id);
    if (!existedReplyComment) {
        res.send("Phản hồi bình luận không tồn tại");
        return;
    }
    const updateReplyComment = await Replies.update({
        content: reply.content
    }, {
        where: {
            id: reply.id
        }
    });
    res.redirect(`/portal/comment/news/reply/id=${reply.commentId}`)
}

exports.deleteCommentNews = async (req, res, next) => {
    const id = req.params.id;
    const existedCommentNews = await Comments.findByPk(id);
    if (!existedCommentNews) {
        res.send("Bình luận sản phẩm không tồn tại");
        return;
    };
    const deleteCommentNews = await Comments.destroy({
        where: {
            id: existedCommentNews.id
        }
    });
    res.redirect("/portal/comment/news/list?page=1");
}

exports.deleteRepliesNews = async (req, res, next) => {
    const id = req.params.id;
    const commentId = req.query.comment;
    const page = req.query.page;
    const existedReplyCommentNews = await Replies.findByPk(id);
    if (!existedReplyCommentNews) {
        res.send("Bình luận sản phẩm không tồn tại");
        return;
    };
    const deleteReplyCommentNews = await Replies.destroy({
        where: {
            id: existedReplyCommentNews.id
        }
    });
    if (page == "reply") {
        res.redirect(`/portal/comment/news/reply/id=${commentId}`);
    } else if (page == "edit") {
        res.redirect(`/portal/comment/news/edit/id=${commentId}`)
    }
}

exports.approveCommentNews = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedComment = await Comments.findByPk(id);
    if (!existedComment) {
        res.send("Bình luận tin tức không tồn tại");
        return;
    }
    const updateReviews = await Comments.update({
        reviews: "Đã duyệt"
    }, {
        where: {
            id: id
        }
    });
    if (page == "list") {
        res.redirect("/portal/comment/news/list"); 
    } else if (page == "detail") {
        res.redirect(`/portal/comment/news/reply/id=${id}`);
    }
}

exports.unapprovalCommentNews = async (req, res, next) => {
    const id = req.query.id;
    const page = req.query.page;
    const existedComment = await Comments.findByPk(id);
    if (!existedComment) {
        res.send("Bình luận tin tức không tồn tại");
        return;
    }
    const updateReviews = await Comments.update({
        reviews: "Chưa duyệt"
    }, {
        where: {
            id: id
        }
    });
    if (page == "list") {
        res.redirect("/portal/comment/news/list"); 
    } else if (page == "detail") {
        res.redirect(`/portal/comment/news/reply/id=${id}`);
    }
}