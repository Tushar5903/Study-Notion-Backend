const mongoose = require("mongoose")
const Section = require("../models/section")
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")
const Course = require("../models/course")


exports.updateCourseProgress = async (req, res) => {
    console.log("✅ updateCourseProgress hit");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    const { courseId, subsectionId } = req.body
    const userId = req.user.id

    try {
        const subsection = await SubSection.findById(subsectionId)
        if (!subsection) {
            return res.status(404).json({ error: "Invalid subsection" })
        }

        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course progress Does Not Exist",
            })
        } else {
            if (courseProgress.completedVideos.includes(subsectionId)) {
                return res.status(400).json({ error: "Subsection already completed" })
            }

            courseProgress.completedVideos.push(subsectionId)
        }

        await courseProgress.save()

        return res.status(200).json({ message: "Course progress updated" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
}
