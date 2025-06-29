const express = require ("express");

const router = express.Router();


const {auth} = require("../middleware/authMiddle")
const {sendOTP,signup,login,changePassword} = require("../controller/auth");
const {resetPasswordToken,resetPassword} = require("../controller/resetPassword");

router.post("/sendOTP" , sendOTP)
router.post("/Signup",signup)
router.post("/Login",login)
router.post("/ChangePassword" ,auth , changePassword)
router.post("/ResetpasswordToken",resetPasswordToken)
router.post("/ResetPassword" , resetPassword)



module.exports = router;


