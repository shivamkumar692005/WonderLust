const express = require("express");
const { model } = require("mongoose");
const User = require("../models/user");
const passport = require("passport");
const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
});

router.post("/signup", async(req, res) => {
   try {
        const { username, email, password } = req.body;
        const newUser = new User({
            username,
            email,
        });

        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.flash("success", "Welcome to wonderlust!");
        res.redirect("/listings");
   } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
   }
})

router.get("/login", (req, res) => {
    res.render("user/login.ejs");
})


router.post("/login", passport.authenticate("local",  { failureRedirect: '/login' , failureFlash: true},), async(req, res) => {
    try {
       req.flash("success", "Welcome back to Wonderlust!");
       res.redirect("/listings");
    } catch(e) {
        req.flash("error", e.message);
    }
    
})
module.exports = router;