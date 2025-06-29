const express = require ("express");

const router = express.Router();

const {auth ,isInstructor,isStudent,isAdmin  } = require("../middleware/authMiddle")
const {createCategory,showCategory,categoryPageDetails} = require("../controller/categoryController");
const {createCourse,showAllCourses,updateCourse,getAllCoursesDetails,getInstructorCourses,deleteCourse,getFullCourseDetails} = require ("../controller/courseController");
const {createRating,getAverageRating,getAllRating} = require("../controller/ratingAndReviewController");
const {createSection,updateSection,deleteSection} = require("../controller/sectionController");
const {subSectionCreation,updatingSubSection,deleteSubSection} = require("../controller/subSectionController");

const {directEnroll} = require("../controller/paymentController");
const {updateCourseProgress} = require("../controller/courseProgress")


router.post("/createCourse" ,auth,isInstructor, createCourse)
router.post("/createSection" ,auth,isInstructor, createSection)
router.post("/updateSection" ,auth,isInstructor, updateSection )
router.delete("/deleteSection" ,auth,isInstructor, deleteSection)

router.post("/subSectionCreation",auth,isInstructor,subSectionCreation)
router.post("/updatingSubSection",auth,isInstructor,updatingSubSection)
router.delete("/deleteSubSection",auth,isInstructor,deleteSubSection)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.delete("/deleteCourse", deleteCourse)

router.get("/showAllCourses", showAllCourses)
router.post("/getAllCoursesDetails",getAllCoursesDetails)


router.put("/updateCourse",auth,isInstructor,updateCourse)

router.post("/createCategory" ,auth,isAdmin, createCategory)
router.get("/showCategory" , showCategory)
router.post("/categoryPageDetails" , categoryPageDetails)


router.post("/CreateRating",auth,isStudent,createRating)
router.get("/getAverageRating",getAverageRating)
router.get("/getAllRating",getAllRating)


router.post("/enroll-direct" , auth, isStudent , directEnroll)
router.post("/updateCourseProgress" ,(req, res, next) => {
  console.log(" Route '/updateCourseProgress' reached");
  next();
},  auth, isStudent , updateCourseProgress)

module.exports = router;