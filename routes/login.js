const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");


router.use(express.static(path.join(__dirname, "../public")));

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.join(__dirname, "../data/users.db"),
  (err) => {
    if (err) {
      return console.error("Error opening database", err.message);
    }
    console.log("Connected to todos database");
  }
);

//create table
db.exec(
  `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`,
  (err) => {    
    if (err) {
      return console.error("Error creating table:", err.message);
    }
    console.log("users table created.");
  }
);



//login form
router.get("/login", (req, res) => {
  res.render('login', {error: null});
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const q = "SELECT * FROM users WHERE username = ?";
    db.get(q, [username], async (err, row) => {
      if (err) {
        return res.status(500).send("Error");
      }
      if (!row) {
        return res.render('login', {error: 'Account does not exist'});
      }
      const comparePassword = await bcrypt.compare(password, row.password);
      req.session.user = {
        id: row.id,
        username: row.username
      };
      if(!comparePassword){
        return res.render('login', {error: 'Incorrect password'});
      }
      if(comparePassword){
      res.redirect("/");
    }
    });
  } catch (error) {
    console.error(error);
  }
});

// register form
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", async (req, res) => {
//   try {
    const { username, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const s = db.prepare(
      "INSERT INTO users (username, email, password) VALUES(?,?,?)"
    );
    s.run(username, email, hashPassword, function (err) {
        if (err){
      if (err.message.includes("UNIQUE constraint failed:users.username")) {
        res.send("Username already exists");
      }
      if (err.message.includes("UNIQUE constraint failed:users.email")) {
        res.send("Email already exists");
      }
    }
      res.redirect("/login");
    });
//   } catch (error) {
//     console.log(error);
//   }
});

// check users
// router.get("/users", (req, res) => {
//   db.all("SELECT * FROM users", [], (err, rows) => {
//     if (err) {
//       return res.status(500).send(err.message);
//     }
//     res.json(rows);
//   });
// });

module.exports = router;
