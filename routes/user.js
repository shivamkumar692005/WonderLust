const express = require("express");
const { model } = require("mongoose");
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
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
        
        req.login(registerUser, (err) => {
            if (err) {
                return res.redirect("/login");
            }
           req.flash("success", "Welcome to wonderlust!");
           return res.redirect("/listings");
        })
   } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
   }
})

router.get("/login", (req, res) => {
    res.render("user/login.ejs");
})


router.post("/login", saveRedirectUrl, passport.authenticate("local",  { failureRedirect: '/login' , failureFlash: true},), async(req, res) => {
    try {
       req.flash("success", "Welcome back to Wonderlust!");
       let redirectUrl = res.locals.redirectUrl || "/listings";

       res.redirect(redirectUrl);
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/login");
    }
    
})

router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logout!");
        res.redirect("/listings");
    })
})
module.exports = router;