const mongoose = require('mongoose')
let commentSchema = new mongoose.Schema({
    content: String,
    created: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment