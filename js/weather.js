const app = new Vue({
  el: ".weather",
  data: {
    weatherData: [],//獲得的所有資料
    futureData: [],
    currentLNum: 0,//當前地區的陣列索引
    now: {
      currentC: "", //當前城市
      currentL: "", //當前地區
      regionsList: [],//所有當前城市地區
      whichDay: 0,//哪一天(0=今天)
      info: {//當前天氣資訊
        t: 0,//氣溫
        wx: "",//天氣現象
        at: 0,//體感溫度
        uvi: "",//紫外線
        rh: 0,//濕度
        pop12h: 0,//降雨機率
        wd: "",//風向
        weatherP: "",//天氣
        weatherIMG: "",//天氣圖
      },
    },
    CorF: true,//度C或是度F(度C為true)
    searchBox: "",//搜索框
    isFocus: false
  },
  created() {
    this.getURL();
  },
  methods: {
    //和中央氣象局連接資料
    getURL: function (c = "台中市") {
      const authorization = "CWB-422B0FA3-E374-492D-B54A-4D8942BE2B7E";
      const url = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/";

      c = (c[0] == "台") ? "臺" + c.slice(1) : c;
      this.now.currentC = c;

      let xhr = new XMLHttpRequest();
      xhr.open("get", "js/location.json");
      xhr.responseType = "json";
      xhr.send();
      xhr.onload = () => {
        let response = xhr.response;

        $.each(response.location, (key, obj) => {
          if (obj.name == c) {
            let dataId = response.location[key].dataId;
            let newURL = url + dataId + "?Authorization=" + authorization + "&format=JSON";

            new GetWeather(newURL, this.init);
          }
        });
      }
    },
    //初始化
    init: function (data) {
      this.now.regionsList = [];
      this.currentLNum = 0;
      this.weatherData = data;

      this.writeMsg();

      $.each(data, (index, obj) => {
        this.now.regionsList.push(obj.location);
      });
      //console.log(data);
    },
    //設置天氣資訊
    writeMsg(now = this.now.whichDay) {
      this.now.currentL = this.weatherData[this.currentLNum].location;

      this.wxLite(this.weatherData[this.currentLNum].wxV[now]);

      this.now.info.t = this.weatherData[this.currentLNum].t[now];
      this.now.info.wx = this.weatherData[this.currentLNum].wx[now];
      this.now.info.at = this.weatherData[this.currentLNum].at[now];
      this.now.info.uvi = this.weatherData[this.currentLNum].uvi[now];
      this.now.info.rh = this.weatherData[this.currentLNum].rh[now];
      this.now.info.pop12h = this.weatherData[this.currentLNum].pop12h[now];
      this.now.info.wd = this.weatherData[this.currentLNum].wd[now];

      this.getFuture();
    },
    //判斷晴、陰、雨、雪天
    wxLite(whichData) {
      switch (parseInt(whichData)) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:
          this.now.info.weatherP = "晴";
          this.now.info.weatherIMG = "images/sunIMG.svg";
          break;

        case 7:
        case 8:
        case 9:
        case 10:
          this.now.info.weatherP = "陰";
          this.now.info.weatherIMG = "images/cloudIMG.svg";
          break;

        case 42:
          this.now.info.weatherP = "雪";
          this.now.info.weatherIMG = "images/snowIMG.svg";
          break;

        default:
          this.now.info.weatherP = "雨";
          this.now.info.weatherIMG = "images/rainIMG.svg";
          break;
      }
    },
    //取得未來天氣狀況
    getFuture() {
      let wxV = this.weatherData[this.currentLNum].wxV;
      for (let i = 0; i < wxV.length; i++) {
        let d = {
          wxV: this.wxLite(wxV[i]),
          day: 0
        }

        //this.futureData.push(d);
      }
      console.log(wxV)
    },
    //溫度換算
    convertT(index) {
      let newValue;

      if (this.CorF && index == 1) {
        newValue = Math.round((this.now.info.t * 9) / 5 + 32);
        this.CorF = false;
      } else if (!this.CorF && index == 0) {
        newValue = Math.round(((this.now.info.t * 1 - 32) * 5) / 9);
        this.CorF = true;
      } else {
        return;
      }

      this.now.info.t = newValue;
    },
    //搜尋地區天氣
    searchL() {
      if (this.searchBox == "") {
        return;
      }

      let k;

      $.each(this.weatherData, (key, obj) => {
        if (obj.location == this.searchBox) {
          k = key;
        }
      });

      if (k != undefined) {
        this.currentLNum = k;
        this.writeMsg();
      } else {
        alert("請輸入此縣市有的地區");
      }

      this.searchBox = "";
    },
    //直接點選地區
    clickLocal(e, local) {
      e.stopPropagation();
      this.searchBox = local;
      this.isFocus = false;
    },
    //眼睛跟隨
    eyeMove(e) {
      const eyes = $(".eyes")[0];
      let eyeLX, eyeRX, eyeLRY;//左眼x、右眼x、左右眼y
      let x = e.clientX;//鼠標位置x
      let y = e.clientY;//鼠標位置y

      //算鼠標到天氣圖的距離
      let directionLX = (x - (eyes.offsetLeft + eyes.offsetWidth / 2)) * 5;
      let directionLY = (y - (eyes.offsetTop + eyes.offsetHeight / 2)) * 5;

      //算從天氣中心到螢幕右邊的距離
      let rightWidth = (window.innerWidth - (eyes.offsetLeft + eyes.offsetWidth / 2));

      if (directionLX < 0) {
        eyeLX = directionLX / (eyes.offsetLeft + eyes.offsetWidth / 2);
        eyeRX = (directionLX * 2) / (eyes.offsetLeft + eyes.offsetWidth / 2);
      } else {
        eyeLX =
          (directionLX * 2) / rightWidth;
        eyeRX =
          directionLX / rightWidth;
      }
      if (directionLY < 0) {
        eyeLRY = directionLY / (eyes.offsetTop + eyes.offsetHeight / 2);
      } else {
        eyeLRY =
          directionLY /
          (window.innerHeight - (eyes.offsetTop + eyes.offsetHeight / 2));
      }

      eyes.children[0].style.left = 40 + eyeLX + "%";
      eyes.children[0].style.top = 45 + eyeLRY + "%";

      eyes.children[1].style.left = 55 + eyeRX + "%";
      eyes.children[1].style.top = 45 + eyeLRY + "%";
    }
  }
});