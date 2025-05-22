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
              const insertQuery = "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)";
              const products = [
                  ["Custom Gaming PC", "High-performance PC built for gaming with modern components and RGB lighting.", 1599.99, "custom-gaming-pc.jpg"],
                  ["Home & Office PC", "Reliable desktop ideal for everyday home and office tasks.", 749.99, "home-office-pc.jpg"],
                  ["Workstation & Server", "Powerful workstation optimized for rendering, computation, and server use.", 2299.99, "workstation-server.jpg"],
                  ["CPU (Processor)", "A fast and efficient central processing unit, ideal for multitasking and performance.", 399.99, "cpu.jpg"],
                  ["GPU (Graphics Card)", "Advanced graphics card to handle demanding visuals and high-resolution rendering.", 699.99, "gpu.jpg"],
                  ["SSD (Solid State Drive)", "High-speed solid-state drive for fast boot times and file access.", 129.99, "ssd.jpg"],
                  ["PC Case", "Durable and stylish mid-tower case with cable management features.", 89.99, "pc-case.jpg"],
                  ["Memory (RAM)", "Fast and reliable RAM module for smooth multitasking and gaming.", 119.99, "ram.jpg"],
                  ["Power Supply Unit (PSU)", "Efficient and quiet PSU to power your entire PC build.", 109.99, "psu.jpg"],
                  ["Motherboard", "Versatile and feature-rich motherboard supporting modern CPUs and peripherals.", 199.99, "motherboard.jpg"],
                  ["Cooling System", "Effective air or liquid cooling to maintain low CPU and GPU temperatures.", 89.99, "cooling.jpg"],
                  ["Peripheral Bundle", "Complete bundle including keyboard, mouse, and headset for a full setup.", 149.99, "peripheral.jpg"]
                    ];
                    // Insert products into products.db
                    (function insertProducts(index = 0) {
                        if (index >= products.length) {
                          return;
                        }
                      
                        db.run(insertQuery, products[index], (err) => {
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
