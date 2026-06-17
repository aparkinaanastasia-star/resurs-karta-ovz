// OpenWeatherMap API configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Get free key from openweathermap.org
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const detailsContainer = document.getElementById('detailsContainer');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
        searchInput.value = '';
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
            searchInput.value = '';
        }
    }
});

// Load weather for default city on page load
window.addEventListener('load', () => {
    fetchWeather('London');
});

// Fetch current weather data
async function fetchWeather(city) {
    try {
        weatherContainer.innerHTML = '<div class="loading"><p>Loading weather data...</p></div>';

        const response = await fetch(
            `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);

    } catch (error) {
        weatherContainer.innerHTML = `
            <div class="error">
                <p class="error-message">Error: ${error.message}</p>
                <p>Please check the city name and try again.</p>
            </div>
        `;
    }
}

// Fetch 5-day forecast
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch forecast');
        }

        const data = await response.json();
        displayForecast(data.list);

    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Display current weather
function displayWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility } = data;
    const temp = Math.round(main.temp);
    const feelsLike = Math.round(main.feels_like);
    const description = weather[0].main;
    const icon = getWeatherIcon(weather[0].main);

    const weatherHTML = `
        <div class="weather-main">
            <div class="weather-info">
                <h2 class="city-name">${name}, ${sys.country}</h2>
                <div class="weather-icon">${icon}</div>
                <div class="temperature">${temp}°C</div>
                <p class="weather-description">${description}</p>
                <p class="feels-like">Feels like ${feelsLike}°C</p>
            </div>
            <div class="weather-stats">
                <div class="stat-box">
                    <p class="stat-label">💧 Humidity</p>
                    <p class="stat-value">${main.humidity}%</p>
                </div>
                <div class="stat-box">
                    <p class="stat-label">💨 Wind Speed</p>
                    <p class="stat-value">${Math.round(wind.speed)} m/s</p>
                </div>
                <div class="stat-box">
                    <p class="stat-label">🔽 Pressure</p>
                    <p class="stat-value">${main.pressure} hPa</p>
                </div>
                <div class="stat-box">
                    <p class="stat-label">👁️ Visibility</p>
                    <p class="stat-value">${(visibility / 1000).toFixed(1)} km</p>
                </div>
            </div>
        </div>
    `;

    weatherContainer.innerHTML = weatherHTML;

    // Display additional details
    displayDetails(data);
}

// Display additional weather details
function displayDetails(data) {
    const { main, wind, clouds, sys } = data;
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();

    const detailsHTML = `
        <div class="detail-card">
            <p class="detail-label">🌡️ Max Temperature</p>
            <p class="detail-value">${Math.round(main.temp_max)}°C</p>
        </div>
        <div class="detail-card">
            <p class="detail-label">❄️ Min Temperature</p>
            <p class="detail-value">${Math.round(main.temp_min)}°C</p>
        </div>
        <div class="detail-card">
            <p class="detail-label">☁️ Cloud Coverage</p>
            <p class="detail-value">${clouds.all}%</p>
        </div>
        <div class="detail-card">
            <p class="detail-label">🌅 Sunrise</p>
            <p class="detail-value">${sunrise}</p>
        </div>
        <div class="detail-card">
            <p class="detail-label">🌇 Sunset</p>
            <p class="detail-value">${sunset}</p>
        </div>
        <div class="detail-card">
            <p class="detail-label">💨 Wind Direction</p>
            <p class="detail-value">${wind.deg || 'N/A'}°</p>
        </div>
    `;

    detailsContainer.innerHTML = detailsHTML;
}

// Display 5-day forecast
function displayForecast(forecastList) {
    // Get one forecast per day (every 8 items = 24 hours)
    const dailyForecasts = [];
    const seen = new Set();

    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString();

        if (!seen.has(day)) {
            seen.add(day);
            dailyForecasts.push(forecast);
        }
    });

    // Limit to 5 days
    const forecastHTML = dailyForecasts.slice(0, 5).map(forecast => {
        const date = new Date(forecast.dt * 1000);
        const temp = Math.round(forecast.main.temp);
        const icon = getWeatherIcon(forecast.weather[0].main);
        const description = forecast.weather[0].main;

        return `
            <div class="forecast-card">
                <p class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p class="forecast-icon">${icon}</p>
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

    forecastContainer.innerHTML = forecastHTML;
}

// Get emoji icon based on weather condition
function getWeatherIcon(condition) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🌪️',
        'Ash': '🌋',
        'Squall': '💨',
        'Tornado': '🌪️'
    };

    return icons[condition] || '🌤️';
}
