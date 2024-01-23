const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  currentLocation = document.getElementById("location"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  feelslike = document.querySelector(".feels-like"),
  feelsText = document.querySelector(".feels-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sunrise"),
  sunSet = document.querySelector(".sunset"),
  cloudcover = document.querySelector(".cloudcover"),
  cloudcoverStatus = document.querySelector(".cloudcover-status"),
  weatherCards = document.querySelector("#weather-cards"),
  tempUnit = document.querySelectorAll(".temp-unit");

let currentCity = "";
let currentUnit = "°C";
let hourlyorWeek = "Week";
let cities = [];

/**
 * Initializes the application on window load.
 * Checks for the last known city in local storage and displays the location modal if not found.
 */
window.onload = function () {
  const lastKnownCity = localStorage.getItem("lastKnownCity");
  const startOverlay = document.getElementById("startOverlay");

  if (lastKnownCity) {
    currentCity = lastKnownCity;
    startOverlay.style.display = "none";
  } else {
    currentCity = "Hamburg";
    setTimeout(function () {
      startOverlay.classList.add("hide");
      setTimeout(function () {
        startOverlay.remove();
      }, 500);
    }, 2000);
  }
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
};

/**
 * Adds an event listener to each day-card element that displays a popup with the day's data.
 */
document.querySelectorAll(".day-card").forEach((dayCard) => {
  dayCard.addEventListener("click", function () {
    // Hier können Sie den Tag aus dem Element extrahieren, z.B.: // Angenommen, Sie speichern die Daten des Tages im "data-day" Attribut des Elements
    showPopup(dayData);
  });
});

/**
 * Sets up event listeners once the DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("weatherModal");
  const closeButton = document.querySelector(".close-button");

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });
  var element = document.getElementById("someElementId");
  if (element) {
    element.addEventListener("click", function () {
      window.addEventListener("click", (event) => {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      });
    });
  } else {
    console.log("Element nicht gefunden");
  }
});

/**
 * Sets up event listeners once the DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", (event) => {
  const searchInput = document.getElementById("query");
  const searchButton = document.getElementById("searchButton");

  if (searchInput && searchButton) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
    searchButton.addEventListener("click", performSearch);
  } else {
    console.error("Search field or button not found");
  }
});

/**
 * Handles errors that can occur when using the Geolocation API.
 * @param {locationError} error - The error object from the Geolocation API.
 */
function handleError(error) {
  console.error("Fehler bei der Standortabfrage: ", error);
  currentCity = "Hamburg";
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
  alert(
    "Wir konnten Ihren Standort leider nicht abrufen. Bitte suchen Sie ihn manuell über unser Suchfeld."
  );
}

/**
 * Verwendet die IP-Geolocation-API, um den Standort des Benutzers zu bestimmen und Wetterdaten für diesen Standort abzurufen.
 */
async function showPosition() {
  try {
    const city = await getLocationOverIP();
    if (city) {
      currentCity = city;
      saveLocationInLocalStorage(currentCity);
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
  } catch (error) {
    handleError(error);
  }
}

/**
 * Saves the specified city to local storage.
 * @param {string} city - The city to be saved.
 */
function saveLocationInLocalStorage(city) {
  localStorage.setItem("lastKnownCity", city);
}

/**
 * Event listener for the search form submission.
 */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
});

/**
 * Displays weather alerts when the element with the ID "alerts" is clicked.
 */
document.getElementById("alerts").addEventListener("click", function () {
  document.getElementById("weatherModal").style.display = "flex";
  showWeatherAlerts();
});

/**
 * Displays weather alerts in a modal.
 */
function showWeatherAlerts() {
  const alertsContainer = document.getElementById("weatherModal");
  let innerHTML = "<h2>Wetterwarnungen</h2>";

  if (data.alerts && data.alerts.length > 0) {
    data.alerts.forEach((alert) => {
      const { iconSrc, eventTitle, eventDescription } = getAlertsIcons(
        alert.event
      );
      innerHTML += `<div class="alert-message"><img class="alerts-icon" src="${iconSrc}"><div><h3>${eventTitle}</h3>
      <p>${eventDescription}</p></div></div>`;
    });
  } else {
    innerHTML += "<p>Keine Warnungen für Ihren Standort.</p>";
  }

  innerHTML += '<button class="close-button">Schließen</button>';
  alertsContainer.innerHTML = innerHTML;

  document.querySelector(".close-button").onclick = function () {
    alertsContainer.style.display = "none";
  };
}

getAllCitiesInGermany();
