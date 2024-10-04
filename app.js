const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { error } = require("console");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  mongoose.connect(MONGO_URL);
}

const validateListing = (req, res, next) => {
  const {error} = listingSchema.validate(req.body);

    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",  ");
      throw new ExpressError(400, error);
    } else {
      next();
    }
}

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);

    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",  ");
      throw new ExpressError(400, error);
    } else {
      next();
    }
}


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Show all listing
app.get("/listings", async (req, res) => {
  const listings = await Listing.find();
  res.render("listings/index.ejs", { listings });
});

// creating listing form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Creating listings
app.post("/listings",validateListing, async (req, res, next) => {
  
  try {
    const result = listingSchema.validate(req.body);
    if(result.error) {
      throw new ExpressError(400, result.error);
    }
    listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// update listing form
app.get("/listings/:id/edit", async (req, res, next) => {
  const id = req.params.id;
  try {
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.log("Error in the retrieval of listing");
    next(err);
  }
});

// update listing
app.put("/listings/:id",validateListing, async (req, res, next) => {
  const id = req.params.id;
  try {
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Error in the update of listing");
    next(err);
  }
});

// Delete listings
app.delete("/listings/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  } catch (err) {
    console.log("Error in the deletion of listing");
    next(err);
  }
});

// Reviews post route
app.post("/listings/:id/reviews", validateReview, async(req, res, next) => {
  
  try {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new Review saved");
    res.redirect(`/listings/${req.params.id}`)
  } catch(err) {
    console.log("Error in saving new review");
    next(err);
  }

})
// Show listing details
app.get("/listings/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    // console.log("Liting not found", err);
    next(err);
  }
});

//Delete review route

app.delete("/listings/:id/reviews/:reviewId",async (req, res) => {
  try {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  } catch(err) {
    console.log("Error in deleting review");
  }
})

// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         "title": "Villa",
//         "description": "A beach Slide villa",
//         "price": 10000,
//         "location": "Mahananda Bihar",
//         "country": "India"
//     });
//    try {
//         await sampleListing.save();
//         console.log("Listing saved");
//         res.json(sampleListing);
//    } catch (err){
//     console.log("Error saving listing", err);
//    }
// })


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
