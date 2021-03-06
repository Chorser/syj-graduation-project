var Bmob = require('../../utils/bmob.js');
const app = getApp()

Page({
  data: {
    navbarData: {
      showCapsule: false, //是否显示左上角图标：1表示显示，0表示不显示
      title: 'Echange·授权登录',
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,


    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false
  },

  onLoad: function() {
    if (Bmob.User.current()) { //已登录
      var objectId = Bmob.User.current().id;
      //获取用户信息
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);
      // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
      query.get(objectId, {
        success: function(result) {
          app.globalData.currentUser = result;
          console.log("currentUser", result)
        }
      })

      wx.switchTab({
        url: '../home/home'
      })
    }
  },

  //一键登录
  bindGetUserInfo: function(e) {
    var that = this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮后需要处理的逻辑方法体
      wx.login({
        success: function(res) {
          var user = new Bmob.User(); //实例化
          user.loginWithWeapp(res.code).then(function(user) { //返回的是Bmob里存储的_User信息
            console.log("loginWithWeapp result ", user);
            if (user.get("nickName")) {
              //更新缓存中的openid
              console.log("openid:", user.get('authData').weapp.openid);
              wx.setStorageSync('openid', user.get('authData').weapp.openid);
            } else {
              //从微信端获取用户信息
              wx.getUserInfo({
                success: function(result) {
                  console.log(result.userInfo)
                  app.globalData.userInfo = result.userInfo;
                  var nickName = result.userInfo.nickName;
                  var avatarUrl = result.userInfo.avatarUrl;
                  var gender = result.userInfo.gender;
                  var city = result.userInfo.city;
                  var province = result.userInfo.province;

                  var u = Bmob.Object.extend("_User");
                  var query = new Bmob.Query(u);
                  // 这个 id 是要修改条目的 id，在生成这个存储并成功时可以获取到
                  // 保存到数据库
                  query.get(user.id, {
                    success: function(result) {
                      // 自动绑定之前的账号
                      result.set("nickName", nickName);
                      result.set("avatarUrl", avatarUrl);

                      var file = new Bmob.File(avatarUrl, avatarUrl);
                      file.save();
                      result.set("avatar", file);

                      result.set("gender", gender);
                      result.set("city", city);
                      result.set("province", province);
                      // result.set("openid", wx.getStorageSync("openid")); //objectId是id, oepnid是另外的
                      result.save();

                      wx.switchTab({
                        url: '../home/home'
                      })
                    }
                  });
                }
              });
            }

            wx.switchTab({
              url: '../home/home'
            })

          }, function(err) {
            console.log(err, 'err');
          });
        }
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了"返回授权"')
          }
        }
      })
    }
  }

})