
$(function () {
  // 查询参数
  var QueryPage = {
    page: 1,
    rows: 5,
    title: ""
  };
  // 操作类型
  // 0 新增 1 编辑 2 删除 默认为0 新增
  var ManagerType = 0;
  // 总页数
  var TotalPages = 1;
  // 要删除数据的id
  var DelID = -1;
  getList(setPage);
  function getList(callback) {
    QueryPage.title = $.trim($(".searchInp").val());
    $.get("users/getList", QueryPage, function (result) {
      // 计算总页数
      TotalPages = Math.ceil(result.total / QueryPage.rows);
      var html = template("tblTpl", result);
      $("table").html(html);
      callback && callback();
    })
  }
  function setPage(params) {
    // bs 分页插件设置
    var options = {
      bootstrapMajorVersion: 3,
      currentPage: QueryPage.page,//当前页面  
      numberOfPages: QueryPage.rows,//一页显示几个按钮（在ul里面生成5个li）  
      totalPages: TotalPages,//总页数  
      onPageClicked: function (event, originalEvent, type, page) {
        QueryPage.page = page;
        getList(setPage);
      }
    }
    $(".pagination").bootstrapPaginator(options);
  }



  // 搜索
  $(".searchBtn").click(function (params) {
    QueryPage.page = 1;
    getList(setPage);
    // 点击搜索后 设置分页插件自动回到第一页
    $(".pagination").bootstrapPaginator("showFirst");
  })

  // 选择图片后,在前端即时预览
  $("#fileInp").change(function (e) {
    // console.log(e);
    var file = e.target.files[0];
    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
      $("#src").attr("src", fr.result);
    }
  })

  // 编辑
  $("table ").on("click", ".dataEditBtn", function (e) {
    /* 
    0 存入当前操作提示 编辑 ManagerType=1 
    1 弹出对话框
    2 填充表单
    3 去除 文件上传按钮 required属性
     */
    ManagerType = 1;
    $("#myModal").modal("show");

    // 获取被操作的行上的元数据 data-value
    //parentsUntil  查找当前元素的所有的父辈元素，直到遇到匹配的那个元素为止。 包含了下面所有找到的父辈元素，但不包括那个选择器匹配到的元素。 
    var obj = $(e.target).parents("tr").data("value");

    // 2 填充数据
    $("input[name='title']").val(obj.title);
    $("input[name='id']").val(obj.id);
    // $("input[name='src']").val(obj.src);
    $("[name='des']").val(obj.des);
    $("[name='type']").val(obj.type);
    // 图片按钮
    $("input[name='srcImage']").attr("src", obj.src);

    // 3 
    // $("input[type='src']").removeAttr("required");
    // 可能存在编辑文件时 没重新提交图片 所以去除验证
    $("#fileInp").removeAttr("required");
  })

  // 新增
  $("#add").click(function (e) {
    /* 
    1 操作类型
    2 弹出对话框
    3 清空表单
    4 添加文件上传按钮 required属性
     */
    ManagerType = 0;
    $("#myModal").modal("show");
    $("input[name='src']").attr("required", "");
    $("#ff")[0].reset();
    // 清除图片路径的隐藏于
    $("input[name='src']").val("");
    // 清除图片按钮
    $("input[type='image']").attr("src", "");
    $("input[type='image']").val("");
  })

  // 提交
  $("#ff").submit(function (e) {
    /* 
    1 发送了3个ajax a 请求上传图片的token b 上传到七牛 获取图片链接 c 将数据插入到后台
     */
    e.preventDefault();

    // formData.append("src", $("input[name='src']").val());
    // 判断操作类型 0 为新增  1 为编辑 2 为删除
    if (ManagerType == 0) {
      // 获取最新的token
      $.get("/qiniu/token", function (token) {
        var file = $("#fileInp")[0].files[0];
        // 构造formdata 上传到七牛使用
        var f = new FormData();
        f.append("key", Date.now() + file.name);
        f.append("token", token.uptoken);
        f.append("file", file);
        $.ajax({
          url: "http://upload.qiniup.com/",
          type: "POST",
          data: f,
          cache: false,
          // 不用jq处理
          processData: false,
          contentType: false,
          success: function (r) {
            // console.log(r);
            // 外链名字
            var namepace = "http://p1935eslc.bkt.clouddn.com/";
            // 图片的完整名字
            var imgPath = namepace + r.key;
            // 构造参数,添加到后台
            $("input[name='src']").val(imgPath);
            var formData = new FormData($("#ff")[0]);
            $.ajax({
              url: "/users/add",
              type: "POST",
              data: formData,
              cache: false,
              // 不用jq处理
              processData: false,
              contentType: false,
              success: function (result) {
                // console.log(e);
                // 关闭对话框 刷新数据列表
                $("#myModal").modal("hide");
                QueryPage = {
                  page: 1,
                  rows: 5
                };
                getList(setPage);
              },
              error: function (e) {
                // console.log(e);
              }
            });
          }
        });
      });
    } else if (ManagerType == 1) {
      // 编辑
      var formData = new FormData($("#ff")[0]);
      $.ajax({
        url: "/users/edit",
        type: "POST",
        data: formData,
        cache: false,
        // 不用jq处理
        processData: false,
        contentType: false,
        success: function (result) {
          // console.log(e);
          // 关闭对话框 刷新数据列表
          $("#myModal").modal("hide");
          QueryPage = {
            page: 1,
            rows: 5
          };
          getList(setPage);
        },
        error: function (e) {
          // console.log(e);
        }
      })
    }
  });

  // 删除
  $("table").on("click", ".dataDelBtn", function (e) {
    var id = $(e.target).parents("tr").data("value").id;
    DelID = id;
    $("#deleteModal").modal("show");
  });
  // 提交删除
  $(".delSubBtn").click(function (e) {
    /* 
    1 发送删除请求
    2 关闭对话框
    3 刷新数据
     */
    $.get("users/del?id=" + DelID, function (result) {
      $("#deleteModal").modal("hide");
      if (result.status == 0) {
        // 成功
        QueryPage.page = 1;
        getList(setPage);
      }
    })
  })
})

// 显示进度条
$(window).ajaxStart(function () {
  $(".mask").show();
})
// 隐藏进度条
$(window).ajaxStop(function () {
  $(".mask").hide();
})
