const User = require("../models/user");
const OTP = require("../models/otp");
const Profile = require("../models/profile")
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.sendOTP = async (req, res) => {
    try {
        // fetching email from the request body
        const { email } = req.body;

        // check whether this user is already exist or not
        const checkUserPresent = await User.findOne({ email });
        // If already registed then return
        if (checkUserPresent) {
            return res.status(400).json({
                success: false,
                message: "User Already Registered"
            });
        }
        // if not then generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // checking generated otp is unique or not
        // -------------------------------------------------------------------------------------------------------------------------------
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                // ------------------------------------This is not considered good practice because we create a loop in db for the unique otp, we must use special library which will always generate a random and unique otp.--------------------------------------
                specialChars: false
            })
            result = await OTP.findOne({ otp: otp });
        }
        // --------------------------------------------------------------------------------------------------------------------------------

        // Entering the otp in databse for the verfication process

        const otpPayload = { email, otp };
        // creating an entry in db

        const otpBody = await OTP.create(otpPayload);

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
        })


    } catch (error) {

        console.log("error occurs during otp generation", error);
        return res.status(500).json({
            success: true,
            message: error.message
        });
    }


}



exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body;

        // validation 

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All Fields Are Required",
            });
        }

        // password matching verification

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Confirm Password is not match"
            });
        }

        // user existing verification 

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "user is already exists"
            });
        }

        // find most resent otp stored in the db for the user verification

        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        // recentOTP validation

        if (recentOTP.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP is not Found",
            });
        } else if (otp !== recentOTP[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        

        // Hashing Password

        const hashPassword = await bcrypt.hash(password, 10);


        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)


        // creating entry in database
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            accountType:accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })


        return res.status(200).json({
            success: true,
            message: "User is Successfully Registered",
            user,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "User can't be Registered, Please Try Again Later",
        });
    }


}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "All fields are Required",
            });
        }

        const user = await User.findOne({ email });


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Please Firstly Signup, before Login in the Website"
            });
        }

        // password verification and token generation

        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, option).status(200).json({
                success: true,
                token,
                user,
                message: "User is Successfully LoggedIn"
            });

        } else {
            return res.status(401).json({
                success: false,
                message: "Password is not Correct",
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Can't Login Please Check all the details & Try Again Later"
        });
    }


}

exports.changePassword = async (req, res) => {
    try {
        //---------------------------------change password logic-------------------------------//

        const userDetail = await User.findById(req.user.id);

        const { oldPassword, newPassword } = req.body;

        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetail.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false, message: "The password is incorrect"
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10)

        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        )
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
        } catch (error) {


            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }

        return res.status(200).json({
            success: true, message: "Password updated successfully"
        });







        //---------------------------------change password logic-------------------------------//




    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Password Is Not Changing Please Try Again Later",
        });
    }
}