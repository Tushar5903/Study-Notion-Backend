const mongoose = require("mongoose")
require ("dotenv").config()

const dbConnect = ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>console.log("Database is Successfully Connected"))
    .catch((error)=>{
        console.log("Issue in the database Connection");
        console.log(error);
        process.exit(1);
    });
}

module.exports = dbConnect