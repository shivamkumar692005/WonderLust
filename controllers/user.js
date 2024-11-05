const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.signup = async (req, res) => {
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
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wonderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logout!");
    res.redirect("/listings");
  });
};
