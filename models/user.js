const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    idGoogle: String,
    name: String,
    email: String,
    role: String,
    classID: String,
    image: String,
    created: String,
    username: String,
    password: String,
    faculty:String,
    posts : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
})

const User = mongoose.model('User',userSchema)
module.exports = User