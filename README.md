# Hệ thống thông tin sinh viên.
Hệ thống thông báo sinh viên viết bằng NodeJS(Express JS (engine EJS)) và nosql MongoDB.

Có các chức năng sau:
 - Đăng nhập bằng Google Sign-in (sử dụng passport) 
 - Đăng nhập bằng username và password (sử dụng passport, có mã hóa mật khẩu)
 - Admin tạo tài khoản cho Phòng/Khoa, cấp quyền cho Phòng/Khoa viết thông báo.
 - Sinh viên thay đổi thông tin cá nhân.
 - Sinh viên đăng/xóa/sửa bài viết của mình (sử dụng AJAX, không load trang)
 - User có thể comment vào các bài viết
 - Phòng/Khoa có thể đăng, xóa, sửa thông báo (hiển thị real-time) (Dùng socket.io)
 - Hiển thị bài viết dưới dạng timeline và tự load trang (10 bài viết 1 lần)
 - Hiển thị toàn bộ thông báo và coi thông báo theo Phòng/Khoa
 - Coi tất cả bài viết của một user bất kì
