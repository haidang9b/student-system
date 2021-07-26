const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        return next();
    }
    return res.redirect('/')
}

module.exports = adminOnly;