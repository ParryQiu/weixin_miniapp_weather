//index.js
const app = getApp()

Page({
  data: {
    scrollHeight: 0, // 滚动区域的高度
    iconImageHeight: 0,
    location: 'loading...',
    weatherArray: [],
    listArray: [], // json
    WeatherDataGenerateDateTime: "loading...",
    tips: "loading...",
    weatherIcon: "/images/icons/weather_icon_47.svg",
    currentTemperature: "N/A"
  },

  onLoad: function () {
    this.calcScrollHeight();
    let that = this;
    // 页面加载完毕，获取用户的定位信息
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        wx.request({
          url: 'https://api.gugudata.com/location/geodecode?appkey=' + app.globalData.gugudata_geodecode_apikey + '&longitude=' + longitude + '&latitude=' + latitude,
          header: {
            'content-type': 'application/json'
          },
          success(res) {
            if(!res.data || !res.data.Data){
              console.error(res.data.DataStatus);
              return;
            }
            that.setData({
              location: res.data.Data[0].Township + ', ' + res.data.Data[0].District,
            });
            wx.request({
              url: 'https://api.gugudata.com/weather/weatherinfo/region?appkey=' + app.globalData.gugudata_weatherinfo_apikey + '&keyword=' + res.data.Data[0].District.replace('区', ''),
              header: {
                'content-type': 'application/json'
              },
              success(res) {
                wx.request({
                  url: 'https://api.gugudata.com/weather/weatherinfo?appkey=' + app.globalData.gugudata_weatherinfo_apikey + '&code=' + res.data.Data[0].Code + '&days=6',
                  header: {
                    'content-type': 'application/json'
                  },
                  success(res) {
                    that.setData({
                      weatherArray: that.remapData(res.data.Data)
                    });

                    let WeatherDataGenerateDateTime;
                    if (res.data.Data.length > 0) {
                      let regex = /(\d{2}:\d{2}):\d{2}/g.exec(res.data.Data[0].WeatherDataGenerateDateTime);
                      WeatherDataGenerateDateTime = regex[1];
                      that.setData({
                        WeatherDataGenerateDateTime: WeatherDataGenerateDateTime,
                        currentTemperature: res.data.Data[0].TemperatureHigh,
                        tips: res.data.Data[0].LifeHelperWear.HelperContent.replace("。", ""),
                        weatherIcon: that.getWeatherIcon(res.data.Data[0].WeatherInfo)
                      });
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  },

  // 计算滚动区域的高度
  calcScrollHeight() {
    let that = this;
    let query = wx.createSelectorQuery().in(this);
    query.select('.top').boundingClientRect(function (res) {
      let topHeight = res.height;
      let screenHeight = wx.getSystemInfoSync().windowHeight;

      let scrollHeight = screenHeight - topHeight - 70; // 屏幕的高度 - 头部蓝色区域高 - 标题栏

      that.setData({
        scrollHeight: scrollHeight,
        iconImageHeight: topHeight / 2
      })
    }).exec();
  },

  remapData(data) {
    let listData = [];
    for (let i = 0; i < data.length; i++) {
      data[i].weekday = this.getWeekday(data[i].WeatherDataGenerateDateTime);
      data[i].icon = this.getWeatherIcon(data[i].WeatherInfo);
      if (i != 0) {
        listData.push(data[i])
      }
    }
    this.setData({
      listArray: listData,
    });

    return data;
  },

  getWeekday(date) {
    var mydate = new Date(date);
    var myddy = mydate.getDay();
    var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekday[myddy];
  },
  
  getWeatherIcon(weather) {
    switch (weather) {
      case "多云转中雨":
        return "/images/icons/weather_icon_17.svg";
      case "多云转晴":
        return "/images/icons/weather_icon_3.svg";
      case "中雨转多云":
        return "/images/icons/weather_icon_8.svg";
      case "晴转多云":
        return "/images/icons/weather_icon_3.svg";
      case "多云":
        return "/images/icons/weather_icon_2.svg";
      case "雷阵雨转多云":
        return "/images/icons/weather_icon_24.svg"
        break;
    }
  }
})