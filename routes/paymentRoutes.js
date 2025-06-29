const express = require ("express");

const router = express.Router();

const {auth ,isStudent  } = require("../middleware/authMiddle")
const {capturePayment,verifiSignature} = require("../controller/paymentController");

router.post("/CoursePayment",auth, isStudent,capturePayment)
router.post("/CoursePaymentverification",verifiSignature)

module.exports = router;