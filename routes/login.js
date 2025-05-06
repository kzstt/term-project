const express = require("express");
const path = require("path");
const router = express.Router();

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
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const q = "SELECT * FROM users WHERE username = ?";
    db.get(q, [username], (err, row) => {
      if (err) {
        return res.status(500).send("Error");
      }
      if (!row) {
        return res.render('login', {error: 'Account does not exist'});
      }
      if (row.password != password) {
        return res.render('login', {error: 'Invalid Password'});
      }
      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
  }
});

// register form
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", (req, res) => {
  try {
    const { username, email, password } = req.body;
    const s = db.prepare(
      "INSERT INTO users (username, email, password) VALUES(?,?,?)"
    );
    s.run(username, email, password, function (err) {
      if (err.message.includes("UNIQUE constraint failed:users.username")) {
        res.send("Username already exists");
      }
      if (err.message.includes("UNIQUE constraint failed:users.email")) {
        res.send("Email already exists");
      }
      res.redirect("/");
    });
  } catch (error) {
    console.log(error);
  }
});

//check users
// router.get("/users", (req, res) => {
//   db.all("SELECT * FROM users", [], (err, rows) => {
//     if (err) {
//       return res.status(500).send(err.message);
//     }
//     res.json(rows);
//   });
// });

module.exports = router;
