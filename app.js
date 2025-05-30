const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
    console.log('Сервер працює!');
})

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
})
