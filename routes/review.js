const express = require("express");
const router = express.Router({mergeParams: true});
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
  



// Reviews post route
router.post("/", isLoggedIn, validateReview, async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
   
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${req.params.id}`);
  } catch (err) {
    console.log("Error in saving new review");
    next(err);
  }
});

//Delete review route

router.delete("/:reviewId",isLoggedIn, isReviewAuthor, async (req, res) => {
  try {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Error in deleting review");
    next(err);
  }
});

module.exports = router;
