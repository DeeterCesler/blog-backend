const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    user: {required: true, type: String},
    blogName: {required: true, type: String},
    blogSummary: {required: true, type: String},
    body: {required: true, type: String}
})

module.exports = mongoose.model('blog', blogSchema);