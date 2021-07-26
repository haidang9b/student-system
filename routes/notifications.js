const express = require('express');
const router = express.Router();
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const User = require('../models/user')
router.use(expressLayouts)
const isLoggedIn = require('../middlewares/IsLoggedIn');
const Notify = require('../models/notify')
const addNotifyValidator = require('../validators/addNotifyValidator')
var {validationResult} = require('express-validator')
const flash = require('express-flash');
router.use(flash())
const fs = require('fs');
const notStudent = (req, res, next) => {
    if(req.user && req.user.role === 'admin' || req.user.role === 'faculty'){
        return next();
    }
    return res.redirect('/')
}
const helperNotifyWithSocket = require('../index')

router.get('/detail', isLoggedIn, (req, res) => {
    
    var id = req.query.id
    if(req.query.id){
        if(id.length == 0){
            return res.render('error',{layout: false})
        }
        else{
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.render('error',{layout: false})
            }
            Notify.findById(id).then(n => {
                if(n){
                    var locals = {
                        user: req.user, 
                        title: n.title,
                        notify: n
                    }
                    return res.render('detail', locals)
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

})

router.get('/faculty', isLoggedIn, (req, res) => {
    User.find({role:'faculty'}).then(faculty =>{
        var locals = {
            user: req.user, 
            title:"PHÒNG BAN / KHOA",
            listFaculty: faculty
        }
        return res.render('faculty', locals)
    })
})


//render page notifications by faculty
router.get('/faculty/:id', isLoggedIn, (req, res) => {
    var id = req.params.id
    
    if(id.length ==0){
        return res.render('error',{layout: false})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.render('error',{layout: false})
    }
    User.findById(id).then(u =>{
        if(u){
            if(req.query.page){
                var page = req.query.page
                if(isNaN(page)){
                    return res.render('error')
                }
                else{
                    Notify.find({"creator._id": id}).then(n =>{
                        var max = n.length > (page*10) ? page*10 : n.length
                        var min = (page - 1)*10
                        var result = []
                        var count = []
                        n = n.reverse()
                        for(var i = min; i <max; i++){
                            count.push(i+1)
                            result.push(n[i])
                        }
                        var tmp = n.length/10
                        var locals = {
                            user: req.user, 
                            result: result,
                            count: count,
                            maximum: Math.ceil(tmp),
                            title: u.name,
                            idURL: u._id
                        }
                        return res.render('facultyNotify', locals)
                    })
                }
            }
            else{
                var page = 1
                if(isNaN(page)){
                    return res.render('error')
                }
                else{
                    Notify.find({"creator._id": id}).then(n =>{
                        var max = n.length > (page*10) ? page*10 : n.length
                        var min = (page - 1)*10
                        var result = []
                        var count = []
                        n = n.reverse()
                        for(var i = min; i <max; i++){
                            count.push(i+1)
                            result.push(n[i])
                        }
                        var tmp = n.length/10
                        var locals = {
                            user: req.user, 
                            result: result,
                            count: count,
                            title: u.name,
                            maximum: Math.ceil(tmp),
                            idURL: u._id
                        }
                        return res.render('facultyNotify', locals)
                    })
                }
            }
        }
        else{
            return res.render('error',{layout: false})
        }
    })
})


//render page manager notifications
router.get('/manager', isLoggedIn, notStudent, (req, res) => {
    var data = []
    var title = "Quản lý thông báo của tôi";
    var idFind = req.user._id + ""
    Notify.find({'creator._id':idFind}).then(noti => {
        if(noti){
            data = noti.reverse()
            var locals = {
                user: req.user, 
                title: title,
                data: data
            }
            return res.render('managerNotify', locals)
        }
        else{
            var locals = {
                user: req.user, 
                title: title,
                data: data
            }
            return res.render('managerNotify', locals)
        }
    }).catch(() => {
        return res.render('error', locals)
    })



})

//render page add notifications
router.get('/manager/add', isLoggedIn, notStudent, (req, res) => {
    var locals = {
        user: req.user, 
        title:"Tạo thông báo",
        success: req.flash('success'),
        error: req.flash('error')
    }
    return res.render('addNotify', locals)
})

router.get('/test',(req, res) => {
    Notify.find({'creator._id':'60862e3f788eac2dd417e0ac'}).then(noti => {
        res.json(noti)
    })
})

//add new notifications
router.post('/manager/add', addNotifyValidator , isLoggedIn, notStudent,(req, res) => {
    var result = validationResult(req)
    if(result.errors.length === 0 ){
        var {title, content, topic, fileUpload} = req.body
        new Notify({
            creator: {
                _id: req.user._id,
                idOwner: req.user._id,
                name: req.user.name
            },
            title: title,
            content: content,
            topic: topic,
            fileUpload: fileUpload,
            created: new Date().toLocaleDateString()
        }).save().then(n => {
            if(n){
                var io = req.app.get('socketio');
                var dataNotifyToClient = {
                    url: `/notifications/detail?id=`+n._id,
                    title: title,
                    creator: req.user.name
                }
                io.emit('notify-publish-form-faculty', dataNotifyToClient)
                req.flash('success','Thêm thông báo thành công')
                return res.redirect('/notifications/manager/add')
            }
            else{
                req.flash('error', "Thêm thông báo thất bại")
                return res.redirect('/notifications/manager/add')
            }
        }).catch(() => {
            req.flash('error', "Thêm thông báo thất bại")
            return res.redirect('/notifications/manager/add')
        })
    }
    else{
        var messages = result.mapped()
        var msg = ''
        for(m in messages){
            msg = messages[m]
            break
        }
        req.flash('error', msg.msg)
        return res.redirect('/notifications/manager/add')
    }
})


router.get('/', isLoggedIn, (req, res) => {
    
    if(req.query.page){
        var page = req.query.page
        if(isNaN(page)){
            return res.render('error')
        }
        else{
            Notify.find().then(n =>{
                var max = n.length > (page*10) ? page*10 : n.length
                var min = (page - 1)*10
                var result = []
                var count = []
                n = n.reverse()
                for(var i = min; i <max; i++){
                    count.push(i+1)
                    result.push(n[i])
                }
                var tmp = n.length/10

                var locals = {
                    user: req.user, 
                    title:"THÔNG BÁO",
                    result: result,
                    count: count,
                    maximum: Math.ceil(tmp)
                }
                return res.render('notifications', locals)
            })
        }
    }
    else{
        var page = 1
        if(isNaN(page)){
            return res.render('error')
        }
        else{
            Notify.find().then(n =>{
                var max = n.length > (page*10) ? page*10 : n.length
                var min = (page - 1)*10
                var result = []
                var count = []
                n = n.reverse()
                for(var i = min; i <max; i++){
                    count.push(i+1)
                    result.push(n[i])
                }
                var tmp = n.length/10
                var locals = {
                    user: req.user, 
                    title:"THÔNG BÁO",
                    result: result,
                    count: count,
                    maximum: Math.ceil(tmp)
                }
                return res.render('notifications', locals)
            })
        }
    }
})


router.get('/filter',(req, res) => {
    var {page} = req.query
    Notify.find().then(n =>{
        var max = n.length > (page*10) ? page*10 : n.length
        var min = (page - 1)*10
        var result = []
        var count = []
        n = n.reverse()
        for(var i = min; i <max; i++){
            count.push(i+1)
            result.push(n[i])
        }
        return res.json({success: true, result: result, count: count})
    })
})


router.delete('/manager/:id', (req, res) => {
    var id = req.params.id
    
    if(id.length ==0){
        return res.json({success: false, message: "Vui lòng nhập ID cần xóa"})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({success: false, message: "ID không đúng định dạng"})
    }
    Notify.findByIdAndRemove(id).then(n => {
        if(!n){
            return res.json({success: false, message: "Xóa thông báo thất bại"})
        }
        else{
            removeFileByPath(n.fileUpload)
            return res.json({success: true, message: "Xóa thông báo thành công"})
        }
    })
    .catch(() => {
        return res.json({success: false, message: "Xóa thông báo thất bại"})
    })
})


router.get('/manager/edit/:id', (req, res) => {
    var id = req.params.id
    if(id.length == 0){
        return res.render('error',{layout: false})
    }
    else{
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.render('error',{layout: false})
        }
        Notify.findById(id).then(n => {
            if(n){
                var locals = {
                    user: req.user, 
                    title: n.title,
                    notify: n,
                    error: req.flash('error'),
                    success: req.flash('success')
                }
                return res.render('editNotify', locals)
            }
            else{
                return res.render('error',{layout: false})
            }
        })
        
    }
})

router.post('/manager/edit/:id', addNotifyValidator, isLoggedIn, notStudent, (req, res) => {
    var id = req.params.id
    var result = validationResult(req)
    if(id.length === 0){
        return res.render('error',{layout: false})
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.render('error',{layout: false})
    }
    if(result.errors.length === 0 ){
        var {title, content, topic, fileUpload} = req.body
        
        var dataUpdate = {
            title: title,
            content: content,
            topic: topic,
            fileUpload: fileUpload
        }
        Notify.findByIdAndUpdate(id,dataUpdate).then(n => {
            if(n){
                req.flash('success', 'Cập nhật thông báo thành công')
                return res.redirect(`/notifications/manager/edit/${id}`)
            }
            else{
                req.flash('error', "Cập nhật thông báo thất bại")
                return res.redirect(`/notifications/manager/edit/${id}`)
            }
        })
    }
    else{
        var messages = result.mapped()
        var msg = ''
        for(m in messages){
            msg = messages[m]
            break
        }
        req.flash('error', msg.msg)
        return res.redirect(`/notifications/manager/edit/${id}`)
    }
})


function removeFileByPath(path){
    try{
        var pathRemove = 'public/'+path
        if(fs.existsSync(pathRemove)){
            fs.unlink(pathRemove, (err) => {
                if (err) throw err;
            });
        }
        
    }
    catch{

    }
}
router.use(passport.initialize())
router.use(passport.session());
module.exports = router;