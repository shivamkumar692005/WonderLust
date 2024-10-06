const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session  = require("express-session");
const flash = require("connect-flash");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:  7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  res.locals.success = req.flash('success'); 
  res.locals.error = req.flash('error'); 

  // console.log(success);
  next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);





app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
})
app.use((err, req, res, next) => {
  let {statusCode = 500, message = "something went wrong!"} = err;
  res.status(statusCode).render("error", {err});
  console.log(err);
})
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
