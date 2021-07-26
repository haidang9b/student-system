const {check} = require('express-validator')

module.exports = [
    check('oldpass').exists().withMessage('Vui lòng nhập mật khẩu cũ')
    .notEmpty().withMessage('Mật khẩu cũ không được để trống')
    .isLength({min:6}).withMessage('Mật khẩu phải cũ có tối thiểu 6 kí tự'),


    check('pass').exists().withMessage('Vui lòng nhập mật khẩu mới')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({min:6}).withMessage('Mật khẩu phải mới có tối thiểu 6 kí tự'),

    check('pass2').exists().withMessage('Vui lòng nhập lại mật khẩu mới')
    .notEmpty().withMessage('Nhập lại mật khẩu mới không được để trống')
    .custom((value, {req}) => {
        if(value !== req.body.pass){
            throw new Error('Mật khẩu không khớp')
        }
        return true
    })
]