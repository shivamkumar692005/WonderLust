const initdata = require("./data.js");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");


const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log("Connected to MongoDB");
}) .catch((err) =>{
    console.log(err);
})

async function main() {
    mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    try {
        
        await Listing.insertMany(initdata.data);
        console.log("data saved");
    } catch (err) {
        console.log("Erroe in init the DB", err);
    }
}

initDB();