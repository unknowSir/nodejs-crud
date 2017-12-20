var express = require('express');
var qiniu = require('qiniu');
var router = express.Router();


var accessKey = 'vktqZ89-4TFszXSyX3NjQDkdT8q_X-7ORoSIaq1A';
var secretKey = '8_80l-NpS45bIbPoOdfiJnwMzyJH1p30jowZOOgZ';
var options = {
  // 空间名字
  scope: "litcso",
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var uploadToken = putPolicy.uploadToken(mac);

router.get("/token", function (req, res, next) {
  console.log(uploadToken);
  res.send({
    "uptoken": uploadToken
  });
})
module.exports = router;