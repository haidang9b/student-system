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
const adminOnly = require('../middlewares/AdminOnly')
const addAccountValidator = require('../validators/addAccountValidator')
router.use(flash())

router.get('/',isLoggedIn , adminOnly, async (req, res) => {
    User.find({role:'faculty'}).then(accounts =>{
        var locals = {
            user: req.user, 
            title:"Tài khoản",
            listAccount: accounts
        }
        return res.render('account', locals)
    })
})

router.get('/add',isLoggedIn, adminOnly, (req, res) => {
    var locals = {
        user: req.user, 
        title:"Thêm tài khoản",
        error: req.flash('error'),
        success: req.flash('success')
    }
    return res.render('addAccount', locals)
})

router.post('/', addAccountValidator, isLoggedIn, adminOnly, (req, res) => {
    var result = validationResult(req)
    if(result.errors.length === 0 ){
        var {username, pass, name} = req.body
        User.findOne({username: username})
        .then(u => {
            if(u){
                req.flash('error',"Tài khoản này đã tồn tại")
                return res.redirect('/account/add')
            }
            else{
                bcrypt.hash(pass,10)
                .then(hashed => {
                var createdDateTime =  new Date().toLocaleDateString('en-GB');
                let newUser = new User({
                    name: name,
                    username: username,
                    password: hashed,
                    role: "faculty",
                    created: createdDateTime,
                    image: '../images/tdt_logo.png'
                })
                    return newUser.save()
                })
                .then(() => {
                    req.flash('success', "Thêm tài khoản thành công")
                    return res.redirect('/account/add')
                })
                .catch((e) => {
                    req.flash('error', e)
                    return res.redirect('/account/add')
                })
            }
        }).catch(e => {
            req.flash('error', e)
            return res.redirect('/account/add')
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
        return res.redirect('/account/add')
    }
})

router.delete('/:id', isLoggedIn, adminOnly, (req, res) => {
    var id = req.params.id;
    if(!id) {
        return res.json({success: false, message: "Xóa tài khoản thất bại"})
    }
    else if(id.length === 0){
        return res.json({success: false, message: "Xóa tài khoản thất bại"})
    }
    else{
        User.findByIdAndRemove(id).then(a => {
            if(!a){
                return res.json({success: false, message: "Xóa tài khoản thất bại"})
            }
            else{
                return res.json({success: true, message: "Xóa tài khoản thành công"})
            }
        }).catch(e => {
            return res.json({success: false, message: "Xóa tài khoản thất bại"})
        })
    }
})

router.put('/:id',isLoggedIn, adminOnly, addAccountValidator, (req, res) => {
    var id = req.params.id
    var result = validationResult(req)
    if(id.length == 0){
        return res.status(422).json({error:"Unprocessable Entity", message: 'ID không tồn tại'})
    }
    if(result.errors.length === 0){
        var{username, name, pass} = req.body
        bcrypt.hash(pass,10)
        .then(hashed=>{
            var dataUpdate = {
                name: name,
                username: username,
                password: hashed
            }
            User.findByIdAndUpdate(id, dataUpdate, {new: true}).then(u => {
                if(u){
                    return res.status(200).json({error:"none", message: 'Cập nhật ' +u.name+' thành công' })
                }
                else{
                    return res.status(422).json({error:"Unprocessable Entity", message: 'ID không tồn tại'})
                }
            })
        })
        .catch(e => {
            return res.status(422).json({error:"Unprocessable Entity", message: 'Có lỗi'})
        })
    }
    else{
        var messages = result.mapped()
        var msg = ''
        for(m in messages){
            msg = messages[m]
            break
        }
        return res.status(422).json({error:"Unprocessable Entity", message: msg.msg})
    }
})

router.use(passport.initialize())
router.use(passport.session());

module.exports = router;