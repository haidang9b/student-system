const express = require('express');
const passport = require('passport');
const router = express.Router();
require('../setup/passport-setup')
const isLoggedIn = require('../middlewares/IsLoggedIn');
const alreadyLoggedIn = require('../middlewares/AlreadyLoggedIn')
const bcrypt = require('bcrypt');
const flash = require('express-flash');

router.use(flash())
router.get('/', alreadyLoggedIn, (req,res) => {
    return res.render('login', {layout: false})
})

router.post('/', passport.authenticate('local', 
    {
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash: true
    })
)

router.get('/google', alreadyLoggedIn, passport.authenticate('google', {scope : ['profile','email']}))
router.get('/google/callback', passport.authenticate('google', { 
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true}))


router.use(passport.initialize())
router.use(passport.session());
router.post('/', passport.authenticate('local',{ successRedirect:'/good', failureRedirect:'/login'}))
module.exports = router;