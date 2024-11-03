const express = require("express");
const router = express.Router();
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const { populate } = require("../models/review.js");





// Show all listing
router.get("/", async (req, res) => {
  const listings = await Listing.find();
  res.render("listings/index.ejs", { listings });
});

// creating listing form
router.get("/new",isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
  });
  

// Show listing details
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("listings");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    // console.log("Liting not found", err);
    next(err);
  }
});

// Creating listings
router.post("/", isLoggedIn, validateListing, async (req, res, next) => {
  try {
    const result = listingSchema.validate(req.body);
    if (result.error) {
      throw new ExpressError(400, result.error);
    }
    listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// update listing form
router.get("/:id/edit", isLoggedIn, isOwner, async (req, res, next) => {
  const id = req.params.id;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("listings");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.log("Error in the retrieval of listing");
    next(err);
  }
});

// update listing
router.put("/:id", isLoggedIn,isOwner, validateListing, async (req, res, next) => {
  const id = req.params.id;
  try {
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Error in the update of listing");
    next(err);
  }
});

// Delete listings
router.delete("/:id",isLoggedIn, isOwner, async (req, res, next) => {
  const id = req.params.id;
  try {
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.log("Error in the deletion of listing");
    next(err);
  }
});


module.exports = router;
