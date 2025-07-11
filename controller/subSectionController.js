const Section = require("../models/section");
const subSection = require("../models/subSection");
const SubSection = require("../models/subSection");
const { uploadImageToCLoudinary } = require("../utils/imageUploader")
require("dotenv").config();

exports.subSectionCreation = async (req, res) => {
    try {
        const { title, description, sectionId } = req.body;

        const videoUrl = req.files.videoFile;

        if (!title || !description || !sectionId || !videoUrl ) {
            console.log(error)
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }

        const courseVideo = await uploadImageToCLoudinary(videoUrl, process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.create({
            title: title,
            description: description,
            videoUrl: courseVideo.secure_url,
        })

        const updatingSection = await Section.findByIdAndUpdate(sectionId, {
            $push: {
                subsection: subSectionDetails._id
            }
        }, { new: true }).populate("subsection");

        return res.status(200).json({
            success: true,
            message: "New Sub-Section is Successfully Created",
            data: updatingSection,
        })


    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during Sub Section Creation",
            message: error.message,
        });
    }
}


exports.updatingSubSection = async (req, res) => {
    try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()


    const updatedSection = await Section.findById(sectionId).populate(
      "subsection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
   try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subsection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}