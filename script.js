import { currentLocation } from "./curr-location.js";

const locationInput = document.querySelector('.search-input');
const locationInputBtn = document.querySelector('.search-icon');
const locationInputDiv = document.querySelector('.location-input');
const currentLocationBtn = document.querySelector('.current-button');
const todayTemp = document.querySelector('.today-weather-txt');
const todayImg = document.querySelector('.today-img');
const todayCloudCondition = document.querySelector('.today-cloud-details');
const currentDate = document.querySelector('.today-date');
const todayLocation = document.querySelector('.today-location');
const AqiValue = document.querySelector('.index-num');
const AqiValuePm = document.querySelector('.pm-txt');
const AqiValueSo = document.querySelector('.so2-txt');
const sunriseTimeTxt = document.querySelector('.sunrise-time');
const sunsetTimeTxt = document.querySelector('.sunset-time');
const humidityNum = document.querySelector('.humidity-percent');
const humidityCondition = document.querySelector('.condition-txt');
const pressure = document.querySelector('.pressure-value');
const windSpeed = document.querySelector('.wind-value');
const visibility = document.querySelector('.visibility-value');
const feelsLike = document.querySelector('.feels-value');
const fiveDayReport = document.querySelector('.day-5-report');
const condition = document.querySelector('.condition');
const speedDirections = document.querySelector('.direction');

const weatherDetailsSec = document.querySelector('.main');
const notFoundSec = document.querySelector('.not-found-sec');
const searchCitySec = document.querySelector('.search-city-sec');
const footerSec = document.querySelector('.footer');

const API_KEY = 'efea7761c4f9762a68cf2dfa999bd4c7';

locationInputBtn.addEventListener('click', () => {
    if(locationInput.value.trim() != '') {
        updateWeatherDetails(locationInput.value);
        locationInput.value = '';
        locationInput.blur();
    }
    locationInputDiv.classList.toggle('active');
});

locationInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter' && locationInput.value.trim() != '') {
        updateWeatherDetails(locationInput.value);
        locationInput.value = '';
        locationInput.blur();
    }
});

currentLocationBtn.addEventListener('click', () => {
    currentLocation();
});

window.onload = () => {
    searchCitySec.classList.remove('hidden');
    notFoundSec.classList.add('hidden');
    weatherDetailsSec.classList.add('hidden');
    footerSec.classList.add('hidden');
};

function generateCurrDate() {
    let currDate = new Date();
    let format = {
        weekday: 'long',
        day: '2-digit',
        month: 'short'
    }

    return currDate.toLocaleDateString('en-US', format);
}

currentLocationBtn.addEventListener('click', () => {
    currentLocation();
});

export async function getWeatherDetails(endPoint, params) {
    const API_URL = `https://api.openweathermap.org/data/2.5/${endPoint}?${params}&appid=${API_KEY}&units=metric`

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        return result;
    } catch (error) {
        console.error('Error fetching details:', error);
        alert('Failed to fetch weather details. Please check the city name or try again later.');
    }
}

let reportId = 1;

async function updateForecastDetails(city) {
    const forecastData = await getWeatherDetails('forecast', `q=${city}`);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    fiveDayReport.innerHTML = '';
    reportId = 1;

    const filteredForecast = forecastData.list.filter(
        (forecastDetail) =>
            forecastDetail.dt_txt.includes(timeTaken) &&
            !forecastDetail.dt_txt.includes(todayDate)
    );

    filteredForecast.forEach(updateForecastItems);
}

function updateForecastItems(weatherData) {
    const reportDate = new Date(weatherData.dt_txt);

    const day = reportDate.getDate().toString().padStart(2, '0');
    const month = reportDate.toLocaleString('en-US', { month: 'short' });
    const week = reportDate.toLocaleDateString('en-US', { weekday: 'long' });

    const reportFormattedDate = `${day} ${month}`;
    const reportFormattedWeek = `${week}`;

    let reportItem = `
        <div class="day-${reportId}-info">
            <img src="./assets/weather_icons/${getWeatherIcons(weatherData.weather[0].id)}.png" class="day-${reportId}-img">

            <p class="day-${reportId}-value">${Math.round(weatherData.main.temp)}&deg;</p>

            <div class="day-date-${reportId}">
                <p class="day-${reportId}-date">${reportFormattedDate}</p>
                <p class="day-${reportId}-day">${reportFormattedWeek}</p>
            </div>

        </div>
    `
    fiveDayReport.insertAdjacentHTML('beforeend', reportItem);
    reportId ++;
}

function getWeatherIcons(id) {
    if (id <= 232) return 'thunderstorm';
    if (id <= 321) return 'drizzle';
    if (id <= 531) return 'rain';
    if (id <= 622) return 'snow';
    if (id <= 781) return 'atmosphere';
    if (id <= 800) return 'clear';
    else return 'clouds';
}

let directionID = 5;
let conditionID = 1;

