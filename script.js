const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const statusMessage = document.getElementById('statusMessage');
const locationName = document.getElementById('locationName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const updatedTime = document.getElementById('updatedTime');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const feelsLike = document.getElementById('feelsLike');
const forecastGrid = document.getElementById('forecastGrid');

const weatherCodes = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Depositing rime fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Moderate drizzle', '🌦️'],
  55: ['Dense drizzle', '🌧️'], 61: ['Slight rain', '🌧️'], 63: ['Moderate rain', '🌧️'], 65: ['Heavy rain', '⛈️'],
  80: ['Rain showers', '🌦️'], 81: ['Moderate showers', '🌧️'], 82: ['Violent showers', '⛈️'], 95: ['Thunderstorm', '⛈️']
};

function setStatus(message, type = 'normal') {
  statusMessage.textContent = message;
  statusMessage.style.color = type === 'error' ? '#ffb4b4' : 'var(--muted)';
}

function getWeatherInfo(code) {
  return weatherCodes[code] || ['Weather data available', '🌍'];
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

async function getCoordinates(city) {
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(geoURL);
  if (!response.ok) throw new Error('Unable to connect to geocoding API.');
  const data = await response.json();
  if (!data.results || data.results.length === 0) throw new Error('City not found. Try another city name.');
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await fetch(weatherURL);
  if (!response.ok) throw new Error('Unable to fetch weather data.');
  return response.json();
}

function renderCurrentWeather(place, weatherData) {
  const current = weatherData.current;
  const [description, emoji] = getWeatherInfo(current.weather_code);

  locationName.textContent = `${place.name}, ${place.country}`;
  weatherIcon.textContent = emoji;
  temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
  condition.textContent = description;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
  updatedTime.textContent = `Updated: ${new Date(current.time).toLocaleString()}`;
}

function renderForecast(daily) {
  forecastGrid.innerHTML = '';
  daily.time.slice(0, 5).forEach((day, index) => {
    const [description, emoji] = getWeatherInfo(daily.weather_code[index]);
    const card = document.createElement('article');
    card.className = 'forecast-card';
    card.innerHTML = `
      <p class="day">${formatDate(day)}</p>
      <div class="emoji" aria-hidden="true">${emoji}</div>
      <p>${description}</p>
      <p class="range">${Math.round(daily.temperature_2m_min[index])}° / ${Math.round(daily.temperature_2m_max[index])}°C</p>
    `;
    forecastGrid.appendChild(card);
  });
}

async function searchWeather(city) {
  try {
    setStatus('Fetching live weather data...');
    const place = await getCoordinates(city);
    const weatherData = await getWeather(place.latitude, place.longitude);
    renderCurrentWeather(place, weatherData);
    renderForecast(weatherData.daily);
    setStatus(`Weather loaded successfully for ${place.name}.`);
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

weatherForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return setStatus('Please enter a valid city name.', 'error');
  searchWeather(city);
});

searchWeather('Chennai');
