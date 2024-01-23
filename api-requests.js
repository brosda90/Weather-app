const TEMPERATURE_UNIT_CELSIUS = "°C";
const TEMPERATURE_UNIT_FAHRENHEIT = "°F";
let data = {};

/**
 * Fetches all cities in Germany from the CountriesNow API.
 * @returns {Promise<string[]>} A promise that resolves to an array of city names.
 */
async function getAllCitiesInGermany() {
  try {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/cities",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country: "Germany" }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP Fehler: ${response.status}`);
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      cities = data.data;
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Städte:", error);
  }
}

/**
 * Retrieves weather data for a specific city using the VisualCrossing Weather API.
 * @param {string} city - The name of the city for which weather data is to be fetched.
 * @param {string} unit - The unit of temperature (°C or °F).
 * @param {string} hourlyorWeek - Determines whether to fetch hourly or weekly data.
 * @returns {Promise<void>} A promise representing the asynchronous operation.
 */
async function getWeatherData(city, unit, hourlyorWeek) {
  const apiKey = "489JKN7YNSQFJEYFLFY8DWDQK";
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`
    );
    const data = await response.json();
    const today = data.currentConditions;
    const alerts = data.alerts;

    if (alerts) {
    }

    temp.innerText =
      unit === "°C" ? today.temp : celsiusToFahrenheit(today.temp);

    updateWeatherDisplay(data, today, hourlyorWeek, unit, alerts);
  } catch (error) {
    console.error("Fehler beim Abrufen der Wetterdaten:", error);
  }
}

/**
 * Updates the weather display with the fetched data.
 * This function processes weather data and updates the UI elements accordingly.
 * @param {Object} weatherData - The complete weather data object.
 * @param {Object} currentConditions - The current weather conditions.
 * @param {string} forecastType - The type of forecast data ('hourly' or 'weekly').
 * @param {string} temperatureUnit - The unit of temperature (°C or °F).
 */
function updateWeatherDisplay(
  weatherData,
  currentConditions,
  forecastType,
  temperatureUnit
) {
  const displayData = prepareWeatherDisplayData(
    weatherData,
    currentConditions,
    temperatureUnit
  );

  temp.innerText = displayData.temperatureText;
  currentLocation.innerText = displayData.cityOnly;
  rain.innerText = displayData.precipitationText;
  feelslike.innerText = displayData.feelsLikeText;
  windSpeed.innerText = displayData.windSpeedText;
  cloudcover.innerText = displayData.cloudCoverText;
  sunRise.innerText = displayData.sunriseText;
  sunSet.innerText = displayData.sunsetText;
  mainIcon.src = displayData.iconSrc;

  measureFeelsLike(currentConditions.feelslike);
  updatecloudcoverStatus(currentConditions.cloudcover);

  if (forecastType === "hourly") {
    updateForecast(weatherData.days[0].hours, temperatureUnit, "day");
  } else {
    updateForecast(weatherData.days, temperatureUnit, "week");
  }
  data.alerts = weatherData.alerts;
}

/**
 * Prepares the weather display data.
 * This function processes weather data and returns an object with the updated values.
 * @param {Object} weatherData - The complete weather data object.
 * @param {Object} currentConditions - The current weather conditions.
 * @param {string} temperatureUnit - The unit of temperature (°C or °F).
 * @returns {Object} An object containing the updated weather display data.
 */
function prepareWeatherDisplayData(
  weatherData,
  currentConditions,
  temperatureUnit
) {
  let roundedTemp = customRound(currentConditions.temp);
  let temperatureText =
    temperatureUnit === "°C" ? roundedTemp : celsiusToFahrenheit(roundedTemp);
  let cityOnly = weatherData.resolvedAddress.split(",")[0];
  let precipitationText =
    "Perc : " + Math.round(currentConditions.precip * 100) + "%";
  let feelsLikeText =
    customRound(currentConditions.feelslike) + temperatureUnit;
  let windSpeedText = Math.round(currentConditions.windspeed) + " km/h";
  let cloudCoverText = Math.round(currentConditions.cloudcover) + "%";
  let sunriseText =
    convertTimeTo24HoursFormat(currentConditions.sunrise) + " Uhr";
  let sunsetText =
    convertTimeTo24HoursFormat(currentConditions.sunset) + " Uhr";
  let iconSrc = getIcon(currentConditions.icon);

  return {
    temperatureText,
    cityOnly,
    precipitationText,
    feelsLikeText,
    windSpeedText,
    cloudCoverText,
    sunriseText,
    sunsetText,
    iconSrc,
  };
}

/**
 * Ruft den Standort des Benutzers über die IP-Adresse ab.
 * @returns {Promise<string|null>} Ein Promise, das den Stadtnamen oder null im Fehlerfall auflöst.
 */
async function getLocationOverIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(`HTTP Fehler: ${response.status}`);
    }
    const data = await response.json();
    return data.city;
  } catch (error) {
    console.error("Fehler beim Abrufen des Standorts über IP:", error);
    return null;
  }
}

// Additional Note:
// Different APIs are used in these functions to avoid the costs associated with a single comprehensive API.
// The first API provides a list of cities for the search function.
// The second API fetches weather data based on the city.
// The third API locates the user's position and sets the default location.
