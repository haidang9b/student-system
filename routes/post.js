var express = require('express');
const passport = require('passport');
const router = express.Router();
require('../setup/passport-setup')
const isLoggedIn = require('../middlewares/IsLoggedIn');
const Post = require('../models/post')
const User = require('../models/user')
router.use(passport.initialize())
router.use(passport.session());
const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts)




router.post('/', (req, res) => {
    var {content, video, image} = req.body
    new Post({
        content,
        video: getIdVideoYoutubeFormLink(video),
        image,
        creator: req.user._id,
        created: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
    }).save()
    .then(p => {
        if(p){
            User.findById(req.user._id).then(u => {
                u.posts.push(p._id)
                u.save()
            })
            .then(() =>{
                return res.json({success: true, message:'Đăng bài thành công', post:p, owner: req.user})
            })
            .catch(() =>{
                return res.json({success: false, message:'Đăng bài không thành công, vui lòng kiểm tra lại thông tin'})
            })
        }
        else{
            return res.json({success: false, message:'Đăng bài không thành công, vui lòng kiểm tra lại thông tin'})
        }
    })
    .catch(() => {
        return res.json({success: false, message:'Đăng bài không thành công, vui lòng kiểm tra lại thông tin'})
    })
})

router.get('/:id', isLoggedIn, (req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.json({sucess: false, message:"Vui lòng nhập id"})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({sucess: false, message:"ID bài viết không đúng định dạng"})
    }
    Post.findById(id).then(post => {
        if(post){
            return res.json({sucess: true, message:"Load bài đăng thành công", data: post})
        }
        else{
            return res.json({sucess: false, message:"Không có bài đăng nào từ id này"})
        }
    })
})

router.delete('/:id', isLoggedIn,( req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.json({sucess: false, message:"Vui lòng nhập id"})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({sucess: false, message:"ID bài viết không đúng định dạng"})
    }
    User.findById(req.user._id).then(u =>{
        if(u.posts.includes(id)){
            Post.findByIdAndDelete(id).then(post => {
                if(post){
                    User.findOneAndUpdate(req.user._id, {
                        $pull:{posts: id}
                    })
                    .then(done => {
                        if(done){
                            return res.json({success: true, message:"Đã xóa thành công post này"})
                        }
                    })
                }
                else{
                    return res.json({success: false, message:"Không tồn tại bài đăng này"})
                }
            })
        }
        else{
            return res.json({sucess: false, message:"Cái này không phải của bạn"})
        }
    })
})

router.get('/all/profile', isLoggedIn, (req, res) => {
    var id;
    var page = 1;
    if(req.query.page){
        page = req.query.page
    }
    if(req.query.id){
        id = req.query.id
    }
    else{
        id = req.user._id
    }
    if(id.length == 0){
        return res.json({posts: []})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({posts: []})
    }
    Post.find({creator: id}).populate('creator').then(data => {
        var posts = [];
        if(data){
            var max = data.length > (page*10) ? page*10 : data.length
            var min = (page - 1)*10
            var result = []
            posts = data.reverse()
            for(var i = min; i <max; i++){
                result.push(posts[i])
            }
            return res.json({posts: result, idSend: req.user._id})
        }
        else{
            return res.json({posts: [],idSend: req.user._id})
        }
    })
})


router.get('/all/:page', isLoggedIn,(req, res) => {
    if(req.params.page){
        var page = req.params.page
        Post.find().populate('creator').then(posts =>{
            var max = posts.length > (page*10) ? page*10 : posts.length
            var min = (page - 1)*10
            var result = []
            var count = []
            posts = posts.reverse()
            for(var i = min; i <max; i++){
                count.push(i+1)
                result.push(posts[i])
            }
            return res.json({data: page, idSend:req.user._id, posts:result})
        })
    }
})

router.put('/:id', isLoggedIn,(req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.json({success: false, message: "ID không hợp lệ"})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({success: false, message: "ID không hợp lệ"})
    }
    var data = req.body
    if(data.content.length == 0){
        return res.json({success: false, message: "Vui lòng nhập nội dung"})
    }
    Post.findById(id).then(post => {
        if(post){
            post.content = data.content;
            post.image = data.image;
            post.video = getIdVideoYoutubeFormLink(data.video);
            post.save().then(p => {
                return res.json({success:true,post:p})
            })
        }
        else{
            return res.json({success: false, message: "ID không hợp lệ"})
        }
    })
})


function getIdVideoYoutubeFormLink(url){
    if(url.includes('https://youtu.be/')){
        return url.split('https://youtu.be/')[1]
    }
    try{
        var idVideo = url.split('v=')[1]
        var endPoint = idVideo.indexOf('&')
        if(endPoint != -1){
            idVideo = idVideo.substring(0, endPoint)
        }
        return idVideo
    }
    catch{
        return '';
    }
}


module.exports = router;