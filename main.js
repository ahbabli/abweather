const apiKey = "ec9038bff3bd064bcda37e6dc35f368f";
const baseUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${apiKey}`;

const searchInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const locationBtn = document.querySelector("#locationBtn");
const loadingEl = document.querySelector(".loading");
const errorEl = document.querySelector(".error");
const weatherIcon = document.querySelector(".weather-icon");
const cityEl = document.querySelector(".city");
const countryEl = document.querySelector(".country");
const timeEl = document.querySelector(".time");
const tempEl = document.querySelector(".temp");
const weatherEl = document.querySelector(".weath");
const feelsEl = document.querySelector(".feels");
const humidityEl = document.querySelector(".humidi");
const windEl = document.querySelector(".windi");

function setLoading(active, message = "Searching…") {
  loadingEl.textContent = message;
  loadingEl.classList.toggle("show", active);
}

function setError(message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("show", Boolean(message));
}

function formatLocalTime(timestamp, offset) {
  const date = new Date((timestamp + offset) * 1000);
  return date.toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit" });
}

function getIconForWeather(code) {
  const main = code.toLowerCase();
  if (main.includes("cloud")) return "imgs/cloudy.png";
  if (main.includes("rain") || main.includes("drizzle")) return "imgs/rainy-day.png";
  if (main.includes("clear")) return "imgs/sun.png";
  if (main.includes("thunder")) return "imgs/storm.png";
  if (main.includes("mist") || main.includes("fog") || main.includes("haze") || main.includes("smoke")) return "imgs/fog.png";
  return "imgs/sun.png";
}

async function fetchWeather(url) {
  try {
    setError("");
    setLoading(true);
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        setError("City not found. Please try again.");
      } else {
        setError("Unable to load weather. Try again later.");
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    setError("Network error. Check your connection.");
    return null;
  } finally {
    setLoading(false);
  }
}

function updateWeather(data) {
  cityEl.textContent = data.name;
  countryEl.textContent = data.sys.country;
  timeEl.textContent = formatLocalTime(data.dt, data.timezone);
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  weatherEl.textContent = data.weather[0].description;
  feelsEl.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${Math.round(data.wind.speed)} km/h`;
  weatherIcon.src = getIconForWeather(data.weather[0].main);
  weatherIcon.alt = data.weather[0].description;
}

async function fetchWeatherByCity(city) {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    setError("Enter a city name.");
    return;
  }
  const url = `${baseUrl}&q=${encodeURIComponent(trimmedCity)}`;
  const data = await fetchWeather(url);
  if (data) {
    updateWeather(data);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${baseUrl}&lat=${lat}&lon=${lon}`;
  const data = await fetchWeather(url);
  if (data) {
    updateWeather(data);
  }
}

searchBtn.addEventListener("click", () => {
  fetchWeatherByCity(searchInput.value);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    fetchWeatherByCity(searchInput.value);
  }
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported.");
    return;
  }

  setError("");
  setLoading(true, "Fetching location…");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      setLoading(false);
      setError("Location denied. Use search instead.");
    },
    { maximumAge: 60000, timeout: 10000 }
  );
});


 
