const Section = require("../models/section");
const Course = require("../models/course");
const SubSection = require("../models/subSection");

exports.createSection = async (req, res) => {
    try {
        // data fetching from the body
        const { sectionName, courseId } = req.body;
        // validation of the data\
        if (!sectionName || !courseId) {
            return res.status(401).json({
                success: false,
                message: "All Fields Are Required"
            });
        }
        // create section
        const newSection = await Section.create({ sectionName });
        // update course controller
        const updateCourse = await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: newSection._id,
            }
        }, { new: true }).populate({
            path: "courseContent",
            populate: {
                path: "subsection"
            }
        });

        // return successful return
        return res.status(200).json({
            success: true,
            message: "Tags Are Returned Successfully",
            data: updateCourse,
        });




    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during Section creation",
        });
    }
}



exports.updateSection = async (req, res) => {
    try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subsection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

exports.deleteSection = async (req, res) => {
    try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		await SubSection.deleteMany({_id: {$in: section.subsection}});

		await Section.findByIdAndDelete(sectionId);

		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subsection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}