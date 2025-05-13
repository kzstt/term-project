const express = require("express");
const path = require("path");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

router.use(express.static(path.join(__dirname, "../public")));
const db = new sqlite3.Database(path.join(__dirname, '../data/users.db'));

router.use((req,res, next) => {
    if(!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', (req,res) => {
    const username = req.session.user.username;
    const q = "SELECT * FROM users WHERE username = ?";

    db.get(q, [username], (err,row) => {
        if(err) {
            return res.status(500).send(err.message);
        }
        res.render('profile', {user: row});
    });
});

module.exports = router;
