const express = require('express');
const router = express.Router();
const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts)
const path = require('path')
var {validationResult} = require('express-validator')
const passport = require('passport');

const User = require('../models/user')
const flash = require('express-flash');
const multer = require('multer')
const isLoggedIn = require('../middlewares/IsLoggedIn');

router.use(flash())
const updateProfileValidator = require('../validators/updateProfileValidator');
const Post = require('../models/post');

function randName() {  
    return Math.floor(
      Math.random() * (9999999 - 11111 + 1) + 11111
    ).toString()
}

const Storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname.toLowerCase() + '-' + randName() + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: Storage,
    limits: {fileSize: 10000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
}).single('avatarChange')

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype)

    if(mimetype && extname){
        return cb(null, true)
    }
    else{
        cb('Lỗi: file này không hỗ trợ')
    }
}

router.get('/', isLoggedIn,(req, res) => {
    User.findById(req.user._id).populate('posts').exec().then(profile => {
        var locals = {
            user: req.user, 
            title: profile.name,
            sameID: true,
            profile: profile
        }
        return res.render('profile',locals)
    })
})


router.get('/about', isLoggedIn,(req, res) => {
    User.findById(req.user._id).then(profile => {
        var locals = {
            user: req.user, 
            title: "Thông tin "+ profile.name,
            sameID: true,
            profile: profile
        }
        return res.render('profileAbout',locals)
    })
})


router.get('/:id', isLoggedIn,(req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.render('error')
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.render('error')
    }

    User.findById(id).populate('posts').exec().then(profile => {
        if(profile){
            if(id == req.user._id){
                var locals = {
                    user: req.user, 
                    title: profile.name,
                    sameID: true,
                    profile: profile
                }
                return res.render('profile',locals)
            }
            else{
                var locals = {
                    user: req.user, 
                    title: profile.name,
                    sameID: false,
                    profile: profile
                }
                return res.render('profile',locals)
            }
        }
        else{
            if(id == req.user._id){
                var locals = {
                    user: req.user, 
                    title: profile.name,
                    sameID: true,
                    profile: profile
                }
                return res.render('profile',locals)
            }
            else{
                var locals = {
                    user: req.user, 
                    title: profile.name,
                    sameID: false,
                    profile: profile
                }
                return res.render('profile',locals)
            }
        }
    })
})


router.get('/about/:id', isLoggedIn,(req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.render('error')
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.render('error')
    }
    User.findById(id).then(profile => {
        if(profile){
            var locals = {
                user: req.user, 
                title: "Thông tin "+ profile.name,
                sameID: req.user._id == profile._id ? true : false,
                profile: profile
            }
            return res.render('profileAbout',locals)
        }
        
    })
})


router.post('/changeAvatar', isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            return res.json({status: false , message: err})
        }
        else{
            var dataUpdate = {
                image: `/uploads/`+ req.file.filename
            }
            User.findByIdAndUpdate(req.user._id, dataUpdate).then(u => {
                if(u){
                    req.user.image = dataUpdate.image
                    return res.json({ status: true, message: "Cập nhật thành công", src:  dataUpdate.image})
                }
                else{
                    return res.json({status: false, message: "Không thể cập nhật với tài khoản này"})
                }
            })
            .catch(() => {
                return res.json({status: false, message: "Không thể cập nhật với tài khoản này"})
            })
        }
    })
})

router.post('/', updateProfileValidator,isLoggedIn, async (req, res) => {
    var result = validationResult(req)
    if(result.errors.length === 0 ){
        var id = req.user._id;
        var dataUpdate = {
            name: req.body.name,
            classID: req.body.classID,
            faculty: req.body.faculty
        }
        User.findByIdAndUpdate(id, dataUpdate).then(u => {
            if(u){
                req.user.name = req.body.name
                req.user.classID = req.body.classID
                req.user.faculty = req.body.faculty
                return res.status(200).json({message: 'Cập nhật thông tin thành công'})
            }
            else{
                return res.status(421).json({message: 'Cập nhật thông tin không thành công'})
            }
        }).catch(() => {
            return res.status(421).json({message: 'Cập nhật thông tin thất bại'})
        })
    }
    else{
        var messages = result.mapped()
        var msg = ''
        for(m in messages){
            msg = messages[m]
            break
        }
        return res.status(412).json({message: msg.msg})
    }
})




router.use(passport.initialize())
router.use(passport.session());
module.exports = router;