const express = require ("express");
// Not Completed Yet 

const router = express.Router();
const {auth ,isInstructor,isStudent,isAdmin  } = require("../middleware/authMiddle")
const {sendOTP,signup,login,changePassword} = require("../controller/auth");
const {resetPasswordToken,resetPassword} = require("../controller/resetPassword");
const {createCategory,showCategory,categoryPageDetails} = require("../controller/categoryController");
const {createCourse,showAllCourses,updateCourse,getAllCoursesDetails} = require ("../controller/courseController");
const {capturePayment,verifiSignature} = require("../controller/paymentController");
const {profileUpdate,profileDelete,getAllUserDetails,updateDisplayPicture} = require("../controller/profileConroller");
const {createRating,getAverageRating,getAllRating} = require("../controller/ratingAndReviewController");
const {createSection,updateSection,deleteSection} = require("../controller/sectionController");
const {subSectionCreation,updatingSubSection,deleteSubSection} = require("../controller/subSectionController");
const {contactController} = require("../controller/contactUs")

// --------------------user Routes-----------------------------------//
router.post("/sendOTP" , sendOTP)
router.post("/signup",signup)
router.post("/login",login)
router.post("/changePassword" , changePassword)
router.get("/resetpasswordToken",resetPasswordToken)
router.post("/resetPassword" , resetPassword)

// -------------------------profile Routes--------------------------//
router.put("/ProfileUpdate" , profileUpdate)
router.delete("/ProfileDelete",profileDelete)
router.get("/getAllUserDetails",getAllUserDetails)


router.put("/updateDisplayPicture" , auth,updateDisplayPicture)


// --------------------------course Routes-----------------------------------//

router.post("/createCourse" ,auth,isInstructor, createCourse)
router.post("/createSection" ,auth,isInstructor, createSection)
router.put("/updateSection" ,auth,isInstructor, updateSection )
router.delete("/deleteSection" ,auth,isInstructor, deleteSection)
router.post("/subSectionCreation",auth,isInstructor,subSectionCreation)
router.put("/updatingSubSection",auth,isInstructor,updatingSubSection)
router.delete("/deleteSubSection",auth,isInstructor,deleteSubSection)

router.get("/showAllCourses", showAllCourses)
router.get("/getAllCoursesDetails",getAllCoursesDetails)


router.put("updateCourse",auth,isInstructor,updateCourse)

router.post("/createCategory" ,auth,isAdmin, createCategory)
router.get("/showCategory" , showCategory)
router.post("/categoryPageDetails" , categoryPageDetails)


router.post("/CreateRating",auth,isStudent,createRating)
router.get("/getAverageRating",getAverageRating)
router.get("/getAllRating",getAllRating)

// --------------------------payment Routes----------------------------------//

router.post("/CoursePayment",auth, isStudent,capturePayment)
router.post("/CoursePaymentverification",verifiSignature)

// --------------------Contact Us Routes --------------------------------//

router.post("/contact" , contactController)





module.exports = router;