const cities = {
  mississauga: { name: "Mississauga, ON", lat: 43.589, lon: -79.6441 },
  toronto: { name: "Toronto, ON", lat: 43.6532, lon: -79.3832 },
  vancouver: { name: "Vancouver, BC", lat: 49.2827, lon: -123.1207 },
  tokyo: { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  london: { name: "London, UK", lat: 51.5072, lon: -0.1276 }
};

const citySelect = document.getElementById("city-select");
const unitBtn = document.getElementById("unit-btn");
const refreshBtn = document.getElementById("refresh-btn");

const cityNameEl = document.getElementById("city-name");
const statusMsgEl = document.getElementById("status-msg");
const tempValueEl = document.getElementById("temp-value");
const tempUnitEl = document.getElementById("temp-unit");
const conditionTextEl = document.getElementById("condition-text");
const windValueEl = document.getElementById("wind-value");
const dayStatusEl = document.getElementById("day-status");
const adviceBannerEl = document.getElementById("advice-banner");

let currentTempC = null;
let isCelsius = true;

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rain / Drizzle";
  if (code >= 71 && code <= 77) return "Snowfall";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Overcast";
}

function updateVisualTheme(code, isDay) {
  document.body.className = "";

  if (isDay === 0) {
    document.body.classList.add("night-mode");
  } else if (code === 0) {
    document.body.classList.add("clear-sky");
  } else if (code >= 71 && code <= 77) {
    document.body.classList.add("cold-snow");
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) {
    document.body.classList.add("rainy-sky");
  } else {
    document.body.classList.add("cloudy-sky");
  }
}

function renderTemperature() {
  if (currentTempC === null) return;

  if (isCelsius) {
    tempValueEl.textContent = currentTempC.toFixed(1);
    tempUnitEl.textContent = "°C";
    unitBtn.textContent = "Switch to °F";
  } else {
    const tempF = (currentTempC * 9) / 5 + 32;
    tempValueEl.textContent = tempF.toFixed(1);
    tempUnitEl.textContent = "°F";
    unitBtn.textContent = "Switch to °C";
  }
}

async function fetchWeather(cityKey) {
  const city = cities[cityKey];
  cityNameEl.textContent = city.name;
  statusMsgEl.textContent = "Fetching live data...";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const weather = data.current_weather;

    currentTempC = weather.temperature;
    const windSpeed = weather.windspeed;
    const weatherCode = weather.weathercode;
    const isDay = weather.is_day;

    // Update DOM content
    renderTemperature();
    conditionTextEl.textContent = getWeatherDescription(weatherCode);
    windValueEl.textContent = windSpeed;
    dayStatusEl.textContent = isDay === 1 ? "Daytime" : "Nighttime";

    // Update page visual background based on live weather
    updateVisualTheme(weatherCode, isDay);

    // Data-driven advice text
    if (currentTempC <= 0) {
      adviceBannerEl.textContent = "Freezing outside — wear a heavy winter coat.";
    } else if (weatherCode >= 51 && weatherCode <= 82) {
      adviceBannerEl.textContent = "Wet conditions right now — bring an umbrella.";
    } else if (windSpeed > 25) {
      adviceBannerEl.textContent = "Quite windy out — dress in layers.";
    } else {
      adviceBannerEl.textContent = "Mild conditions — good time to go outside.";
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    statusMsgEl.textContent = `Last updated at ${now}`;
  } catch (error) {
    statusMsgEl.textContent = "Could not load weather data. Try again.";
    console.error(error);
  }
}

citySelect.addEventListener("change", (e) => {
  fetchWeather(e.target.value);
});

unitBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  renderTemperature();
});

refreshBtn.addEventListener("click", () => {
  fetchWeather(citySelect.value);
});

// Load initial city on page open
fetchWeather(citySelect.value);