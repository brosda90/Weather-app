const celciusBtn = document.querySelector(".celcius");
const hourlyBtn = document.querySelector(".hourly");
const weekBtn = document.querySelector(".week");
const searchForm = document.querySelector("#search");
const search = document.querySelector("#query");
const fahrenheitBtn = document.querySelector(".fahrenheit");

let currentFocus;

// Event Listener
fahrenheitBtn.addEventListener("click", () => changeUnit("°f"));
celciusBtn.addEventListener("click", () => changeUnit("°C"));
hourlyBtn.addEventListener("click", () => changeTimeSpan("hourly"));
weekBtn.addEventListener("click", () => changeTimeSpan("week"));
searchForm.addEventListener("submit", handleSearchFormSubmit);
search.addEventListener("input", handleSearchInput);
search.addEventListener("keydown", handleSearchKeyDown);
document
  .getElementById("searchButton")
  .addEventListener("click", performSearch);
document
  .getElementById("query")
  .addEventListener("keydown", handleQueryKeyDown);
document
  .getElementById("setUserLocation")
  .addEventListener("click", showLocationPermissionModal);

/**
 * Handles the submission of the search form.
 * Prevents the default form submission, retrieves the location from the search input,
 * and triggers the weather data fetch for the entered location.
 * @param {Event} e - The submit event object.
 */
function handleSearchFormSubmit(e) {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

/**
 * Handles the input event on the search field.
 * It creates a list of suggestions based on the input value and appends it to the DOM.
 * @param {Event} e - The input event object.
 */
function handleSearchInput(e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) return false;
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");
  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    if (cities[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
      b = createSuggestionElement(cities[i], val);
      a.appendChild(b);
    }
  }
}

/**
 * Creates a suggestion list item element for the autocomplete feature.
 * @param {string} city - The city name to be suggested.
 * @param {string} val - The current value of the search input.
 * @returns {HTMLElement} The suggestion list item element.
 */
function createSuggestionElement(city, val) {
  let b = document.createElement("li");
  b.innerHTML = "<strong>" + city.substr(0, val.length) + "</strong>";
  b.innerHTML += city.substr(val.length);
  b.innerHTML += "<input type='hidden' value='" + city + "'>";
  b.addEventListener("click", handleSuggestionClick);
  return b;
}

/**
 * Handles the click event on a suggestion list item.
 * Sets the search input value to the selected city, removes the suggestions list,
 * and fetches the weather data for the selected city.
 * @param {Event} e - The click event object.
 */
function handleSuggestionClick(e) {
  search.value = this.getElementsByTagName("input")[0].value;
  removeSuggestions();
  currentCity = search.value;
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
  search.value = "";

  // Warten Sie 2 Sekunden und setzen Sie dann die Opacity von #location zurück
  setTimeout(function () {
    document.getElementById("location").style.opacity = "1";
  }, 2000);
}

/**
 * Handles the keydown event on the search input field.
 * It allows navigation through the suggestions list using the keyboard.
 * @param {Event} e - The keydown event object.
 */
function handleSearchKeyDown(e) {
  var suggestions = document.getElementById("suggestions");
  if (!suggestions) return;

  var items = suggestions.getElementsByTagName("li");
  if (e.keyCode == 40) {
    currentFocus++;
    addActive(items);
  } else if (e.keyCode == 38) {
    currentFocus--;
    addActive(items);
  } else if (e.keyCode == 13) {
    e.preventDefault();
    if (currentFocus > -1) {
      if (items) items[currentFocus].click();
      setTimeout(function () {
        document.getElementById("location").style.opacity = "1";
      }, 2000);
    }
  }
}

/**
 * Handles the keydown event for the query input field.
 * Triggers the search when the Enter key is pressed.
 * @param {Event} e - The keydown event object.
 */
function handleQueryKeyDown(e) {
  if (e.key === "Enter") {
    performSearch();
  }
}

