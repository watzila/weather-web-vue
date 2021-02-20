let weatherData = [];//獲得的所有資料
let currentC, currentL = 0;//當前城市、地區的陣列索引
let CorF = true;//度C或是度F(度C為true)

let localInfos = $(".weatherInfo span");//天氣資訊元素
let searchBox = $("#search");//搜索框

//和中央氣象局連接資料
function getURL(c = "台中市") {
  const authorization = "CWB-422B0FA3-E374-492D-B54A-4D8942BE2B7E";
  const url = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/";

  c = (c[0] == "台") ? "臺" + c.slice(1) : c;
  currentC = c;

  let xhr = new XMLHttpRequest();
  xhr.open("get", "js/location.json");
  xhr.responseType = "json";
  xhr.send();
  xhr.onload = function () {
    let response = xhr.response;

    $.each(response.location, function (key, obj) {
      if (obj.name == c) {
        let dataId = response.location[key].dataId;
        let newURL = url + dataId + "?Authorization=" + authorization + "&format=JSON";

        new GetWeather(newURL, init);
        //console.log(key, obj, newURL);
      }
    });
  }
}
getURL();

//初始化
function init(data) {
  weatherData = data;

  writeMsg();

  $("#currentT button").each(function (index) {
    $(this).click(function () {
      convertT(index);
    });
  });

  searchBox.on("keypress", function (event) {
    if ((event.keyCode == 13) && this.value != "") {
      let newL = searchL(this.value);

      if (newL != undefined) {
        currentL = newL;
        writeMsg();
      } else {
        alert("請輸入此縣市有的地區");
      }

      searchBox.val("");
    }
  });

  $(".searchWrap button").click(function () {
    if (searchBox.value != "") {
      let newL = searchL(this.value);

      if (newL != undefined) {
        currentL = newL;
        writeMsg();
      } else {
        alert("請輸入此縣市有的地區");
      }

      searchBox.val("");
    }
  });
  //console.log(data);
}

//設置天氣資訊
function writeMsg(now = 0) {
  $(".currentCity h5").text(weatherData[currentL].location);
  $(".currentCity h3").text(currentC);

  wxLite(weatherData[currentL].wxV[now]);
  $("#currentT>span").text(weatherData[currentL].t[now]);

  localInfos[0].innerText = weatherData[currentL].wx[now];
  localInfos[1].innerText = weatherData[currentL].at[now];
  localInfos[2].innerText = weatherData[currentL].uvi[now];
  localInfos[3].innerText = weatherData[currentL].rh[now];
  localInfos[4].innerText = weatherData[currentL].pop12h[now];
  localInfos[5].innerText = weatherData[currentL].wd[now];
}

//判斷晴、陰、雨、雪天
function wxLite(whichData) {
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
      $("#weatherP").text("晴");
      $(".weatherWrap>img").prop("src", "images/sunIMG.svg");
      break;

    case 7:
    case 8:
    case 9:
    case 10:
      $("#weatherP").text("陰");
      $(".weatherWrap>img").prop("src", "images/cloudIMG.svg");
      break;

    case 42:
      $("#weatherP").text("雪");
      $(".weatherWrap>img").prop("src", "images/snowIMG.svg");
      break;

    default:
      $("#weatherP").text("雨");
      $(".weatherWrap>img").prop("src", "images/rainIMG.svg");
      break;
  }
}

//溫度換算
function convertT(index) {
  let newValue;
  let currentT = $("#currentT>span");

  if (CorF && index == 1) {
    newValue = Math.round((currentT[0].innerText * 9) / 5 + 32);
    CorF = false;
  } else if (!CorF && index == 0) {
    newValue = Math.round(((currentT[0].innerText * 1 - 32) * 5) / 9);
    CorF = true;
  } else {
    return;
  }

  currentT[0].innerText = newValue;
}

//搜尋地區天氣
function searchL(l) {
  let k;

  $.each(weatherData, function (key, obj) {
    if (obj.location == l) {
      k = key;
    }
  });
  return k;
}

function changeCity() {

}

function createLocal(locals) {

}