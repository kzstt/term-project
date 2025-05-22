const express = require('express');
const path = require('path');
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "../data/products.db"), (err) => {
    if (err) {
      return console.error("Error opening database", err.message);
    }
    console.log("Connected to product database");
    db.serialize(() =>{
    db.run("DROP TABLE IF EXISTS products")
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT
        )
        `, (err) => {
            if(err){
                return console.error("Error creating table", err.message);
            }

            // db.get("SELECT COUNT(*) AS count FROM products", (err,row) => {
                    const insertQuary = "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)";
                    const products = [
                        ["Product 1", "Description", 10.99, "product1.jpg"],
                        ["Product 2", "Description", 10.99, "product2.jpg"],
                        ["Product 3", "Description", 10.99, "product3.jpg"],
                        ["Product 4", "Description", 10.99, "product4.jpg"],
                        ["Product 5", "Description", 10.99, "product5.jpg"],
                        ["Product 6", "Description", 10.99, "product6.jpg"],
                        ["Product 7", "Description", 10.99, "product7.jpg"],
                        ["Product 8", "Description", 10.99, "product8.jpg"],
                        ["Product 9", "Description", 10.99, "product9.jpg"],
                        ["Product 10", "Description", 10.99, "product10.jpg"],
                        ["Product 11", "Description", 10.99, "product11.jpg"],
                        ["Product 12", "Description", 10.99, "product12.jpg"],
                    ];
                    // Insert products into products.db
                    (function insertProducts(index = 0) {
                        if (index >= products.length) {
                          return;
                        }
                      
                        db.run(insertQuary, products[index], (err) => {
                          if (err) {
                            console.error("Error inserting product:", err.message);
                          }
                          insertProducts(index + 1);
                        });
                      })();
                    })
            })
        })
   

router.get('/', (req, res) => {
    db.all("SELECT * FROM products ORDER BY id ASC", [], (err,rows) => {
        if(err){
            return res.status(500).send(err.message);
        }
        res.render('index', {
            products: rows,
            user: req.session.user
        });
    })
})

router.get('/product/:id', (req, res) => {
    const q = 'SELECT * FROM products WHERE id = ?';
    db.get(q, [req.params.id], (err, row) => {
        if(err){
            return res.status(404).send('Product not found');
        }
        res.render('products', {product: row});
    })
})

// check products
router.get("/products-list", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(rows);
  });
});

// Cart
router.post('/add-cart', (req, res) => {
    const productId = req.body.productId;
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
        if(err || !product){
            return res.status(404).send('Product not found');
        }
        // add to cart and send back to index.ejs
        req.session.cart.push(product);
        res.redirect('/');
    })
})

router.get('/cart', (req, res) => {
    res.render('cart', {cart: req.session.cart});
})

// remove from cart
router.post('/cart/remove', (req, res) => {
    const index = parseInt(req.body.index);
    if (!isNaN(index)) {
      req.session.cart.splice(index, 1);
    }
    res.redirect('/cart');
  });



module.exports = router;