/**
 * Updates the weather forecast display with new data.
 * @param {Object[]} data - The weather data array.
 * @param {string} unit - The temperature unit ('°C' or '°F').
 * @param {string} type - The type of forecast ('day' or 'week').
 */
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";

  let currentDate = new Date();
  let currentHour = currentDate.getHours();
  let currentDay = currentDate.getDay();

  let numCards = type === "day" ? 24 : data.length;

  for (let i = 0; i < numCards; i++) {
    let card = createCard(data[i], unit, type, currentHour, currentDay);
    weatherCards.appendChild(card);
  }
}

/**
 * Creates a weather card element with weather data.
 * @param {Object} dayData - The weather data for a specific day.
 * @param {string} unit - The temperature unit ('°C' or '°F').
 * @param {string} type - The type of forecast ('day' or 'week').
 * @param {number} currentHour - The current hour.
 * @param {number} currentDay - The current day of the week.
 * @returns {HTMLElement} The weather card element.
 */
function createCard(dayData, unit, type, currentHour, currentDay) {
  let card = document.createElement("div");
  card.classList.add("card");

  let dayName =
    type === "week" ? getDayTime(dayData.datetime) : getHour(dayData.datetime);
  let dayTemp =
    unit === "°C"
      ? customRound(dayData.temp)
      : customRound(celsiusToFahrenheit(dayData.temp));
  let iconSrc = getIcon(dayData.icon);
  let tempUnit = unit;

  card.innerHTML = createCardTemplate(
    dayName,
    iconSrc,
    dayData.conditions,
    dayTemp,
    tempUnit
  );

  if (type === "week") {
    card.addEventListener("click", function () {
      showPopup(dayData);
    });
  }

  if (type === "day" && isNewDay(dayData, currentHour, currentDay)) {
    card.classList.add("highlighted");
  }

  return card;
}

function createCardTemplate(dayName, iconSrc, conditions, dayTemp, tempUnit) {
  return `
    <h2 class="day-name">${dayName}</h2>
    <div class="cards-icon">
      <img src="${iconSrc}" alt="${conditions}" />
    </div>
    <div class="day-temp">
      <h2 class="temp">${dayTemp}</h2>
      <span class="temp-unit">${tempUnit}</span>
    </div>`;
}

function getDayTime(date) {
  let day = new Date(date);
  let days = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ];
  return days[day.getDay()];
}

/**
 * Checks if the provided weather data corresponds to a new day.
 * @param {Object} dayData - The weather data for a specific day.
 * @param {number} currentHour - The current hour.
 * @param {number} currentDay - The current day of the week.
 * @returns {boolean} True if it's a new day, false otherwise.
 */
function isNewDay(dayData, currentHour, currentDay) {
  return (
    new Date(dayData.datetime).getHours() === currentHour &&
    new Date(dayData.datetime).getDay() === currentDay
  );
}

/**
 * Updates the cloud cover status display based on the cloud cover percentage.
 * @param {number} cloudcover - The cloud cover percentage.
 */
function updatecloudcoverStatus(cloudcover) {
  if (cloudcover < 25) {
    cloudcoverStatus.innerText = "klar";
  } else if (cloudcover < 50) {
    cloudcoverStatus.innerText = "leicht bewölkt";
  } else if (cloudcover < 75) {
    cloudcoverStatus.innerText = "bewölkt";
  } else {
    cloudcoverStatus.innerText = " bedeckt";
  }
}

/**
 * Retrieves the icon path based on the weather condition.
 * @param {string} condition - The weather condition.
 * @returns {string} Path to the weather icon.
 */
function getIcon(condition) {
  if (condition === "Partly-cloudy-day") {
    return "./assets/icon/icons/partly-cloudy-day-64.png";
  } else if (condition === "partly-cloudy-night") {
    return "./assets/icon/icons/cloudy-night-64.png";
  } else if (condition === "rain") {
    return "./assets/icon/icons/rain-64.png";
  } else if (condition === "clear-day") {
    return "./assets/icon/icons/sun-64.png";
  } else if (condition === "clear-night") {
    return "./assets/icon/icons/night-64.png";
  } else {
    return "./assets/icon/icons/clouds-64.png";
  }
}

