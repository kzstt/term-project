const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');

// middleware
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '/public')));

// view
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// routes
const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/login', (req, res) => {
  res.render('login')
})


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})