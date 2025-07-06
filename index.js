const express = require("express");
const app = express();

const userRoutes = require("./routes/user");
const profileRoutes = require('./routes/profileRoutes');
const courseRoutes = require('./routes/courseRoutes');
const contactRoutes = require('./routes/ContactRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const dbConnect = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require ("dotenv").config();

const PORT = process.env.PORT || 4000;

// database Connection
dbConnect();

// middleware 

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// IMPORTANT: `fileUpload` must be before these
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

cloudinaryConnect();

app.use("/api/v1/auth" , userRoutes)
app.use("/api/v1/profile" , profileRoutes)
app.use("/api/v1/course" , courseRoutes)
app.use("/api/v1/reach" , contactRoutes)
app.use("/api/v1/payment" , paymentRoutes)


app.get("/" , (req,res)=>{
    return res.json({
        sucess:true,
        message:"YOur Server is up and running"
    });
});

app.listen(PORT , ()=>{
    console.log(`App is running at ${PORT}`)
});