/**
 * Retrieves the alert icons and descriptions based on the event type.
 * @param {string} event - The event type.
 * @returns {Object} An object containing the icon source, title, and description.
 */
function getAlertsIcons(event) {
  const eventType = event.toLowerCase();
  let iconSrc = "";
  let eventTitle = "";
  let eventDescription = "";

  if (eventType.includes("icy")) {
    iconSrc = "./assets/icon/icons/icy-street.png";
    eventTitle = "Glatteis";
    eventDescription = "Es besteht die Gefahr von Glatteis";
  } else if (eventType.includes("frost")) {
    iconSrc = "./assets/icon/icons/frost.png";
    eventTitle = "Frost";
    eventDescription = "Offizielle Warnung vor Frost";
  } else if (eventType.includes("snowfall")) {
    iconSrc = "./assets/icon/icons/snowfall.png";
    eventTitle = "Schneefall";
    eventDescription = "Es besteht die Gefahr von Schneefall";
  } else if (eventType.includes("wind", "gusts")) {
    iconSrc = "./assets/icon/icons/windy.png";
    eventTitle = "Windböen";
    eventDescription = "Es besteht die Gefahr von Windböen";
  } else {
    iconSrc = "./assets/icon/icons/no-warnings.png";
    eventTitle = "Derzeit keine Warnungen";
  }

  return { iconSrc, eventTitle, eventDescription };
}

/**
 * Changes the temperature unit and updates the weather data display.
 * @param {string} unit - The temperature unit to change to ('°C' or '°F').
 */
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;

    tempUnit.forEach((elem) => {
      elem.innerText = `${unit.toUpperCase()}`;
    });
    if (unit === "°C") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

/**
 * Rounds a temperature value to the nearest half or whole number.
 * @param {number} value - The temperature value to round.
 * @returns {number} The rounded temperature value.
 */
function customRound(value) {
  let decimal = value - Math.floor(value);
  if (decimal >= 0.3 && decimal < 0.5) {
    return Math.floor(value) + 0.5;
  } else if (decimal >= 0.8 && decimal < 1.0) {
    return Math.ceil(value);
  } else if (decimal >= 0.2 && decimal < 0.3) {
    return Math.floor(value) + 0.5;
  } else if (decimal >= 0.7 && decimal < 0.8) {
    return Math.floor(value) + 0.5;
  }
  return Math.round(value);
}

/**
 * Converts a temperature from Celsius to Fahrenheit.
 * @param {number} temp - The temperature in Celsius.
 * @returns {number} The temperature in Fahrenheit.
 */
function celsiusToFahrenheit(temp) {
  let fahrenheit = (temp * 9) / 5 + 32;
  return customRound(fahrenheit);
}

/**
 * Converts a temperature from Fahrenheit to Celsius.
 * @param {number} temp - The temperature in Fahrenheit.
 * @returns {number} The temperature in Celsius.
 */
function fahrenheitToCelsius(temp) {
  let celsius = ((temp - 32) * 5) / 9;
  return customRound(celsius);
}

/**
 * Updates the display to describe how the temperature feels like.
 * @param {number} feelslike - The 'feels like' temperature value.
 */
function measureFeelsLike(feelslike) {
  if (feelslike < 3) {
    feelsText.innerText = "sehr kalt";
  } else if (feelslike < 5) {
    feelsText.innerText = "kalt";
  } else if (feelslike < 10) {
    feelsText.innerText = "angenehm";
  } else if (feelslike < 20) {
    feelsText.innerText = "warm";
  } else {
    feelsText.innerText = "heiß";
  }
}

/**
 * Updates the display to describe how the Windspeed feels like.
 * @param {number} windSpeed - The 'feels like' wind value.
 */
function measureWindSpeed(windSpeed){
  var windText = document.querySelector(".wind-text");
  if (windSpeed < 20) {
    windText.innerText = "leicht";
  } else if (windSpeed < 50) {
    windText.innerText = "mäßig";
  } else if (windSpeed < 70) {
    windText.innerText = "stark";
  } else {
    windText.innerText = "sehr stark";
  }
}


