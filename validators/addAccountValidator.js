const {check} = require('express-validator')

module.exports = [
    check('name').exists().withMessage('Vui lòng nhập tên Khoa/Phòng ban')
    .notEmpty().withMessage('Tên Khoa/Phòng ban không được để trống'),

    check('username').exists().withMessage('Vui lòng nhập tên đăng nhập')
    .notEmpty().withMessage('Vui lòng nhập tên đăng nhập')
    .custom(value => !/\s/.test(value)).withMessage('Tên đăng nhập không được phép có khoảng trắng'),

    check('pass').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({min:6}).withMessage('Mật khẩu phải có tối thiểu 6 kí tự'),

    check('pass2').exists().withMessage('Vui lòng nhập lại mật khẩu')
    .notEmpty().withMessage('Nhập lại mật khẩu không được để trống')
    .isLength({min:6}).withMessage('Nhập lại mật khẩu phải có tối thiểu 6 kí tự')
    .custom((value, {req}) => {
        if(value !== req.body.pass){
            throw new Error('Mật khẩu không khớp')
        }
        return true
    })
]