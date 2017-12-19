var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
/* GET users listing. */
router.get('/', function (req, res, next) {
  // req.models.media.all({ isDelete: "0" }, function (error, media) {
  //   // res.send(media);
  //   res.render('user', { rows: media });
  // });
  // res.render('user', {  });
  res.render('user', { title: '我来拉' });
});

router.get("/getList", function (req, res, next) {
  // 获取分页数据
  var page = +req.query.page;
  var rows = +req.query.rows;
  console.log(rows);
  // 注意要传入的类型是数字
  // limit 限制一共取几条 rows
  // offset 往后偏移几条   下一页的条数
  req.models.media.find({ isDelete: "0" }).limit(rows).offset((page - 1) * rows).run(function (error0, medias) {
    if (error0) res.send(error0);
    req.models.media.count({ isDelete: "0" }, function (error1, count) {
      if (error1) res.send(error1);
      // medias.total = count;
      var obj = {
        data: medias,
        total: count,
        page: page,
        rows: rows
      };
      res.send(obj);
    });
  })
});


/* GET users listing. */
// router.get('/', function (req, res, next) {
//  res.send("请使用post提交");
// });

/* post 提交 */
router.post("/uploads", multipartMiddleware, function (req, res, next) {
  var file = req.files.src;
  fs.readFile(file.path, function (err, data) {
    if (err) {
      console.log(err);
      res.send("上传出错");
    } else {
      // 存储文件
      var imgPath = "uploads/" + file.originalFilename;
      fs.writeFile("public/" + imgPath, data, function (err1) {
        if (err1) {
          res.send("写入出错");
        } else {
          // 存入数据库
          var formBody = req.body;
          formBody.src = imgPath;
          formBody.createTime = Date.now();
          formBody.isDelete = 0;
          req.models.media.create(formBody, function (err) {
            if (err) throw err;
            // 正常执行
            res.send({ status: 0, msg: "新增成功" });
          })
          // console.log(req.body);
        }
      });
    }
  });
})

module.exports = router;
