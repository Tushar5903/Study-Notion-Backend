const express = require ("express");

const router = express.Router();

const {auth} = require("../middleware/authMiddle")
const {profileUpdate,profileDelete,getAllUserDetails,updateDisplayPicture,getEnrolledCourses} = require("../controller/profileConroller");

router.put("/ProfileUpdate" , auth , profileUpdate)
router.delete("/ProfileDelete", auth ,profileDelete)
router.get("/getAllUserDetails", auth ,getAllUserDetails)


router.put("/updateDisplayPicture" , auth,updateDisplayPicture)
router.get("/getEnrolledCourses", auth, getEnrolledCourses)



module.exports = router;