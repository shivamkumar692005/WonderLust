const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    maxLength: 1000,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
    default:"https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
        : v,
  },
  location: {
    type: String,
  },
  country:{
    type: String,
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }]
});


listingSchema.post("findOneAndDelete", async(listing) => {
  try {
    if(listing) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
  } catch(err) {
    console.log("Review not deleted from array of listing");
  }
})
const Listing = new mongoose.model("Listing", listingSchema);
module.exports = Listing;
