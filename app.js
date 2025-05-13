const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const session = require('express-session');

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'keyboard cat', // Change in production!
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true only with HTTPS
}));

// view
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// session
app.use((req,res, next) => {
  res.locals.user = req.session.user;
  next();
})

// routes
const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('register');
})

const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);
app.get('/profile', (req, res) => {
  if(res.session.user) {
    res.render('profile')
  } else {
    res.render('/login')
  }
})

// const productRoutes = require('./routes/products');
// app.use('/', productRoutes);

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})
