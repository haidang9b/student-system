const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')
require('dotenv').config()



passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // User.findById(id, function(err, user) {
        done(null, user);
    // });
});

passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CONSUMER_KEY}`,
    clientSecret: `${process.env.GOOGLE_CONSUMER_SECRET}`,
    callbackURL: `${process.env.BASE_URL}/login/google/callback`
    },
    (token, tokenSecret, profile, done) => {
        var id = profile.id
        var name = profile.displayName;
        var email = profile.emails[0].value
        var photo = profile.photos[0].value
        var role = "student"
        var created = new Date().toLocaleDateString();
        if(email.includes('@student.tdtu.edu.vn')){
            
            
            // console.log(profile)
            User.findOne({ idGoogle: id })
            .then(user => {
                if(user){
                    return done(null, user);
                }
                else{
                    new User({
                        idGoogle:id,
                        name: name,
                        email: email,
                        image: photo,
                        role: role,
                        faculty: filterFaculty(email),
                        created: created
                    }).save()
                    .then(user => {
                        return done(null, user)
                    })
                    .catch( e => {
                        return done(null, false)
                    })
                }
            });
            
        }
        else{
            return done(null, false,{message: "Email không được hỗ trợ cho hệ thống này"})
        }
        
    }
));

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        // console.log("AAAAA");
        // console(username, password)
        if(!username){
            return done(null, false,{message:'Vui lòng nhập tài khoản'})
        }
        if(!password){
            return done(null, false,{message:'Vui lòng nhập mật khẩu'})

        }
        User.findOne({username: username}, async (err, user) => {
            if(err){return done(err)}
            if(!user){ return done(null, false,{message:'Tài khoản không tồn tại trong hệ thống'})}
            try{
                // console.log(await bcrypt.compare(password,user.password))
                // console.log(user)
                if(await bcrypt.compare(password,user.password)){
                    return done(null, user)
                }
                else{
                    return done(null, false,{message:'Mật khẩu không đúng, vui lòng thử lại'})
                }
            }
            catch(e){
                return done(null, false)
            }
            
        })
    }
))

function filterFaculty(email){
    var startPoint = email.substring(0, 1);
    var startPoint = startPoint.toUpperCase();
    var dict = {
        '0': 'Ngoại ngữ',
        '1': 'Mỹ thuật công nghiệp',
        '2': 'Kế Toán',
        '3': 'Khoa học xã hội và nhân văn',
        '4': 'Điện - Điện tử',
        '5': 'Công nghệ thông tin',
        '6': 'Khoa học ứng dụng',
        '7': 'Quản trị kinh doanh',
        '8': 'Kỹ thuật công trình',
        '9': 'Môi trường và bảo hộ lao động',
        'A': 'Lao động và công đoàn',
        'B': 'Tài chính - Ngân hàng',
        'C': 'Toán - Thống Kê',
        'D': 'Khoa học thể thao',
        'E': 'Luật',
        'H': 'Dược'
    }
    if(!dict.hasOwnProperty(startPoint)){
        return 'Công nghệ thông tin'
    }
    else{
        return dict[startPoint]
    }
}