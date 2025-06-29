const RatingAndReview = require("../models/ratingAndReview");
const Course = require("../models/course");


exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id
        const { rating, review, courseId } = req.body;

        const CourseDetails = await Course.findOne({ _id: courseId, studentEnrolled: { $elemMatch: { $eq: userId } } },);

        if (!CourseDetails) {
            return res.status(404).json({
                sucess: false,
                message: "User Is not Enrolled Fort the Course"
            });
        }

        const alreadyReviewed = await RatingAndReview.findOne({
            userId,
            courseId,
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                sucess: false,
                message: "User Is Already Reviewed a Course"
            });
        }


        const CreateReview = await RatingAndReview.create({
            review,
            rating,
            user: userId,
            course: courseId,
        });

        await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                ratingAndReview: CreateReview._id
            }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Rating And review is Suceessfully Created",
            CreateReview,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: error.message,
        });
    }
}



exports.getAverageRating = async (req, res) => {
    try {

        const courseId = req.body.courseId;

        const result = await RatingAndReview.aggregate([{
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
            },
        }, {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            }
        }
        ]);

        if (result.length>0){
            return response.status(200).json({
                sucess:true,
                averageRating:result[0].averageRating
            });
        }

        return res.status(200).json({
            sucess:true,
            message:"Average Rating is 0, no rating given till now",
            averageRating:0,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: error.message,
        });
    }
}


exports.getAllRating = async(req,res)=>{
    try{
        const allReview = await RatingAndReview.find({}).sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName , lastName , email , image",
        })
        .populate({
            path:"course",
            select:"courseName"
        })
        .exec();

        return res.status(200).json({
            sucess:true,
            message:"All reviews are Successfully fetched",
            data:allReview,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: error.message,
        });
    }
}
