const {check} = require('express-validator')

module.exports = [
    check('title').exists().withMessage('Vui lòng nhập tiêu đề bài viết')
    .notEmpty().withMessage('Tiêu đề bài viết không được để trống'),

    check('content').exists().withMessage('Vui lòng nhập nội dung bài viết')
    .notEmpty().withMessage('Nội dung bài viết không được bỏ trống'),

    check('topic').exists().withMessage('Vui lòng chọn chủ đề')
    .notEmpty().withMessage('Chủ đề bài viết không được để trống')
]