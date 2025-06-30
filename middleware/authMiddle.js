exports.auth = async (req, res, next) => {
  try {
    console.log("Auth Middleware Triggered");
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Body token:", req.body.token);

    let token = null;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.body?.token) {
      token = req.body.token;
    } else if (
      req.headers.authorization &&
      typeof req.headers.authorization === "string" &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("Extracted Token:", token);

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
    console.error("Auth Middleware Error:", error);
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