/**
 * Changes the time span of the weather forecast and updates the display.
 * @param {string} timeSpan - The time span for the forecast ('hourly' or 'week').
 */
function changeTimeSpan(timeSpan) {
  if (hourlyorWeek !== timeSpan) {
    hourlyorWeek = timeSpan;
    if (timeSpan === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

/**
 * Adds the 'active' class to the currently focused suggestion item.
 * @param {HTMLCollection} items - The collection of suggestion items.
 */
function addActive(items) {
  if (!items) return false;
  removeActive(items);
  if (currentFocus >= items.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = items.length - 1;
  items[currentFocus].classList.add("active");
}

/**
 * Removes the 'active' class from all suggestion items.
 * @param {HTMLCollection} items - The collection of suggestion items.
 */
function removeActive(items) {
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
  }
}

/**
 * Removes the suggestions list from the DOM.
 */
function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

/**
 * Displays a popup with detailed weather information for a specific day.
 * @param {Object} dayData - The weather data for the selected day.
 */
function showPopup(dayData) {
  closePopup();

  const popup = document.createElement("div");
  popup.classList.add("popup");

  const precip = customRound(dayData.precip * 10);
  const windspeed = customRound(dayData.windspeed);
  const temp = customRound(dayData.temp);

  const content = `
    <h2>${getDayTime(dayData.datetime)}</h2>
    <p>Temperatur: ${temp}°C</p>
    <p>Windgeschwindigkeit: ${windspeed} km/h</p>
    <p>Niederschlag: ${precip}%</p>
    <p>Bedingungen: ${dayData.conditions}</p>
    <button onclick="closePopup()">Schließen</button>
  `;

  popup.innerHTML = content;
  document.body.appendChild(popup);
}

/**
 * Closes the currently displayed popup.
 */
function closePopup() {
  const existingPopup = document.querySelector(".popup");
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }
}

/**
 * Performs a search based on the input in the query field and updates the weather display.
 */
function performSearch() {
  let location = document.getElementById("query").value;
  if (location) {
    currentCity = location;
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
    document.getElementById("query").value = ""; // Optional: Suchfeld leeren

    removeSuggestions();
    setTimeout(function () {
      document.getElementById("location").style.opacity = "1";
    }, 2000);
  }
}

/**
 * Converts a time string to a 24-hour format.
 * @param {string} time - The time string to convert.
 * @returns {string} The time string in 24-hour format.
 */
function convertTimeTo24HoursFormat(time) {
  let [hour, minute] = time.split(":").map(Number);
  hour = hour < 10 ? "0" + hour : hour.toString();
  minute = minute < 10 ? "0" + minute : minute.toString();
  return hour + ":" + minute;
}

/**
 * Returns the hour from a time string.
 * @param {string} time - The time string.
 * @returns {string} The hour from the time string.
 */
function getHour(time) {
  let [hour, min] = time.split(":").map(Number);
  hour = hour < 10 ? "0" + hour : hour;
  min = min < 10 ? "0" + min : min;
  return `${hour}:${min}`;
}

document
  .getElementById("setUserLocation")
  .addEventListener("click", function () {
    showLocationPermissionModal();
  });

/**
 * Displays a modal asking for location permissions.
 */
function showLocationPermissionModal() {
  const locationModal = document.getElementById("locationPermissionModal");
  locationModal.style.display = "block";

  document.getElementById("agreeLocation").onclick = function () {
    locationModal.style.display = "none";
    showPosition();
  };

  document.getElementById("disagreeLocation").onclick = function () {
    locationModal.style.display = "none";
  };
}

/**
 * Displays a temporary alert message.
 * @param {string} message - The message to display.
 */
function showTemporaryAlert(message) {
  const tempAlert = document.createElement("div");
  tempAlert.classList.add("temporary-alert");
  tempAlert.innerText = message;

  document.body.appendChild(tempAlert);

  setTimeout(function () {
    document.body.removeChild(tempAlert);
  }, 2000);
}
