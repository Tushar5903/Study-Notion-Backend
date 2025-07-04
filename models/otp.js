const mongoose = require("mongoose");
const maileSender = require("../utils/mailSender");
const emailTemplate = require("../mail/template/emailVerification")

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    timeStamp:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
});

// creating function which is used to send email

async function sendVerificationEmail(email,otp){
    try{

        const mailResponse = await maileSender(email,"Verification email from StudyNotion: " , emailTemplate(otp));
        console.log("Email sent successfully: ", mailResponse);

    }catch(error){
        console.log("Error occurs during sending email" , error);
        throw error;
    }
}


otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})




module.exports = mongoose.model("OTP" , otpSchema);