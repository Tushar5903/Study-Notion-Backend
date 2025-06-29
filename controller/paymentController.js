const instance = require("../config/razorpay")
const User = require("../models/user")
const Course = require("../models/course")
const maileSender = require("../utils/mailSender")
const  courseEnrollement  = require("../mail/template/courseEnrollement")
const { default: mongoose } = require("mongoose")
// const { default: orders } = require("razorpay/dist/types/orders") 

exports.capturePayment = async (req, res) => {
    // get courseId andUserId
    const { Course_id } = req.body;
    const { userId } = req.user.id;
    // validation
    if (!Course_id) {
        return res.status(404).json({
            success: false,
            Message: "Please Give Valid Course Id",
        });
    }

    // valid CourseId
    let course;
    try {
        course = await Course.findById("Course_id")
        if (!course) {
            return res.status(404).json({
                success: false,
                Message: "Course Not Found",
            });
        }

        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId("userId");
        if (course.studentEnrolled.includes(uid)) {
            return res.status(400).json({
                sucess: false,
                message: "Student is already Enrolled"
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            sucess: false,
            message: error.message
        });
    }

    // order create
    const amount = Course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            CourseId: Course_id,
            userId,
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse);
        // return response
        return res.status(200).json({
            sucess: true,
            courseName: Course.courseName,
            courseDescription: Course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });

    } catch (error) {
        console.error(error);
        return res.json({
            sucess: false,
            message: "issue in initiate order"
        });
    }

}

exports.verifiSignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(json.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature == digest) {
        const { CourseId, userId } = req.body.payload.payment.entitiy.notes;
        try {
            const enrolledCourse = await Course.findOneAndUpdate({ _id: CourseId },
                {
                    $push: {
                        studentEnrolled: userId
                    }
                },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    sucess: false,
                    message: "Course Not Found",

                });
            }

            const enrolledStudent = await User.findOneAndUpdate({ _id: userId },
                {
                    $push: {
                        courses: CourseId,
                    }
                },
                { new: true }

            );

            const emailResponse = await maileSender(
                enrolledStudent.email, "Congratulation You are Onboarded into new StudyNotion Course"
            );

            return res.status(200).json({
                sucess: true,
                message: "Signature Verification and Adding Courses"
            })





        } catch (error) {
            console.error(error);
            return res.json({
                sucess: false,
                message: "Issue in Signature Verification"
            });
        }
    }else {
        return res.status(400).json({
            sucess:false,
            message:"Signature Is not Matched",
        });
    }


}

// controllers/directEnrollController.js



exports.directEnroll = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // check if already enrolled
        if (course.studentEnrolled.includes(userId)) {
            return res.status(409).json({
                success: false,
                message: "Already enrolled in this course",
            });
        }

        // Add user to course
        course.studentEnrolled.push(userId);
        await course.save();

        // Add course to user
        await User.findByIdAndUpdate(userId, {
            $push: { courses: courseId }
        });


        return res.status(200).json({
            success: true,
            message: "Enrolled successfully (direct)",
        });

    } catch (error) {
        console.log("DIRECT ENROLL ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Enrollment failed",
        });
    }
}