async function updateHourlyDetails(city) {
    const hourlyData = await getWeatherDetails('forecast', `q=${city}`);
    let currDateHourly = new Date();
    let formattedDateHourly = currDateHourly.toISOString().split('T')[0];
    
    let filteredForecasts = hourlyData.list.filter(forecastDetail => 
        forecastDetail.dt_txt.includes(formattedDateHourly)
    );

    condition.innerHTML = '';
    speedDirections.innerHTML = '';

    filteredForecasts.forEach(forecast => {
        let time = new Date(forecast.dt_txt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        });

        let conditionDiv = `
        <div class="report-${conditionID}">

            <p class="report-${conditionID}-time">${time}</p>
            <img src="./assets/weather_icons/${getWeatherIcons(forecast.weather[0].id)}.png" class="report-${conditionID}-img">
            <p class="report-${conditionID}-value">${Math.round(forecast.main.temp)}&deg;</p>

        </div>
        `

        let angleDiv = `
        <div class="report-${directionID}">

            <p class="report-${directionID}-time" id="report-time">${time}</p>
            <img src="./assets/weather_icons/direction.png" class="report-${directionID}-img" style="transform: rotate(${forecast.wind.deg}deg);">
            <p class="report-${directionID}-value"  id="report-wind">${Math.round(forecast.wind.speed)} km/h</p>
        </div>
        `;

        condition.insertAdjacentHTML('beforeend', conditionDiv);
        speedDirections.insertAdjacentHTML('beforeend', angleDiv);
    })
    conditionID++;
    directionID++;
}

async function getAqiDetails(city) {
    const aqiData = await getWeatherDetails('weather', `q=${city}`);

    if (!aqiData || !aqiData.coord) {
        console.error('Unable to fetch weather details or coordinates are missing');
        return;
    }

    const { lat, lon } = aqiData.coord;

    const AQI_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
        const aqiResponse = await fetch(AQI_URL);
        const aqiResult = await aqiResponse.json();

        AqiValue.innerText = `${aqiResult.list[0].main.aqi}`;
        AqiValuePm.innerHTML = `PM2.5 : ${Math.round(aqiResult.list[0].components.pm2_5)}`
        AqiValueSo.innerHTML = `SO2 : ${Math.round(aqiResult.list[0].components.so2)}`
    } catch (error) {
        console.error('Error fetching AQI data:', error);
    }    
}

export async function updateWeatherDetails(city) {
    weatherDetailsSec.classList.remove('hidden');
    footerSec.classList.remove('hidden');
    searchCitySec.classList.add('hidden')
    notFoundSec.classList.add('hidden');
    
    const weatherData = await getWeatherDetails('weather', `q=${city}`);
    
    if (weatherData.cod != '200') {
        notFoundSec.classList.remove('hidden');
        weatherDetailsSec.classList.add('hidden');
        footerSec.classList.add('hidden');
        searchCitySec.classList.add('hidden')
    }

    todayTemp.innerHTML = `${Math.round(weatherData.main.temp)}&deg; c`;
    todayImg.src = `./assets/weather_icons/${getWeatherIcons(weatherData.weather[0].id)}.png`
    todayCloudCondition.innerHTML = `${(weatherData.weather[0].description).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    currentDate.innerHTML = generateCurrDate();
    todayLocation.innerHTML = `${weatherData.name}`
    
    const showHumidity = () => {
        const humidityValue = weatherData.main.humidity;
        humidityNum.innerHTML = `${humidityValue}&percnt;`;
        
        if (humidityValue <= 30) {
            humidityCondition.innerText = 'Low';
        } else if (humidityValue > 30 && humidityValue <= 50) {
            humidityCondition.innerText = 'Comfortable';
        } else if (humidityValue > 50 && humidityValue <= 60) {
            humidityCondition.innerText = 'Moderate';
        } else if (humidityValue > 60 && humidityValue <= 80) {
            humidityCondition.innerText = 'High';
        } else {
            humidityCondition.innerText = 'Very High';
        }
    };
    showHumidity();
    
    const sunriseTime = () => {
        let sunriseTimestamp = `${weatherData.sys.sunrise}`;
        let sunriseDate = new Date(sunriseTimestamp * 1000);
        let sunriseFormatted = sunriseDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, }).replace(':', ' : ').toUpperCase();
        
        sunriseTimeTxt.innerText = sunriseFormatted;
    };
    sunriseTime();
    
    const sunsetTime = () => {
        let sunsetTimestamp = `${weatherData.sys.sunset}`;
        let sunsetDate = new Date(sunsetTimestamp * 1000);
        let sunsetFormatted = sunsetDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, }).replace(':', ' : ').toUpperCase();
        
        sunsetTimeTxt.innerText = sunsetFormatted;
    };
    sunsetTime();
    
    pressure.innerHTML = `${weatherData.main.pressure}`;
    windSpeed.innerHTML = `<span>${Math.round(weatherData.wind.speed)}</span> km/h`;
    visibility.innerHTML = `<span>${(weatherData.visibility) / 1000}</span> km`;
    feelsLike.innerHTML = `${Math.round(weatherData.main.feels_like)}&deg; c`;
    
    await updateForecastDetails(city);
    
    await updateHourlyDetails(city);

    await getAqiDetails(city);
}