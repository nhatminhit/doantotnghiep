const Jobs = require('../../models/jobs');
const support = require('../../controllers/support');

exports.listJobs = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const listJobs = await Jobs.findAll({
        attribute: ['id', 'title', 'createTime', 'quantity', 'experience', 'location', 'deadline', 'position', 'salary'],
    });
    const totalPage = parseInt(Math.ceil(listJobs.length / perPage));
    res.render("admin/danh-sach-cong-viec", {
        title: "Danh sách công việc",
        user: req.session.user,
        listJobs: listJobs.slice(start, end),
        currentTime: support.timeCurrent(),
        pages: totalPage,
        current: page,
        perPage: perPage
    })
}

exports.getAddJobs = async (req, res, next) => {
    res.render("admin/them-cong-viec", {
        title: "Thêm mới công việc",
        user: req.session.user
    })
}

exports.postAddJobs = async (req, res, next) => {
    const jobs = req.body;
    if (jobs.title == "" || jobs.quantity == "" || jobs.deadline == "" || jobs.position == "" || 
        jobs.salary == "" || jobs.experience == "" || jobs.location == "" || jobs.description == "" ||
        jobs.requirements == "" || jobs.benefits == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
    }
    const createJobs = await Jobs.create({
        title: jobs.title,
        timeType: jobs.timeType,
        createTime: support.time(),
        quantity: jobs.quantity,
        experience: jobs.experience,
        location: jobs.location,
        deadline: jobs.deadline,
        position: jobs.position,
        salary: jobs.salary,
        description: jobs.description,
        requirements: jobs.requirements,
        benefits: jobs.benefits,
        user_id: req.session.user.id
    })
    res.redirect("/portal/jobs/list");
}

exports.getEditJobs = async (req, res, next) => {
    const id = req.params.id;
    const existedJobs = await Jobs.findByPk(id);
    if (!existedJobs) {
        res.send("Công việc không tồn tại");
        return;
    }
    const detailJobs = await Jobs.findOne({
        attribute: ['id', 'title', 'timeType', 'quantity', 'experience', 'location', 'deadline', 'position', 'salary', 'description', 'requirements', 'benefits'],
        where: {
            id: existedJobs.id
        }
    });
    res.render("admin/sua-thong-tin-cong-viec", {
        title: "Sửa thông tin công việc",
        user: req.session.user,
        detailJobs: detailJobs
    })
}

exports.postEditJobs = async (req, res, next) => {
    const jobs = req.body;
    if (jobs.title == "" || jobs.quantity == "" || jobs.deadline == "" || jobs.position == "" || 
        jobs.salary == "" || jobs.experience == "" || jobs.location == "" || jobs.description == "" ||
        jobs.requirements == "" || jobs.benefits == "") {
            res.send("Bạn chưa nhập đầy đủ thông tin");
            return;
    }
    const updateJobs = await Jobs.update({
        title: jobs.title,
        timeType: jobs.timeType,
        quantity: jobs.quantity,
        experience: jobs.experience,
        location: jobs.location,
        deadline: jobs.deadline,
        position: jobs.position,
        salary: jobs.salary,
        description: jobs.description,
        requirements: jobs.requirements,
        benefits: jobs.benefits,
        user_id: req.session.user.id
    }, {
        where: {
            id: jobs.id
        }
    })
    res.redirect("/portal/jobs/list");
}

exports.deleteJobs = async (req, res, next) => {
    const id = req.params.id;
    const existedJobs = await Jobs.findByPk(id);
    if (!existedJobs) {
        res.send("Công việc không tồn tại");
        return;
    }
    const deleteJobs = await Jobs.destroy({
        where: {
            id: existedJobs.id
        }
    });
    res.redirect("/portal/jobs/list");
}