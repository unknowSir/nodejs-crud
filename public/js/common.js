$(function () {

  template.helper("toJson", function (str) {
    return JSON.stringify(str);
  });

  // 将数字转为 对应的多媒体类型
  template.helper("toType", function (num) {
    var str = "默认";
    switch (num) {
      case -1:
        break;
      case 0:
        str = "轮播图";
        break;
      case 1:
        str = "优秀标兵";
        break;
      case 2:
        str = "状态";
        break;
      case 3:
        str = "动态";
        break;
      default:
        break;
    }
    return str;
  })
})