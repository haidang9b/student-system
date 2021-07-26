const express = require('express');
const router = express.Router();
const path = require('path')
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts)
const flash = require('express-flash');
const multer = require('multer')
const isLoggedIn = require('../middlewares/IsLoggedIn');
router.use(flash())

function randName() {  
    return Math.floor(
      Math.random() * (99999999 - 9 + 1) + 9
    ).toString()
}

const Storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        var extension = path.extname(file.originalname);
        var name = path.basename(file.originalname ,extension);
        cb(null, name.toLowerCase() + '-' + randName() + '-' + Date.now() + path.extname(file.originalname))
    }
})

const uploadImage = multer({
    storage: Storage,
    limits: {fileSize: 10000000},
    fileFilter: (req, file, cb) => {
        checkOnlyImage(file, cb)
    }
}).single('image-upload')

const uploadFile = multer({
    storage: Storage,
    limits: {fileSize: 15000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
}).single('file-upload')

function checkOnlyImage(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype)
    if(mimetype && extname){
        return cb(null, true)
    }
    else{
        cb('Loại tệp này không được hỗ trợ đính kèm')
    }
}

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif|doc|docx|zip|rar|txt|pptx|xls|xlsx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype)

    if(mimetype && extname){
        return cb(null, true)
    }
    else{
        cb('Loại tệp này không được hỗ trợ đính kèm')
    }
}

router.post('/', isLoggedIn,(req, res) => {
    try{
        uploadFile(req, res, (err) => {
            if(err){
                // console.log(err.message)
                return res.json({status: false , error:"Unprocessable Entity", message: err.message})
            }
            else{
                var urlFile = `/uploads/`+ req.file.filename
                return res.json({status: true, message: 'Upload file thành công', src: urlFile})
            }
        })
    }
    catch{
        return res.json({status: false , error:"Unprocessable Entity", message: 'Upload file thất bại'})
    }
})

router.post('/image', isLoggedIn, (req, res) => {
    try{
        uploadImage(req, res, (err) => {
            if(err){
                // console.log(err.message)
                return res.json({status: false , error:"Unprocessable Entity", message: err.message})
            }
            else{
                console.log()
                var urlFile = `/uploads/`+ req.file.filename
                return res.json({status: true, message: 'Upload file thành công', src: urlFile})
            }
        })
    }
    catch{
        return res.json({status: false , error:"Unprocessable Entity", message: 'Không thể upload ảnh này'})
    }
    
})

router.use(passport.initialize())
router.use(passport.session());
module.exports = router;