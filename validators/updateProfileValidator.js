const {check} = require('express-validator')

module.exports = [
    check('name').exists().withMessage('Vui lòng nhập tên')
    .notEmpty().withMessage('Tên không được để trống')
]