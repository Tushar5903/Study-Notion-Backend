const mongoose = require("mongoose")

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    }
});


module.exports = mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);