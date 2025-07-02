const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        const cookieToken = req.cookies.token;
        const bodyToken = req.body.token;
        const headerTokenRaw = req.header("Authorization");
        const headerToken = headerTokenRaw?.replace("Bearer ", "");

        console.log("🔍 Token from cookie:", cookieToken);
        console.log("🔍 Token from body:", bodyToken);
        console.log("🔍 Token from Authorization header:", headerTokenRaw);
        console.log("✅ Final token used:", cookieToken || bodyToken || headerToken);

        const token = cookieToken || bodyToken || headerToken;

        if (!token || token.trim() === "") {
            return res.status(401).json({ success: false, message: "Token Missing" });
        }

        try {
            console.log("🔐 JWT_SECRET in Render:", process.env.JWT_SECRET);
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ Decoded JWT payload:", decode);

            req.user = decode;
            next();
        } catch (error) {
            console.log("❌ JWT verification failed:", error.message);
            return res.status(401).json({
                success: false,
                message: "Token is invalid or malformed",
            });
        }

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};


exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Students",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "User Role Can't be Verified" });
    }
};
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "User Role Can't be Verified" });
    }
};
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);

        if (userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructor",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "User Role Can't be Verified" });
    }
};