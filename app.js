const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const bodyParser = require('body-parser');
const axios = require('axios');

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
    console.log('Сервер працює!');
})

app.post('/weather', async (req, res) => {
    const cityName = req.body.city;
    const apiKey = process.env.API_KEY;

    try{
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data || geoRes.data.length === 0) {
            return res.send('Місто не знайдено. Спробуйте ще раз.');
        }

        const lat = geoRes.data[0].lat;
        const lon = geoRes.data[0].lon;

        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const weatherRes = await axios.get(weatherUrl);
        const forecast = weatherRes.data.list;

        const dailyForecast = groupForecastByDay(forecast);
        res.render('index', { forecast: dailyForecast, city: cityName });

    }catch(err){
        console.log(err);
        res.send('Помилка отримання даних. Спробуйте інше місто.');
    }
})

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
})

const groupForecastByDay = (forecastList) => {
    const grouped = {};

    forecastList.forEach(item => {
        const localDate = new Date(item.dt * 1000);
        const date = localDate.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kyiv' }).split('.').reverse().join('-');

        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });

    const dailySummaries = [];

    for (const date in grouped) {
        const dayItems = grouped[date];
        const temps = dayItems.map(item => item.main.temp);
        const minTemps = dayItems.map(item => item.main.temp_min);
        const maxTemps = dayItems.map(item => item.main.temp_max);
        const humidity = dayItems.map(item => item.main.humidity);
        const pop = dayItems.map(item => item.pop);

        const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

        dailySummaries.push({
            dt: dayItems[Math.floor(dayItems.length / 2)].dt,
            temp_avg: avg(temps),
            temp_min: Math.min(...minTemps),
            temp_max: Math.max(...maxTemps),
            humidity_avg: avg(humidity),
            pop_avg: avg(pop),
            morning: dayItems[0],
            evening: dayItems[dayItems.length - 1],
            weather: dayItems[Math.floor(dayItems.length / 2)].weather
        });
    }

    return dailySummaries;
};
