const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const session = require('express-session');

app.use(session({
  secret: 'keyboard cat', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

//session and cart
app.use((req, res, next) => {
  //store items in cart
  if(!req.session.cart){
    req.session.cart = [];
  }
  res.locals.cartCount = req.session.cart.length
  res.locals.user = req.session.user;
  next();
})

// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));


// view
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// session
// app.use((req,res, next) => {
//   res.locals.user = req.session.user;
//   next();
// })


// routes
//login
const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);


app.get('/login', (req, res) => {
  res.render('login')
})
// register
app.get('/register', (req, res) => {
  res.render('register');
})
// profiles
const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);
app.get('/profile', (req, res) => {
  if(req.session.user) {
    res.render('profile')
  } else {
    res.redirect('/login')
  }
})
// products
const productRoutes = require('./routes/products');
app.use('/', productRoutes);

//cart
app.get('/cart', (req, res) => {
  res.render('cart', { cart: req.session.cart });
});



app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})
