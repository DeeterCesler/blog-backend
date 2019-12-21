const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    user: {required: true, type: String},
    blogName: {required: true, type: String},
    blogEmail: {required: true, type: String},
    blogSummary: {required: true, type: String},
    firstReminder: Date,
    secondReminder: Date,
    thirdReminder: Date,
    fourthReminder: Date,
    repeatingReminder: Date,
    nextReminder: Date,
    firstReminderInterval: Number,
    secondReminderInterval: Number,
    repeatingReminderRhythm: Number,
    stage: Number, // 1-5, representing which reminder they're on. 5 is the final stage (for now)
})

module.exports = mongoose.model('blog', blogSchema);