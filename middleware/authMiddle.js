const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decode);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong when validating the token",
    });
  }
};


exports.isStudent = async(req,res,next)=>{
    try{
        if (req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This si Protected Route for Student Only",
            });
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something Wrong is Happen during the Student Account verification",
        });
    }

    
}


exports.isInstructor = async(req,res,next)=>{
    try{
        if (req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This si Protected Route for Instructor Only",
            });
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something Wrong is Happen during the Instructor Account verification",
        });
    }

}



exports.isAdmin = async(req,res,next)=>{
    try{
        if (req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This si Protected Route for Admin Only",
            });
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something Wrong is Happen during the Admin Account verification",
        });
    }


}