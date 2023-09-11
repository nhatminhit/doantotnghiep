var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
dotenv.config();

// Customer
var indexRouter = require('./routes/customer/index');
var usersRouter = require('./routes/customer/users');
var shopRouter = require('./routes/customer/shop');
var cartRouter = require('./routes/customer/cart');
var orderRouter = require('./routes/customer/order');
var newsRouter = require('./routes/customer/news');
var jobsRouter = require('./routes/customer/jobs');
var contactRouter = require('./routes/customer/contact');
var categoryRouter = require('./routes/customer/category');

// Admin
var usersAdminRouter = require('./routes/admin/users');
var indexAdminRouter = require('./routes/admin/index');
var categoryAdminRouter = require('./routes/admin/category');
var productAdminRouter = require('./routes/admin/product');
var producerAdminRouter = require('./routes/admin/producer');
var orderAdminRouter = require('./routes/admin/order');
var feedbackProductRouter = require('./routes/admin/feedbackProduct');
var commentNewsRouter = require('./routes/admin/commentNews');
var newsAdminRouter = require('./routes/admin/news');
var jobsAdminRouter = require('./routes/admin/jobs');
var recruitmentAdminRouter = require('./routes/admin/recruitment');
var contactAdminRouter = require('./routes/admin/contact');
var supportAdminRouter = require('./routes/admin/support');

var authRouter = require('./routes/auth');

var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/images/background')));
app.use(express.static(path.join(__dirname, 'public/images/category')));
app.use(express.static(path.join(__dirname, 'js')));
app.use("/avatar", express.static(path.join(__dirname, 'uploads/avatar')));
app.use("/product", express.static(path.join(__dirname, 'uploads/products')));
app.use("/news", express.static(path.join(__dirname, 'uploads/news')));
app.use("/file", express.static(path.join(__dirname, 'uploads/file')));
app.use("/category", express.static(path.join(__dirname, 'uploads/categories')));
app.use("/producer", express.static(path.join(__dirname, 'uploads/producer')));

//Customer
app.use('/auth', authRouter)
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shop', shopRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/news', newsRouter);
app.use('/jobs', jobsRouter);
app.use('/contact', contactRouter);
app.use('/category', categoryRouter);

//Admin
app.use('/portal/users', usersAdminRouter);
app.use('/portal', indexAdminRouter);
app.use('/portal/category', categoryAdminRouter);
app.use('/portal/product', productAdminRouter);
app.use('/portal/producer', producerAdminRouter);
app.use('/portal/order', orderAdminRouter);
app.use('/portal/news', newsAdminRouter);
app.use('/portal/feedback/product', feedbackProductRouter);
app.use('/portal/comment/news', commentNewsRouter);
app.use('/portal/jobs', jobsAdminRouter);
app.use('/portal/recruitment', recruitmentAdminRouter);
app.use('/portal/contact', contactAdminRouter);
app.use('/portal/support', supportAdminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
