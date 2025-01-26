import { getWeatherDetails, updateWeatherDetails } from './script.js';

export function currentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
        
                updateWeatherDetailsByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Error fetching location:', error);
                alert('Unable to fetch your location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}
  
async function updateWeatherDetailsByCoords(lat, lon) {
    const weatherData = await getWeatherDetails('weather', `lat=${lat}&lon=${lon}`);
    const city = weatherData.name;
    updateWeatherDetails(city);
}