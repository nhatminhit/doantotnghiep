const User = require("../../models/users");
const Product = require("../../models/products");
const Order = require("../../models/orders");
const {Op} = require('sequelize');
const constant = require("../../commons/constant");
const support = require("../../controllers/support");
const Jobs = require("../../models/jobs");
const FeedbackProduct = require("../../models/feedbacks");
const Comments = require("../../models/comments");
const Recruitment = require("../../models/recruitments");

exports.dashboard = async (req, res, next) => {
    const countCustomer = await support.countUser(constant.ROLE.CUSTOMER);
    const countAdmin = await support.countUser(constant.ROLE.ADMIN);
    const countEmployee = await support.countUser(constant.ROLE.EMPLOYEE);
    const countVisitor = await support.countUser(constant.ROLE.VISITOR);
    const totalProduct = await Product.count();
    const totalOrder = await Order.count();
    const countOutOfStock = await Product.count({where: {quantity: {[Op.lte] : 10}}})
    const totalUser = await User.count();
    const countNewProduct = await support.countProduct(constant.PRODUCT_TYPE.NEW);
    const countSaleProduct = await support.countProduct(constant.PRODUCT_TYPE.SALE);
    const countHotProduct = await support.countProduct(constant.PRODUCT_TYPE.HOT);
    const countChildrenProduct = await support.countObjectProduct(constant.PRODUCT_OBJECT.CHILDREN);
    const countAdultsProduct = await support.countObjectProduct(constant.PRODUCT_OBJECT.ADULTS);
    const countElderProduct = await support.countObjectProduct(constant.PRODUCT_OBJECT.ELDER);
    const countConfirmOrder = await support.countStatusOrder(constant.STATUS_ORDER.CONFIRM);
    const countConfirmedOrder = await support.countStatusOrder(constant.STATUS_ORDER.CONFIRMED);
    const countDeliveryOrder = await support.countStatusOrder(constant.STATUS_ORDER.DELIVERY);
    const countCompleteOrder = await support.countStatusOrder(constant.STATUS_ORDER.COMPLETE);
    const countCancelOrder = await support.countStatusOrder(constant.STATUS_ORDER.CANCEL);
    const countUnpaidOrder = await support.countPaymentOrder(constant.STATUS_PAYMENT.UNPAID);
    const countPaidOrder = await support.countPaymentOrder(constant.STATUS_PAYMENT.PAID);
    const totalJob = await Jobs.count();
    const countTime1Job = await support.countTime1Job();
    const countTime2Job = await support.countTime2Job();
    const countFulltimeJob = await support.countTypeTimeJob(constant.TIME_JOBS.FULL);
    const countPartimeJob = await support.countTypeTimeJob(constant.TIME_JOBS.PART);
    const totalFeedbackProduct = await FeedbackProduct.count();
    const totalCommentNews = await Comments.count();
    const countNoApprovedFeedback = await support.countReviewsFeedback(constant.STATUS_REVIEWS.NO_APPROVED);
    const countApprovedFeedback = await support.countReviewsFeedback(constant.STATUS_REVIEWS.APPROVED);
    const countNoResponseFeedbackProduct = await support.countStatusFeedbackProduct(constant.STATUS_COMMENT.NO_RESPONSE);
    const countResponseFeedbackProduct = await support.countStatusFeedbackProduct(constant.STATUS_COMMENT.RESPONSE);
    const countNoApprovedNews = await support.countReviewsNews(constant.STATUS_REVIEWS.NO_APPROVED);
    const countApprovedNews = await support.countReviewsNews(constant.STATUS_REVIEWS.APPROVED);
    const countNoResponseCommentNews = await support.countStatusCommentNews(constant.STATUS_COMMENT.NO_RESPONSE);
    const countResponseCommentNews = await support.countStatusCommentNews(constant.STATUS_COMMENT.RESPONSE);
    const totalRecruitment = await Recruitment.count();
    const countPendingRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.PENDING);
    const countApprovedRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.APPROVED);
    const countInterviewRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.INTERVIEW);
    const countElectRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.ELECT);
    const countNotAchievedRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.NOT_ACHIEVED);
    const countRejectRecruitment = await support.countStatusRecruitment(constant.STATUS_RECRUITMENT.REJECT);

    res.render('admin/dashboard', {
        title: "Dashboard",
        user: req.session.user,
        countCustomer: countCustomer,
        totalProduct: totalProduct,
        totalOrder: totalOrder,
        countOutOfStock: countOutOfStock,
        totalUser: totalUser,
        countAdmin: countAdmin,
        countEmployee: countEmployee,
        countVisitor: countVisitor,
        countNewProduct: countNewProduct,
        countSaleProduct: countSaleProduct,
        countHotProduct: countHotProduct,
        countChildrenProduct: countChildrenProduct,
        countAdultsProduct: countAdultsProduct,
        countElderProduct: countElderProduct,
        countConfirmOrder: countConfirmOrder,
        countConfirmedOrder: countConfirmedOrder,
        countDeliveryOrder: countDeliveryOrder,
        countCompleteOrder: countCompleteOrder,
        countCancelOrder: countCancelOrder,
        countUnpaidOrder: countUnpaidOrder,
        countPaidOrder: countPaidOrder,
        totalJob: totalJob,
        countTime1Job: countTime1Job,
        countTime2Job: countTime2Job,
        countFulltimeJob: countFulltimeJob,
        countPartimeJob: countPartimeJob,
        totalFeedbackProduct: totalFeedbackProduct,
        totalCommentNews: totalCommentNews,
        countNoApprovedFeedback: countNoApprovedFeedback,
        countApprovedFeedback: countApprovedFeedback,
        countNoResponseFeedbackProduct: countNoResponseFeedbackProduct,
        countResponseFeedbackProduct: countResponseFeedbackProduct,
        countNoApprovedNews: countNoApprovedNews,
        countApprovedNews: countApprovedNews,
        countNoResponseCommentNews: countNoResponseCommentNews,
        countResponseCommentNews: countResponseCommentNews,
        totalRecruitment: totalRecruitment,
        countPendingRecruitment: countPendingRecruitment,
        countApprovedRecruitment: countApprovedRecruitment,
        countInterviewRecruitment: countInterviewRecruitment,
        countElectRecruitment: countElectRecruitment,
        countNotAchievedRecruitment: countNotAchievedRecruitment,
        countRejectRecruitment: countRejectRecruitment 
    });
};