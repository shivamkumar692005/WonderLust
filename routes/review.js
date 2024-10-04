const express = require("express");
const router = express.Router({mergeParams: true});
const {  reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",  ");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// Reviews post route
router.post("/", validateReview, async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(req.params.id);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new Review saved");
    res.redirect(`/listings/${req.params.id}`);
  } catch (err) {
    console.log("Error in saving new review");
    next(err);
  }
});

//Delete review route

router.delete("/:reviewId", async (req, res) => {
  try {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Error in deleting review");
  }
});

module.exports = router;
