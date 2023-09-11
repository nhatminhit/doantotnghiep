const User = require("../../models/users");
const News = require("../../models/news");
const Comments = require("../../models/comments");
const support = require("../../controllers/support");

User.hasMany(Comments, {
    foreignKey: {
        name: 'user_id'
    }
});

Comments.belongsTo(User, {
    foreignKey: {
        name: 'user_id'
    }
})

exports.listNews = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listNews = await News.findAll();
    const totalPage = parseInt(Math.ceil(listNews.length / perPage));
    const listNewsHot = await News.findAll({
        attributes: ['id', 'image', 'title', 'createTime'],
        where: {
            type: 'hot'
        }
    });
    const listNewsView = await News.findAll({
        attributes: ['id', 'image', 'title', 'createTime', 'view'],
        order: [
            ['view', 'DESC']
        ],
        limit: 10
    });
    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    const listJobs = await support.getListJobs(10);
    res.render("customer/tin-tuc", {
        title: "Tin tức",
        user: req.session.user,
        pages: totalPage,
        current: page,
        listNews: listNews.slice(start, end),
        listNewsHot: listNewsHot,
        listJobs: listJobs,
        listNewsView: listNewsView,
        cart: cart,
        total: total
    })
}

exports.detailNews = async (req, res, next) => {
    const id = req.params.id;
    const existedNews = await News.findByPk(id);
    // if (!existedNews) {
    //     res.redirect("")
    // }
    const view = await News.update({
        view: existedNews.view + 1
    }, {
        where: {
            id: id
        }
    });
    const listNews = await News.findAll({
        limit: 4
    });
    const commentNews = await Comments.findAll({
        include: [
            {
                model: User,
                required: false,
                attributes: ['name', 'avatar']
            }
        ],
        where: {
            news_id: id,
            reviews: "Đã duyệt"
        }    
    })

    const listNewsHot = await News.findAll({
        attributes: ['id', 'image', 'title', 'createTime'],
        where: {
            type: 'hot'
        }
    });
    const listNewsView = await News.findAll({
        attributes: ['id', 'image', 'title', 'createTime', 'view'],
        order: [
            ['view', 'DESC']
        ],
        limit: 10
    });
    const listJobs = await support.getListJobs(10);

    var cart = [];
    var total = 0;
    if (req.session.user != undefined) {
        cart = await support.getCart(req.session.user.id);
        total = await support.getTotal(req.session.user.id);
    }
    res.render("customer/chi-tiet-tin-tuc", {
        title: existedNews.title,
        user: req.session.user,
        detailNews: existedNews,
        listNews: listNews,
        commentNews: commentNews,
        listNewsHot: listNewsHot,
        listJobs: listJobs,
        listNewsView: listNewsView,
        cart: cart,
        total: total
    })
}

exports.commentNews = async (req, res, next) => {
    const newsId = req.body.newsId;
    const content = req.body.content;
    const name = req.body.name || "";
    const email = req.body.email || "";

    var userId = 0;
    if (req.session.user != undefined) {
        userId = req.session.user.id;
    } else {
        const createUser = await User.create({
            name: name,
            email: email,
            role: 'visitor',
            avatar: '/avatar/anhdaidien.jpg'
        });
        userId = createUser.id;
    }

    const commentNews = await Comments.create({
        content: content,
        createTime: support.time(),
        status: 'Chưa phản hồi',
        reviews: 'Chưa duyệt',
        news_id: newsId,
        user_id: userId
    });
    const linkNews = `/news/detail/id=${newsId}`;
    res.redirect(linkNews);
}