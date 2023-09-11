module.exports.ROLE = {
    ADMIN: 1,
    EMPLOYEE: 2,
    CUSTOMER: 3,
    VISITOR: 4
}

module.exports.PRODUCT_OBJECT = {
    ALL: 1,
    CHILDREN: 2,
    ADULTS: 3,
    ELDER: 4
}

module.exports.PRODUCT_TYPE = {
    ALL: 'all',
    NEW: 'new',
    HOT: 'hot',
    SALE: 'sale'
}

module.exports.STATUS_ORDER = {
    CONFIRM: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    DELIVERY: 'Đang giao hàng',
    COMPLETE: 'Đã giao hàng',
    CANCEL: 'Đã hủy',
    DIRECT: "Mua hàng trực tiếp"
}

module.exports.STATUS_PAYMENT = {
    UNPAID: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    REFUND: 'Đã hoàn tiền'
}

module.exports.TIME_JOBS = {
    PART: 'Parttime',
    FULL: 'Fulltime'
}

module.exports.STATUS_COMMENT = {
    RESPONSE: 'Đã phản hồi',
    NO_RESPONSE: 'Chưa phản hồi'
}

module.exports.STATUS_RECRUITMENT = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    INTERVIEW: 'Phỏng vấn',
    ELECT: 'Trúng tuyển',
    NOT_ACHIEVED: 'Không đạt',
    REJECT: 'Ứng viên từ chối'
}

module.exports.STATUS_CONTACT = {
    NO_PROCESS: 'Chưa xử lý',
    PROCESSED: 'Đã xử lý'
}

module.exports.STATUS_REVIEWS = {
    NO_APPROVED: 'Chưa duyệt',
    APPROVED: 'Đã duyệt'
}