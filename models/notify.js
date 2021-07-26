const mongoose = require('mongoose')
const notifySchema = mongoose.Schema({
    creator: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        idOwner: String,
        name: String
    },
    title: String,
    content: String,
    topic: String,
    created: String,
    fileUpload: String
})

const Notify = mongoose.model('Notify',notifySchema)
module.exports = Notify