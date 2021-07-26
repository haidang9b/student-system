const express = require('express');
const router = express.Router();
var {validationResult} = require('express-validator')
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
router.use(expressLayouts)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const flash = require('express-flash');
const isLoggedIn = require('../middlewares/IsLoggedIn');
router.use(flash())

const notStudent = (req, res, next) => {
    if(req.user && req.user.role === 'admin' || req.user.role === 'faculty'){
        return next();
    }
    return res.redirect('/')
}


const changePasswordValidator = require('../validators/changePasswordValidator')

router.get('/resetPassword', isLoggedIn, notStudent, (req, res) => {
    var locals = {
        user: req.user, 
        title:"Đổi mật khẩu",
        error: req.flash('error'),
        success: req.flash('success')
    }
    return res.render('changePassword', locals)
})


router.post('/resetPassword', changePasswordValidator, isLoggedIn, notStudent,(req, res) => {
    var result = validationResult(req)
    if(result.errors.length === 0){
        var {pass, oldpass} = req.body
        var id = req.user._id
        User.findById(id).then(u => {
            if(!u){
                req.flash('error', "Không tồn tại tài khoản này")
                return res.redirect('/setting/resetPassword')
            }
            else{
                bcrypt.compare(oldpass,u.password)
                .then(matched => {
                    if(matched){
                        bcrypt.hash(pass,10).then(hashed => {
                            var dataUpdate = {
                                password: hashed
                            }
                            User.findByIdAndUpdate(id, dataUpdate).then(done => {
                                if(done){
                                    req.flash('success', "Thay đổi mật khẩu thành công")
                                    return res.redirect('/setting/resetPassword')
                                }
                                else{
                                    req.flash('error', "Cập nhật không thành công")
                                    return res.redirect('/setting/resetPassword')
                                }
                            })
                            .catch(() => {
                                req.flash('error', "Cập nhật không thành công")
                                return res.redirect('/setting/resetPassword')
                            })
                        })
                    }
                    else{
                        req.flash('error', "Mật khẩu cũ không chính xác")
                        return res.redirect('/setting/resetPassword')
                    }
                })
                .catch(() => {
                    req.flash('error', "Cập nhật không thành công")
                    return res.redirect('/setting/resetPassword')
                })
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
        return res.redirect('/setting/resetPassword')
    }
})

router.use(passport.initialize())
router.use(passport.session());
module.exports = router;