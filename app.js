var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// 引入orm模块
var orm = require('orm');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
// 设置静态文件目录
app.use(express.static('public'));

// 定义数据模型 将模型绑定到 req对象上
app.use(orm.express("mysql://root@localhost/cso2017", {
  define: function (db, models, next) {
    var media= db.define("media", {
      // 字段都是和mysql中对应的
      id: { type: 'serial', key: true },
      title: { type: 'text' },
      src: { type: 'text' },
      des: { type: 'text' },
      createTime: { type: 'text' },
      type: { type: 'number' },
      isDelete: { type: 'number' }
    });
    models.media=media;
    next();
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// 修改视图引擎jade改为xtemplate
app.set('view engine', 'xtpl');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// 修改上传文件的大小
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 用来指定路由处理的
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.send(err);
});

module.exports = app;

