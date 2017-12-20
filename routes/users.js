var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var orm = require('orm');
router.get('/', function (req, res, next) {
  res.render('user', { title: '我来拉' });
});

router.get("/getList", function (req, res, next) {
  // 获取分页数据
  var page = +req.query.page;
  var rows = +req.query.rows;
  var title = req.query.title;
  // 注意要传入的类型是数字
  // limit 限制一共取几条 rows
  // offset 往后偏移几条   下一页的条数
  // mysql查询参数
  var queryObj = { isDelete: "0", title: orm.like('%' + title + '%') };
  // req.models.media.find( { isDelete: "0" }).where("title like ? ",['%'+title+'%']).all().limit(rows).offset((page - 1) * rows).run(function (error0, medias) {
  req.models.media.find(queryObj).all().limit(rows).offset((page - 1) * rows).run(function (error0, medias) {
    if (error0) res.send(error0);
    req.models.media.count(queryObj, function (error1, count) {
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

// 删除
router.get("/del", function (req, res, next) {
  var id = req.query.id;
  req.models.media.get(id, function (err, oldData) {
    if (err) throw err;
    oldData.isDelete = 1;
    oldData.save(function (err1) {
      if (err1) throw err1;
      res.send({ status: 0, msg: "删除成功" });
    })
  })
})

/* post 添加 */
router.post("/add", multipartMiddleware, function (req, res, next) {
  var file = req.files.src;
  saveFile(file, '', function (imgPath) {
    var formBody = req.body;
    formBody.src = imgPath;
    formBody.createTime = Date.now();
    formBody.isDelete = 0;
    req.models.media.create(formBody, function (err) {
      if (err) throw err;
      // 正常执行
      res.send({ status: 0, msg: "新增成功" });
    })
  });
})

// 编辑
router.post("/edit", multipartMiddleware, function (req, res, next) {
  /* 
  1 有修改了图片文件的 重新保存和提交
  2 没有修改图片的 只修改字段即可
   */
  var formBody = req.body;
  // 获取旧的数据
  req.models.media.get(formBody.id, function (err, oldData) {
    oldData.title = formBody.title;
    oldData.des = formBody.des;
    oldData.type = formBody.type;
    //   判断有没有修改图片
    if (req.files.src.name) {
      var file = req.files.src;
      saveFile(file, '', function (imgPath) {
        oldData.src = imgPath;
        // 保存数据 同步保存数据
        oldData.save(function (err) {
          if (err) throw err;
          res.send({ status: 0, msg: "编F辑成功" });
        });
      });
    } else {
      oldData.save(function (err) {
        if (err) throw err;
        res.send({ status: 0, msg: "编辑成功" });
      });
    }
  });
})
/**
 * 
 * @param {*要保存的文件} file 
 * @param {*文件保存的全路径} path  abc/
 * @param {*回调函数} callback 参数 imgPath 图片全路径
 */
function saveFile(file, path, callback) {
  fs.readFile(file.path, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // 存储文件
      var imgPath = "uploads/" + path +Date.now()+ file.originalFilename;
      fs.writeFile("public/" + imgPath, data, function (err1) {
        if (err1) {
          console.log(err1);
        } else {
          // 存入数据库
          callback(imgPath);
        }
      });
    }
  });
}
module.exports = router;
