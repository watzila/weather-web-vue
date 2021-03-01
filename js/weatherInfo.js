class GetWeather {
  constructor(requestURL, getData) {
    this.getData = getData;
    this.dataOK = []; //全部縣市個別天氣資訊
    this.request = new XMLHttpRequest(); //創建新的伺服器連結

    this.conn(requestURL);
  }

  conn(requestURL) {
    this.request.open("get", requestURL); //請求伺服器連結，requestURL是上面宣告的網址
    this.request.responseType = "json"; //得到的資料已JSON格式解讀
    this.request.send(); //傳送資料
    //載入資料到自己設定的地方，onload會等所有資料載入完自動執行
    this.request.onload = () => {
      this.locationInfos(this.request.response);
    }
  }

  //整理各縣市的個別資料
  locationInfos(localWeathers) {
    let infoLs = localWeathers["records"].locations[0].location;
    console.log(infoLs);

    for (let i = 0; i < infoLs.length; i++) {
      let localW = infoLs[i].weatherElement;

      let data2 = {
        location: infoLs[i].locationName,
        wx: this.getWeekWeather(localW[6]),
        wxV: this.getWeekWeather(localW[6], 3),
        t: this.getWeekWeather(localW[1]),
        at: this.getWeekBodyT(localW[11], localW[5]),
        uvi: this.getWeekWeather(localW[9], 2),
        rh: this.getWeekWeather(localW[2]),
        pop12h: this.getWeekWeather(localW[0]),
        wd: this.getWeekWeather(localW[13]),
      };

      this.dataOK.push(data2);
    }

    this.getData(this.dataOK);
  }

  //計算一個禮拜的當前平均體感溫度
  getWeekBodyT(minT, maxT) {
    let infosOK = [];

    for (let j = 0; j < minT.time.length; j++) {
      if (j % 2 == 0) {
        let min = parseInt(minT.time[j].elementValue[0].value);
        let max = parseInt(maxT.time[j].elementValue[0].value);
        infosOK.push(Math.round((min + max) / 2));
      } else {
        continue;
      }
    }
    return infosOK;
  }

  //取出一個禮拜的當前資料
  getWeekWeather(whatInfo, type = 1) {
    let infosOK = [];

    switch (type) {
      case 1:
        for (let j = 0; j < whatInfo.time.length; j++) {
          let thisInfo = whatInfo.time[j].elementValue[0].value;

          if (j == 0) {
            infosOK.push(thisInfo);
          } else if (j % 2 != 0) {
            infosOK.push(thisInfo);
          } else {
            continue;
          }
        }
        break;

      case 2:
        let nowInfo = whatInfo.time[0].elementValue[1].value;
        infosOK.push(nowInfo);

        for (let j = 0; j < whatInfo.time.length; j++) {
          let thisInfo = whatInfo.time[j].elementValue[1].value;
          infosOK.push(thisInfo);
        }
        break;

      case 3:
        for (let j = 0; j < whatInfo.time.length; j++) {
          let thisInfo = whatInfo.time[j].elementValue[1].value;

          if (j == 0) {
            infosOK.push(thisInfo);
          } else if (j % 2 != 0) {
            infosOK.push(thisInfo);
          } else {
            continue;
          }
        }
        break;
    }
    return infosOK;
  }
}

const monthEnglish = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOber",
  "NOVEMBER",
  "DECEMBER",
];

const dayEnglish = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const dayChinese = ["日", "一", "二", "三", "四", "五", "六"];
