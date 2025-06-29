const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto" )

exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not Exists"
            });
        }

        const token = crypto.randomUUID();

        const updatedDetails = await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 }, { new: true });
        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(email, "Password Reset Link", `Password Reset Link ${url}`);

        return res.json({
            success: true,
            message: "email Sent Successfully, Please Check Email And Change the Password",
        });




    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Reset Password Token is not Working",
        });
    }


}

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Password is not matching"
            })
        }
        
        const user = await User.findOne({ token: token });
        
        

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            });
        }


        if (user.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Generated Token is Expire"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate({ token: token }, { password: hashPassword }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Password is Successfully Reset"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Reset Password Token is not Working",
        });
    }
}