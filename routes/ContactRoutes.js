const express = require ("express");

const router = express.Router();

const {contactController} = require("../controller/contactUs")

router.post("/contact" , contactController)



module.exports = router;