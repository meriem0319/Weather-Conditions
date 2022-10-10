//storing the searched city
var city = "";
//declaring variables
var citySrch = $("#city-srch");
var currentCity = $("#curr-city");
var currentTemp = $("#curr-temp");
var currentWind = $("#curr-wind");
var currentHum = $("#curr-hum");

//the city search field will see if the city name already exists in storage
var cityName = [];

//
function find(ct) {
  for (var i = 0; i < cityName.length; i++) {
    if (ct.toUpperCase() === cityName[i]) {
      return -1;
    }
  }
  return 1;
}

//OWM API key
let APIkey = "65b06c738b3bc79f1df78e5430d99b98";
//after input box searches for city, show forecast for city
function showWeather(event) {
  event.preventDefault();
  if (citySrch.val().trim() !== "") {
    city = citySrch.val().trim();
    currentWeather(city);
  }
}

function currentWeather(city) {
  const queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIkey;
  axios.get(queryURL).then(function (response) {
    console.log(response);

    // getting the weather icon
    const icon = response.data.weather[0].icon;
    const iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";

    const date = new Date(response.dt * 1000).toLocaleDateString();

    $(currentCity).html(
      response.name + "(" + date + ")" + "<img src=" + iconURL + ">"
    );

    // converting to F
    const FarTemp = (response.data.main.temp - 273.15) * 1.8 + 32;
    $(currentTemp).html(FarTemp.toFixed(2) + "&#8457");
    //humidity
    $(currentHum).html(response.data.main.humidity + "%");
    //wind - need to convert to mph
    const windSpeed = response.data.wind.speed;
    const windSpeedMPH = (windSpeed * 2.237).toFixed(1);
    $(currentWind).html(windSpeedMPH + "MPH");

    if (response.cod === 200) {
      cityName = JSON.parse(localStorage.getItem("cityName"));
      console.log(cityName);
      if (cityName == null) {
        cityName = [];
        cityName.push(city.toUpperCase());
        localStorage.setItem("cityName", JSON.stringify(cityName));
        addToHist(city);
      } else {
        if (find(city) > 0) {
          cityName.push(city.toUpperCase());
          localStorage.setItem("cityName", JSON.stringify(cityName));
          addToHist(city);
        }
      }
    }
  });
}

function UVindex(ln, lt) {
  const uvqueryURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIkey +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  axios.get(uvqueryURL).then(function (response) {
    $(currentUV).html(response.value);
  });
}

// 5 day forcast
function forcast(cityID) {
  const queryForecastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityID +
    "&appid=" +
    APIkey;
  axios.get(queryForecastURL).then(function (response) {
    for (i = 0; i < 5; i++) {
      const date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      const weathericon = response.data[(i + 1) * 8 - 1].weather[0].icon;
      const URLicon = "http://openweathermap.org/img/wn" + weathericon + ".png";
      const KelTemp = response.data[(i + 1) * 8 - 1].main.temp;
      const FarTemp = ((KelTemp - 273.5) * 1.8 + 32).toFixed(2);
      const humidity = response.data[(i + 1) * 8 - 1].main.humidity;
      //
      $("#dateDay" + i).html(date);
      $("#imgDay" + i).html("<img src=" + URLicon + ">");
      $("#temDay" + i).html(FarTemp + "&#8457");
      $("#humDay" + i).html(humidity + "%");
    }
  });
}

//adding the passed city into the search history
function addToHist(ct) {
  const listElement = $("<li>" + ct.toUpperCase() + "</li>");
  $(listElement).attr("class", "list-group-item");
  $(listElement).attr("data-value", ct.toUpperCase());
  $(".list-group").append(listElement);
}

//show the past city search if clicke in the past history list
function showPastSrch(event) {
  const pastSrch = event.target;
  if (event.target.matches("li")) {
    city = pastSrch.textContent.trim();
    currentWeather(city);
  }
}

//rendering the function
function showLastCity() {
  $("ul").empty();
  const cityName = JSON.parse(localStorage.getItem("cityName"));
  if (cityName !== null) {
    cityName = JSON.parse(localStorage.getItem("cityName"));
    for (i = 0; i < cityName.length; i++) {
      addToHist(cityName[i]);
    }
    city = cityName[i - 1];
    currentWeather(city);
  }
}

//clearing the history function
function clrHist(event) {
  event.preventDefault();
  cityName = [];
  localStorage.removeItem("cityName");
  document.location.reload();
}

//listing the click handlers
$("#search-btn").on("click", showWeather);
$(document).on("click", showPastSrch);
$(window).on("click", showLastCity);
$("#clr-hist").on("click", clrHist);
