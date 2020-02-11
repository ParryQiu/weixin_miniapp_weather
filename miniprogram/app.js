//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      gugudataapikey: "YOUR_APP_KEY" // 请前往课程社区免费申请或前往 https://www.gugudata.com/ 申请
    }
  }
})