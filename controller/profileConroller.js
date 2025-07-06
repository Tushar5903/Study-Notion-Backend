const Profile = require("../models/profile")
const User = require("../models/user")
const { uploadImageToCLoudinary } = require("../utils/imageUploader")
const Course = require('../models/Course')
const CourseProgress = require('../models/CourseProgress')
const {convertSecondsToDuration} = require ('../utils/secToDuration')


exports.profileUpdate = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", gender, contactNumber } = req.body
        const id = req.user.id;

        if (!gender || !contactNumber || !id) {
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }

        const userDetail = await User.findById(id);
        const ProfileId = userDetail.additionalDetails;
        const profileDetails = await Profile.findById(ProfileId);


        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        const updatedUser = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "Profile Details Successfully updated",
            updatedUserDetails: updatedUser,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
}


exports.profileDelete = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetail = await User.findById(id);

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        await Profile.findByIdAndDelete({ _id: userDetail.additionalDetails });


        //--------------------------------Enrolled user decrease when user delete their account-------------------------------------






        //--------------------------------Enrolled user decrease when user delete their account-------------------------------------

        await User.findByIdAndDelete({ _id: id });

        //---------------------------how to schedule the task for deleting the account after 2 days --------------------------------




        //---------------------------how to schedule the task for deleting the account after 2 days --------------------------------



        return res.status(200).json({
            success: true,
            message: "Profile Delete Successfully",
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during Profile Deletion",
        });
    }
}


exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const getUserDetail = await User.findById(id).populate("additionalDetails").exec();


        return res.status(200).json({
            success: true,
            message: "User Data Fetch Successfully",
            getUserDetail,
        });



    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during Profile Deletion",
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        console.log("FILES:", req.files);
        console.log("BODY:", req.body);
        console.log("fileUpload middleware loaded");
        console.log("fileUpload middleware loaded");
        console.log("fileUpload middleware loaded");

        if (!req.files || !req.files.displayPicture) {
            return res.status(400).json({
                success: false,
                message: "No display picture file was uploaded",
            });
        }

        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCLoudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )

        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
            _id: userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subsection",
                    },
                },
            })
            .exec()

        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subsection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subsection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}