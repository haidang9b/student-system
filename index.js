const express = require('express')
const app = express()
const path = require('path')
const passport = require('passport')
const cookieSession = require('cookie-session')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const server  = require('http').createServer(app);
const io = require('socket.io')(server);

require('dotenv').config()
const indexRouter = require('./routes/index')
const accountRouter = require('./routes/account')
const loginRouter = require('./routes/login')
const notiRouter = require('./routes/notifications')
const settingRouter = require('./routes/setting')
const profileRouter = require('./routes/profile')
const uploadRouter = require('./routes/upload')
const postRouter = require('./routes/post')
require('dotenv').config()
app.set('view engine','ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.use(session(
    {
        resave: false,
        saveUninitialized: true,
        secret: '1564571safhbr',
        cookie: {
            maxAge: 1000*60*60
        }
    }
))
app.set('socketio', io);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter)
app.use('/account',accountRouter)
app.use('/login', loginRouter)
app.use('/notifications',notiRouter)
app.use('/setting', settingRouter)
app.use('/profile', profileRouter)
app.use('/upload',uploadRouter)
app.use('/post',postRouter)

app.use( (req, res, next)=> {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error',{layout: false});
});

var connectString = `${process.env.CONNECTION_STRING}`
mongoose.connect(connectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    var port = process.env.PORT || 8080
    server.listen(port, () => console.log('http://localhost:'+port))
})
.catch(e => console.log('Không thể kết nối tới DB',e.message))
