const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
    content: String,
    created: String,
    image: String,
    video: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]

})

const Post = mongoose.model('Post',postSchema)
module.exports = Post