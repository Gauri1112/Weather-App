const API_key = '73f36c78fe6a4f5b9f6391b28871ee4f';

const userTab = document.querySelector('[user-tab]');
const searchTab = document.querySelector('[search-tab]');
const accesmsg = document.querySelector('.access-msg');
const grantAccessLocation = document.querySelector('.grant-access-location');
const searchContainer = document.querySelector('.search-container');
const loadingcontainer = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const notFound=document.querySelector('.error');

let currentTab = userTab;
currentTab.classList.add('current-tab');
getfromSessionStorage();

function switchtab(clickedTab) {
    if (currentTab != clickedTab) {
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        if (!searchContainer.classList.contains('active')) {
            notFound.classList.remove('active');
            grantAccessLocation.classList.remove('active');
            userInfoContainer.classList.remove('active');
            searchContainer.classList.add('active');

        }
        else {
            notFound.classList.remove('active');
            searchContainer.classList.remove('active');
            userInfoContainer.classList.remove('active');
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    switchtab(userTab);
});

searchTab.addEventListener('click', () => {
    switchtab(searchTab);
});


function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem('user-coordinates');

    if (!localCoordinates) {
        grantAccessLocation.classList.add('active');
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    let { lat, lon } = coordinates;
    
    loadingcontainer.classList.add('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);
        const data = await response.json();

        grantAccessLocation.classList.remove('active');
        loadingcontainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingcontainer.classList.add('active');
    }

}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector('[city-name]');
    const countryIcon = document.querySelector('[flag]');
    const desc = document.querySelector('[weather-desc]');
    const weatherIcon = document.querySelector('[weather-img]');
    const temp = document.querySelector('[temperature]');
    const windspeed = document.querySelector('[wind-speed]');
    const humidity = document.querySelector('[humidity]');
    const cloudiness = document.querySelector('[cloudiness]');

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${Math.ceil(weatherInfo?.main?.temp - 273.15)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}




function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
    else {
        grantAccessLocation.classList.add('active');
        accesmsg.innerText = "You denied the request for Geolocation.";
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates))

    fetchUserWeatherInfo(userCoordinates);
}

function showError(error){
    switch (error.code) {
        case error.PERMISSION_DENIED:
          accesmsg.innerText = "You denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          accesmsg.innerText = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          accesmsg.innerText = "The request to get user location timed out.";
          break;
        case error.UNKNOWN_ERROR:
          accesmsg.innerText = "An unknown error occurred.";
          break;
      }
}

const accessBtn = document.querySelector('.access-btn');
accessBtn.addEventListener('click', getLocation);

const searchInput = document.querySelector('[search-input]');
searchContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    let city = searchInput.value;

    if (city === '')
        return;
    else
        fetchSearchWeatherInfo(city);
})

async function fetchSearchWeatherInfo(city) {
    loadingcontainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessLocation.classList.remove("active");
    notFound.classList.remove('active');
    try {

        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
            if(response.ok){
                let data = await response.json();
            searchInput.value = '';
            loadingcontainer.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
            }
            else{
                searchInput.value='';
                loadingcontainer.classList.remove("active");
                notFound.classList.add('active');
            }

    }
    catch (err) {
        loadingcontainer.classList.remove("active");
    }

}





