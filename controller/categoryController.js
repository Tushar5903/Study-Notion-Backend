const mongoose = require("mongoose");
const Category = require("../models/category");


exports.createCategory = async (req, res) => {
    try {

        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(401).json({
                success: false,
                message: "All Fields Are Required"
            });
        }

        const CategoryDetails = await Category.create({
            name: name,
            description: description
        });

        return res.status(200).json({
            success: true,
            message: "Category Created SuccessFully",
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during tag creation",
        });
    }
}



exports.showCategory = async (req, res) => {
    try {
        const allShowCategory = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            message: "Tags Are Returned Successfully",
            allShowCategory,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something is wrong during tag creation",
        });
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
    const { categoryId } = req.body;
    console.log("PRINTING CATEGORY ID: ", categoryId);

    // Validate categoryId
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing categoryId",
      });
    }

    // Populate the correct field "course"
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "course",
        match: { status: "Published" },
      })
      .exec();

    if (!selectedCategory) {
      console.log("Category not found.");
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!selectedCategory.course || selectedCategory.course.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // Get other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    // Pick one random different category
    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const random =
        categoriesExceptSelected[Math.floor(Math.random() * categoriesExceptSelected.length)];
      differentCategory = await Category.findById(random._id)
        .populate({
          path: "course",
          match: { status: "Published" },
        })
        .exec();
    }

    // Get all courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.course || []);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.error("CATEGORY PAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}