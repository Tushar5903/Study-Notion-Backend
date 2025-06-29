const  maileSender  = require("../utils/mailSender")
const { contactUsEmail } = require("../mail/template/ContactConfirmation")

exports.contactController = async (req, res) => {
    try {
        const { email, firstName, lastName, message, phoneNo, countryCode } = req.body;
        if (!email || !firstName || !lastName || !message || !phoneNo || !countryCode) {
            return res.status(404).json({
                sucess: false,
                message: "Data Not Found"
            });
        }
        const emailRes = await maileSender(
            email,
            "Your Data send successfully",
            contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
        );

         console.log("Email Res ", emailRes)

        return res.status(200).json({
            sucess: true,
            message: "Mail is Sucessfully Send",
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: error.message,

        });
    }
}