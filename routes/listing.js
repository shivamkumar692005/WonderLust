const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingsControllers = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(listingsControllers.index)
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsControllers.createListing)
  );
 
// creating listing form
router.get("/new", isLoggedIn, listingsControllers.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingsControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsControllers.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsControllers.destroyListing));

// update listing form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsControllers.renderEditForm)
);

module.exports = router;
