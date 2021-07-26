var express = require('express');
const passport = require('passport');
const router = express.Router();
require('../setup/passport-setup')
const isLoggedIn = require('../middlewares/IsLoggedIn');
const Post = require('../models/post')
const User = require('../models/user')
const Notify = require('../models/notify')
const Comment = require('../models/comment')
router.use(passport.initialize())
router.use(passport.session());
const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts)

router.get('/', isLoggedIn, async (req, res) => {
    // var posts =  await Post.find().populate('creator').exec()
    var n = await Notify.find().populate({path:'creator._id',select: 'role'}).exec()
    // var page = 1
    // var max = n.length > (page*10) ? page*10 : n.length
    // var min = (page - 1)*10
    var result = []
    n = n.reverse()
    var count = 0
    for(var i = 0; i <n.length; i++){
        if(count < 10 && n[i].creator._id.role == 'faculty'){
            count = count + 1
            result.push(n[i])
        }
    }
    // console.log(result)
    var locals = {
        user: req.user, 
        title:"TRANG CHỦ",
        notify: result
    }
    
    return res.render('index', locals)
})


router.get('/logout', isLoggedIn, (req, res) => {
    req.session = null;
    req.logout();
    return res.redirect('/login')
})

function getIdVideoYoutubeFormLink(url){
    if(url.includes('https://youtu.be/')){
        return url.split('https://youtu.be/')[1]
    }
    try{
        var idVideo = url.split('v=')[1]
        // console.log(idVideo.length)
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


router.get('/posts/detail', isLoggedIn, (req, res) => {
    var id = req.query.id
    if(req.query.id){
        if(id.length == 0){
            return res.render('error',{layout: false})
        }
        else{
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.render('error',{layout: false})
            }

            Post.findById(id).populate('creator').populate({
                path:'comments', populate:{
                    path:'creator', 
                    model:'User',
                    select: { '_id': 1,'name':1,'image':1}
                }
            }).then(p => {
                if(p){
                    // console.log(p.comments)
                    var locals = {
                        user: req.user, 
                        title: p.creator.name + " - bài viết" ,
                        post: p
                    }
                    return res.render('detailPost', locals)
                }
                else{
                    return res.render('error',{layout: false})
                }
            })
        }
    }
    else{
        return res.render('error',{layout: false})
    }
    // return res.json({d:2})
})

router.delete('/posts/comment/:id', isLoggedIn, (req, res) => {
    var id = req.params.id
    if(req.params.id == null){
        return res.json({success: false, message:'ID bình luận không hợp lệ'})
    }
    if(id.length == 0){
        return res.json({success: false, message:'ID bình luận không hợp lệ'})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({success: false, message:"ID bình luận không hợp lệ"})
    }
    Comment.findById(id).then(c => {
        if(c){
            if(c.creator == req.user._id){
                c.delete().then(cmt => {
                    if(cmt){
                        return res.json({success: true, message:"Xóa bình luận thành công"}) 
                    }
                    else{
                        return res.json({success: false, message:"Xóa bình luận thất bại"}) 
                    }
                })
            }
            else{
                return res.json({success: false, message:'Bình luận này không phải của bạn'})
            }
        }
        else
        {
            return res.json({success: false, message:"ID bình luận không hợp lệ"})
        }
    })
})

router.get('/posts/comment/all/:id', isLoggedIn, async (req, res) => {
    var idPost;
    if(req.params.id){
        var idPost = req.params.id;
        if (!idPost.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({success: false, message:"ID không hợp lệ"})
        }
        else{
            await Post.findById(idPost).populate({
                path:'comments',
                populate:{
                    path: 'creator', model:'User', select: { '_id': 1,'name':1,'image':1}
                }
            }).then(p => {
                if(p){
                    return res.json({success: true,data:p.comments, sender:{name: req.user.name, _id: req.user._id, image :req.user.image }})
                }
                else{
                    return res.json({success: false, message:"ID bài viết không hợp lệ"})
                }
            })
        }
    }
    else{
        return res.json({success: false, message:"ID không hợp lệ"})
    }
})

router.post('/posts/comment', isLoggedIn, async (req, res) => {
    var content;
    var idPost = req.body.idPost;
    if(req.body.idPost){
        idPost = req.body.idPost;
        if (!idPost.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({success: false, message:"ID không hợp lệ"})
        }
        else{
            Post.findById(idPost).then(post => {
                if(post){
                    if(!req.body.content){
                        return res.json({success: false, message:"Vui lòng nhập nọi dung bài viết"})
                    }
                    content = req.body.content;
                    if(content.length == 0){
                        return res.json({success: false, message:"Vui lòng nhập nọi dung bài viết"})
                    }
                    
                    var newComment = new Comment({
                        content: content,
                        creator: req.user._id,
                        created: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
                    })
                    newComment.save().then(cmt => {
                        if(cmt) {
                            post.comments.push(cmt._id)
                            
                            post.save()
                            Comment.findById(cmt._id).populate({path: 'creator', model:'User', select: { '_id': 1,'name':1,'image':1}}).exec().then(data =>{
                                return res.json({success: true, message:"Bình luận thành công", data,idPost})
                            })
                            
                        }
                        else {
                            return res.json({success: false, message:"Không thể thêm cmt"})
                        }
                    })
                    
                }
                else{
                    return res.json({success: false, message:"ID bài viết không hợp lệ"})
                }
            })
        }
    }
    else{
        return res.json({success: false, message:"ID không hợp lệ"})
    }
    
    
})

module.exports = router;