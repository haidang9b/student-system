var pageNewFeed = 1;
var pageProfile = 1;
window.onload = () => {

    var socket = io();


    socket.on('notify-publish-form-faculty', handleReceiverNotify)
    
    function handleReceiverNotify(data) {
        var divNotify = $(`<div class="alert alert-success alert-dismissible">
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                        ${data.creator} đã đăng một thông báo: <strong><a href="${data.url}" class='text-success'>${data.title}<a></strong>
                    </div>`)
        $('#message-socket-io').html('')
        $('#message-socket-io').append(divNotify)
    }

    $('#success-notification').fadeTo(0,0)
    // tô màu cho title nào vừa bấm
    var urlCurrent = window.location.href.toString();
    var btnTitleCurrent = document.getElementById('btn-home')
    if(urlCurrent.includes('/account')){
        btnTitleCurrent = document.getElementById('btn-account')
    }
    else if(urlCurrent.includes('/notifications') || urlCurrent.includes('/topic')){
        btnTitleCurrent = document.getElementById('btn-notify')
    }
    else if(urlCurrent.includes('/setting')){
        btnTitleCurrent = document.getElementById('btn-setting')
    }
    btnTitleCurrent.className +=" active";

    $('tbody .btnDeleteNotify').click(e => {
        var id = $(e.target).data('id')
        var title = $(e.target).data('title')
        $(`#title-notify-remove`).html(title)
        $(`#id-notify-remove`).val(id)
        $('#removeNotify').modal('show')
    })

    $('#btn-remove-notify').click(() => {
        var id = $(`#id-notify-remove`).val()
        deleteNotifyByID(id)
    })


    $('tbody .btnDeleteUser').click(e => {
        var id = $(e.target).data('id')
        var name = $(e.target).data('name')
        $('#name-account-remove').html(name)
        $('#id-user-remove').val(id)
        $('#removeAccount').modal('show')
    })
    
    $('#btn-remove-user').click(() => {
        var id = $('#id-user-remove').val()
        DeleteAccountByID(id)
    })

    $('tbody .btnUpdateUser').click(e => {
        var id = $(e.target).data('id')
        var name = $(e.target).data('name')
        var user =  $(e.target).data('user')
        $('#name-account-update').val(name)
        $('#username-account-update').val(user)
        $('#id-update').val(id)
        $('#updateAccount').modal('show')
    })

    $('#btn-edit-user').click(() => {
        var name = $('#name-account-update').val()
        var username = $('#username-account-update').val()
        var id = $('#id-update').val()
        var pass = $('#pass-edit-account').val()
        var pass2 = $('#pass2-edit-account').val()
        if(name.length == 0){
            $('#error-edit').html('Vui lòng nhập tên Khoa/Phòng Ban')
            $('#error-edit').show()
        }
        else if(username.length === 0){
            $('#error-edit').html('Vui lòng nhập tên đăng nhập')
            $('#error-edit').show()
        }
        else if(pass.length === 0){
            $('#error-edit').html('Vui lòng nhập mật khẩu')
            $('#error-edit').show()
        }
        else if(pass.length <6){
            $('#error-edit').html('Mật khẩu phải từ 6 ký tự trở lên')
            $('#error-edit').show()
        }
        else if(pass2.length === 0){
            $('#error-edit').html('Vui lòng nhập lại mật khẩu')
            $('#error-edit').show()
        }
        else if(pass !== pass2){
            $('#error-edit').html('Không khớp mật khẩu')
            $('#error-edit').show()
        }
        else{
            $('#error-edit').hide()
            UpdateAccountByID(id, username, name, pass, pass2)
        }
    })

    async function UpdateAccountByID(id, username, name, pass, pass2) { 
        var data = {
            username: username,
            name: name,
            pass: pass,
            pass2: pass2
        }
        await fetch('/account/'+id, 
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)

        }).then(Response =>{
            if(Response.status == 200){
                Response.json().then(data => {
                    $('#updateAccount').modal('hide')
                    displaySuccess(data.message)
                })
            }
            else{
                Response.json().then(data => {
                    $('#error-edit').html(data.message)
                    $('#error-edit').show()
                })
            }
        })
    }

    async function DeleteAccountByID(id){

        await fetch('/account/'+id,{method: 'DELETE'})
        .then(Response => {
            if(Response.status == 200){
                Response.json().then(data => {
                    var rowDelete = document.getElementById(id)
                    if(data.success === true){
                        rowDelete.remove()
                        displaySuccess(data.message)
                    }
                    if(data.success === false){
                        displayWarning(data.message)
                    }
                    $('#removeAccount').modal('hide')
                })
            }
        })
    }

    
    
    function displaySuccess(message) { 
        $(`#success-notification`).html(message)
        $(`#success-notification`).fadeTo(2000,1)
        setTimeout(() => {
            $(`#success-notification`).fadeTo(2000,0)
        })
    }

    function displayWarning(message) { 
        $(`#warning-notification`).html(message)
        $(`#warning-notification`).fadeTo(2000,1)
        setTimeout(() => {
            $(`#warning-notification`).fadeTo(2000,0)
        })
    }

    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
    $('#btn-upload-avatar').click(() => {
        var file_upload = $(`#avatar-upload`).prop('files')[0];
        if( file_upload === undefined){
            $(`#message-change-avatar`).html(`<div class="alert alert-danger" role="alert">
                    Vui lòng chọn ảnh cần thay đổi
                </div>`)
        }
        else{
            var file_type = file_upload.type
        
            if(file_type.includes('image/')){
                var fd = new FormData();
                fd.append('avatarChange',file_upload);
                $.ajax({
                    url: '/profile/changeAvatar',
                    type: 'POST',
                    data: fd,
                    contentType: false,
                    processData: false,
                    async: true,
                    cache: false,
                    success: (response) => {
                        if(response.status == true ){
                            var imgDiv = $(`<img src="${response.src}" alt="Avatar change"> `)
                            $(`#area-avatar-update`).append(imgDiv)
                            $('#avatar-upload').val('')
                            $(`#message-change-avatar`).html(`<div class="alert alert-success" role="alert">
                                ${response.message}
                            </div>`)
                        }
                        else{
                            $(`#message-change-avatar`).html(`<div class="alert alert-danger" role="alert">
                                ${response.message}
                            </div>`)
                        }
                    }
                })
            }
            else{
                $(`#message-change-avatar`).html(`<div class="alert alert-danger" role="alert">
                File này không hỗ trợ cho ảnh đại diện
                            </div>`)
            }   
        }
        
    })

    $(`#btn-edit-info`).click(() => {
        var name = $(`#name-edit`).val()
        var classID = $(`#class-edit`).val()
        var faculty = $(`#faculty-edit`).val()

        if(name.length === 0){
            $(`#message-edit-info`).html(`<div class="alert alert-danger" role="alert">
            Vui lòng nhập tên
                        </div>`)
        }
        else{
            updateInfoProfile(name, classID, faculty)
        }
    })

    async function updateInfoProfile(name, classID, faculty){
        var data = {
            name: name,
            classID: classID,
            faculty: faculty
        }
        await fetch('/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(Response => {
            if(Response.status === 200){
                Response.json().then(data => {
                    $(`#message-edit-info`).html(`<div class="alert alert-success" role="alert">
                    ${data.message}
                                </div>`)
                })
            }
            else{
                Response.json().then(data => {
                    $(`#message-edit-info`).html(`<div class="alert alert-danger" role="alert">
                            ${data.message}
                                        </div>`)
                })
            }
        })
    }
    
    $('.btnRemovePost').click(e => {
        var id = $(e.target).data('id')
        $('#id-post-remove').val(id)
        $('#removePost').modal('show')
    })

    $('#btn-remove-post').click( () => {
        var id = $('#id-post-remove').val()
        removePostByID(id)
    })

    async function removePostByID(id) { 
        await fetch('/post/'+id,{
            method: 'DELETE'
        } ).then(response => {
            if(response.status === 200){
                response.json().then(data => {
                    if(data.success){
                        displaySuccess("Xóa thành công bài đăng")
                        $(`#`+id).remove()
                        $('#removePost').modal('hide')
                        $(`#message-area-remove-post`).html(``)
                    }
                    else{
                        $(`#message-area-remove-post`).html(`
                        <div class="alert alert-danger" role="alert">
                            ${data.message}
                            </div>
                        `)
                    }
                })
            }
        })
    }

    $(`#btn_upload_image_post`).click(() => {
        var image_upload = $(`#image-post-upload`).prop('files')[0];

        if(image_upload === undefined){
            $('#message-error-index').html(`<div class="alert alert-danger" role="alert">
            Vui lòng chọn ảnh cần thay đổi
        </div>`)
        }
        else{
            var fd = new FormData();
            fd.append('image-upload', image_upload)
            $.ajax({
                url: '/upload/image',
                type: 'POST',
                data: fd,
                contentType: false,
                processData: false,
                async: true,
                caches: false,
                success: (response) => {
                    if( response.status){
                        var divImg = $(`<img src="${response.src}" class='full-width' alt="Ảnh bạn đã đăng">`)
                        $(`#area-image-publish`).html('')
                        $(`#image-publish-url`).val(response.src)
                        $(`#area-image-publish`).append(divImg)
                        $(`#insert-in-publish`).hide()
                        $(`#uploadImageModal`).modal('hide')
                    }
                    else{
                        $('#message-error-index').html(`<div class="alert alert-danger" role="alert">
                            Không thể upload file này
                        </div>`)
                    }
                },
                fail:()=>{
                    $('#message-error-index').html(`<div class="alert alert-danger" role="alert">
                            Không thể upload file này
                        </div>`)
                } 
            })
        }
    })


////////////////////////////
    $(`#btn_upload_image_post_edit`).click(() => {
        var image_upload = $(`#image-post-upload-edit`).prop('files')[0];

        if(image_upload === undefined){
            $('#message-error-edit-post').html(`<div class="alert alert-danger" role="alert">
            Vui lòng chọn ảnh cần thay đổi
        </div>`)
        }
        else{
            var fd = new FormData();
            fd.append('image-upload', image_upload)
            $.ajax({
                url: '/upload/image',
                type: 'POST',
                data: fd,
                contentType: false,
                processData: false,
                async: true,
                caches: false,
                success: (response) => {
                    if( response.status){
                        var divImg = $(`<img src="${response.src}" class='full-width' alt="Ảnh bạn đã đăng">`)
                        $(`#area-image-edit`).html('')
                        $(`#image-edit-post-url`).val(response.src)
                        $(`#area-image-edit`).append(divImg)
                        $(`#uploadImageModalEdit`).modal('hide')
                    }
                    else{
                        $('#message-error-edit-post').html(`<div class="alert alert-danger" role="alert">
                            Không thể upload file này
                        </div>`)
                    }
                },
                fail:()=>{
                    $('#message-error-edit-post').html(`<div class="alert alert-danger" role="alert">
                            Không thể upload file này
                        </div>`)
                } 
            })
        }
    })

    $('#btn_upload').click(() =>{
        var file_upload = $(`#file-upload`).prop('files')[0];
        if( file_upload === undefined){
            $(`#message-change-avatar`).html(`<div class="alert alert-danger" role="alert">
                    Vui lòng chọn ảnh cần thay đổi
                </div>`)
        }
        else{
            var fd = new FormData();
                fd.append('file-upload',file_upload);
                $.ajax({
                    url: '/upload',
                    type: 'POST',
                    data: fd,
                    contentType: false,
                    processData: false,
                    async: true,
                    cache: false,
                    success: (response) => {
                        if(response.status == true ){
                            var divUpload = $(`
                                <input type='hidden' name='fileUpload' class='form-control' value='${response.src}'>
                                <a href="${response.src}" target="_blank">Tệp đã đính kèm</a>
                            `)
                            $(`#message-upload-file`).html('')
                            $(`#message-upload-file`).append(divUpload)
                            $(`#uploadModal`).modal('hide')
                            $('#file-upload').val('')
                        }
                        else{
                            $(`#message-upload-file`).html(`<div class="alert alert-danger" role="alert">
                            Không thể upload file này
                            </div>`)
                            $('#file-upload').val('')
                            $(`#uploadModal`).modal('hide')
                        }
                    },
                    fail: (response) => {
                        if(response.message){
                            $(`#message-upload-file`).html(`<div class="alert alert-danger" role="alert">
                                Không thể upload file này
                            </div>`)
                            $('#file-upload').val('')
                            $(`#uploadModal`).modal('hide')
                        }
                    }
                })
        }
    })


    async function deleteNotifyByID(id){
        if(id){
            await fetch('/notifications/manager/'+id, {method: 'DELETE'})
            .then(Response => {
                if(Response.status === 200){
                    Response.json().then(data => {
                        var rowDelete = document.getElementById(id)
                        if(data.success){
                            rowDelete.remove()
                            displaySuccess(data.message)
                            $(`#removeNotify`).modal('hide')
                        }
                        else{
                            $(`#message-area-removeNotify`).html(`<div class="alert alert-danger" role="alert">
                                ${data.message}
                            </div>`)
                        }
                    })
                }
            })
        }
        else{
            $(`#message-area-removeNotify`).html(`<div class="alert alert-danger" role="alert">
                                Vui lòng cung cấp ID cần xóa
                            </div>`)
        }

    }

    $('#txt-url-youtube').on('keyup', keypressURLYouTube)

    $(`#txt-url-youtube-edit`).on('keyup',keyupEditUrlYoutube)
    function keyupEditUrlYoutube(){
        var urlYouTube = $('#txt-url-youtube-edit').val()
        if(urlYouTube.length == 0){
            // $(`#insert-in-publish`).show()
            $(`#area-video-edit`).html('')
            $(`#youtube-edit-post-url`).val('')
        }
        else{
            
            // $(`#insert-in-publish`).hide()
            var idVideo = getIdVideoYoutubeFormLink(urlYouTube)
            if(idVideo ==''){
            }
            else{
                $(`#youtube-edit-post-url`).val(urlYouTube)
                var divEmbed = $(`<iframe width="560" height="315" height="300" src="https://www.youtube.com/embed/${idVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
                $(`#area-video-edit`).html(divEmbed)
            }
            
        }
    }
    function keypressURLYouTube(){
        var urlYouTube = $('#txt-url-youtube').val()
        if(urlYouTube.length == 0){
            // $(`#insert-in-publish`).show()
            $(`#area-video-publish`).html('')
            $(`#youtube-publish-url`).val('')
        }
        else{
            
            // $(`#insert-in-publish`).hide()
            var idVideo = getIdVideoYoutubeFormLink(urlYouTube)
            if(idVideo ==''){
            }
            else{
                $(`#youtube-publish-url`).val(urlYouTube)
                var divEmbed = $(`<iframe width="560" height="315" height="300" src="https://www.youtube.com/embed/${idVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
                $(`#area-video-publish`).html(divEmbed)
            }
            
        }
    }

    $(`#btn-edit-post`).click(() => {
        var video = $(`#youtube-edit-post-url`).val()
        var image = $(`#image-edit-post-url`).val()
        var content = $(`#content-post-edit`).val()
        var id = $(`#id-edit-post`).val()
        if(content.length == 0){
            $(`#message-error-edit-post`).html(`<div class="alert alert-danger" role="alert">
                    Vui lòng nhập nội dung
                </div>`)
        }
        else{
            updatePost(content, image, video, id)
        }
    })

    async function updatePost(content, image, video, id){
        var data = {
            content,
            image, 
            video
        }
        await fetch(`/post/${id}`, 
        {method:'PUT', headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)})
        .then(Response => {
            if(Response.status == 200){
                Response.json().then(data => {
                    if(data.success){
                        $(`#${data.post._id} .card-body`).html(``)
                        $(`#${data.post._id} .card-body`).append(`<p>${data.post.content}</p>`)

                        if(data.post.video.length > 0){
                            
                            $(`#${data.post._id} .card-body`).append(`
                            <iframe width="600" height="500" src="https://www.youtube.com/embed/${data.post.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
                        }
                        if(data.post.image.length > 0){
                            $(`#${data.post._id} .card-body`).append(`<img src="${data.post.image}" class="full-width" alt="Image" >`)
                        }
                        $(`#id-edit-post`).val('')
                        $(`#image-edit-post-url`).val(``)
                        $(`#youtube-edit-post-url`).val(``)
                        $(`#area-video-edit`).html('')
                        $(`#area-image-edit`).html('')
                        $(`#modalEditPost`).modal('hide')
                    }
                    else{
                        $(`message-error-edit-post`).html(`<div class="alert alert-danger" role="alert">
                        ${data.message}
                    </div>`)
                    }
                })
            }
        })
    }

    $(`#btn-post`).click(()=>{
        var content = $(`#content-post`).val()
        if(content.length == 0){
            $('#message-error-index').html(`<div class="alert alert-danger" role="alert">
            Vui lòng nhập nội dung
        </div>`)
        }
        else{
            var video = $('#youtube-publish-url').val()
            var image = $('#image-publish-url').val()
            publishPost(content, video, image)
        }
    })

    
    function getIdVideoYoutubeFormLink(url){
        if(url.includes('https://youtu.be/')){
            return url.split('https://youtu.be/')[1]
        }
        try{
            var idVideo = url.split('v=')[1]
            var endPoint = idVideo.indexOf('&')
            if(endPoint != -1){
                idVideo = idVideo.substring(0, endPoint)
            }
            return idVideo
        }
        catch{
            return '';
        }
    }

    async function publishPost(content, video, image) {
        var data = {
            content,
            video,
            image
        }  
        await fetch('/post',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(Response => {
            if(Response.status == 200){
                Response.json().then(data => {
                    
                    if(data.success){
                        
                        var avatar1 = '/images/tdt_logo.png'
                        if(data.owner.image !== ""){
                            avatar1 = data.owner.image
                        }

                        var topPost = `<div class="card item-post" id='${data.post._id}'>
                                <div class="card-header creator-item-post">
                                    <div class="d-flex">
                                        <div>
                                            <img src="${avatar1}" width="50" class="rounded-circle">
                                        </div>
                                        <div class="d-inline-grid">
                                            <b><a href="/profile/${data.post.creator}" title="">${data.owner.name}</a></b>
                                            
                                            <div class='d-flex'>
                                                <a href="/posts/detail?id=${data.post._id}" title="">${data.post.created}</a>&nbsp;&nbsp;
                                                <a role='button' class="btnUpdatePost" data-id="${data.post._id}" onclick=clickUpdatePost("${data.post._id}")>Sửa</a>&nbsp;&nbsp;
                                                <a role='button' class="btnRemovePost" data-id="${data.post._id}" onclick=clickBtnRemovePost("${data.post._id}")>Xóa</a>
                                            </div>
                                        </>
                                        
                                    </div>
                                </div>
                                `
                        var bodyPost = `<div class="card-body">
                        <p>${data.post.content}</p>`
                        if(data.post.video.length > 0){
                            bodyPost += `<iframe width="600" height="500" src="https://www.youtube.com/embed/${data.post.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            `
                        }
                        if(data.post.image.length > 0){
                            bodyPost += `<img src="${data.post.image}" class="full-width" alt="Girl in a jacket" >`
                        }
                        
                        var footerPost = `</div>
                            <div class="card-footer cmt-post">
                                <button class="btn btn-light btn-open-comment" data-id='${data.post._id}' onclick=openComment("${data.post._id}")>Bình luận</button>
                            </div>
                        </div>`

                        var divPost = topPost + bodyPost+ footerPost
                        $(`#news-feed-index`).prepend(divPost)
                        $(`#modalPublish`).modal('hide')
                        $(`#modalPublish`).find("input,textarea,select")
                            .val('')
                            .end()
                            .find("input[type=checkbox], input[type=radio]")
                            .prop("checked", "")
                            .end();
                        $(`#message-error-index`).html('')
                        $(`#area-image-publish`).html('')
                        $(`#area-video-publish`).html('')
                        $(`#insert-in-publish`).show()
                        $(`#txt-url-youtube`).show()
                        $(`#message-error-index`).html('')
                        $(`#image-post-upload`).val('')
                    }
                    else{

                        $(`#message-error-index`).html(`
                        <div class="alert alert-danger" role="alert">
                            Đăng bài thất bại
                            </div>`)
                    }
                })
            }
        })
    }
    
    $('#btn-comment-submit').click(() =>{
        var content = $('#txt-content-comment').val()
        var id = $('#btn-comment-submit').data('id')
        if(content.length > 0){
            submitCommentPost(content,id)
        }
    })

    async function submitCommentPost(content, idPost){
        await fetch('/posts/comment', {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }, method: 'POST',
            body: JSON.stringify({content, idPost})
        }).then(Response => {
            if(Response.status == 200){
                Response.json().then(data => {
                    if(data.success){
                        $('#txt-content-comment').val('')
                        var divCmt = `<div class="item-comment d-flex" id="${data.data._id}">
                        <div>
                            <img src="${data.data.creator.image}" width="50" class="rounded-circle">
                        </div>
                        <div class="content-comment">
                            <div>
                                <a href="/profile/${data.data.creator.id}"><b>${data.data.creator.name}</b></a><br>
                                <span class="tag-content-cmt">${data.data.content}</span>
                            </div>
                            <div>
                                <a href="">${data.data.created}</a>
                                <a role="button" class="btn-delete-comment" onclick='deleteComment("${data.data._id}")'>Xóa</a>
                            </div>
                        </div>
                        
                    </div>`
                    $(`#${data.idPost} .area-list-comment`).prepend(divCmt)
                    }
                })
            }
        })
        .catch(() => console.log())
    }
    $(`#btn-remove-comment`).click(() => {
        var id = $(`#id-comment-remove`).val()
        deleteCommentByID(id)
    })

    async function deleteCommentByID(id){
        await fetch(`/posts/comment/${id}`, {method: 'DELETE'}).then(Response => {
            if(Response.status == 200) {
                Response.json().then(data => {
                    if(data.success){
                        $(`#${id}`).remove()
                        $(`#removeComment`).modal('hide')
                        $(`#id-comment-remove`).val('')
                    }
                })
            }
        })
    }
}

var  i = 1
$(window).scroll(function() {
    if($(window).scrollTop() == $('#news-feed-index').height() - $(window).height()) {
            i = i + 1;
    }
});

function loadNewFeed(page){
    $.ajax({
        url: '/post/all/'+page,
        type: 'GET',
        dataType: "json",
        beforeSend: function(xhr){
            $("#news-feed-index").after($(`<div class="loading"> Đang tải dữ liệu....</div>`).fadeIn('slow')).data("loading", true);
        },
        success: function(data) {
            if(data.success == false){
                pageNewFeed = -1
            }
            if(data.posts.length == 0){
                pageNewFeed = -1
            }
            var $results = $("#news-feed-index")
            $(".loading").fadeOut('fast', function() {
                $(this).remove();
            });
            var divPost=``
            for(var i = 0; i < data.posts.length ; i++){  
                if(!$(`#${data.posts[i]._id}`).length){
                    divPost += `<div class="card item-post" id="${data.posts[i]._id}">
                    <div class="card-header creator-item-post">
                        <div class="d-flex">
                            <div>`
                            if(data.posts[i].creator.image.length > 0){
                                divPost += `<img src="${data.posts[i].creator.image}" width="50" class="rounded-circle">`
                            }
                            else{
                                divPost += ` <img src="/images/avatar.jpg" width="50" class="rounded-circle">`
                            }
                        divPost +=`
                            </div>
                            <div class="d-inline-grid">
                                <b><a href="/profile/${data.posts[i].creator._id}" title="">${data.posts[i].creator.name}</a></b>
                                <div class='d-flex'>
                                <a href="/posts/detail?id=${data.posts[i]._id}" title="" >${data.posts[i].created}</a>&nbsp;&nbsp;
                                `
                        if(data.posts[i].creator._id == data.idSend){
                            divPost+=`
                                <a role='button' class="btnUpdatePost" data-id="${data.posts[i]._id}" onclick=clickUpdatePost("${data.posts[i]._id}")>Sửa</a>&nbsp;&nbsp;
                                <a role='button' class="btnRemovePost" data-id="${data.posts[i]._id}" onclick=clickBtnRemovePost("${data.posts[i]._id}")>Xóa</a>`
                        }
                        divPost+=`
                        </div>
                            </div> </div>
                    </div>
                    <div class="card-body">
                        <p>${data.posts[i].content}</p>
                        `
                        if(data.posts[i].video.length > 0){
                            divPost+=`<iframe width="600" height="500" src="https://www.youtube.com/embed/${data.posts[i].video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    
                        }
                        if(data.posts[i].image.length > 0){
                            divPost+=`<img src="${data.posts[i].image}" class="full-width" alt="Image" >`
    
                        }
                        divPost +=`</div>
                        <div class="card-footer cmt-post">
                            <button class="btn btn-light btn-open-comment" onclick=openComment("${data.posts[i]._id}")>Bình luận</button>
                        </div>
                    </div>`
                }     
                
                
            }
            var $data = $(divPost)
            $data.hide();
            $results.append($data);
            
            $data.fadeIn();
            $results.removeData("loading");
        }
    })
    
    
    
}

$(function() {
    loadNewFeed(pageNewFeed);
    $(window).scroll(function() {
        var position = $(window).scrollTop();
        var bottom = $("#news-feed-index").height() - $(window).height();
        var $results = $("#news-feed-index");
        if(position >= bottom && pageNewFeed > 0) {
            if (!$results.data("loading")) {
                pageNewFeed = pageNewFeed+1
                loadNewFeed(pageNewFeed)
            }
        }
    });
})

$(function() {
    loadNewFeedProfile(pageProfile);
    $(window).scroll(function() {
        var position = $(window).scrollTop();
        var bottom = $("#profile-newsfeed").height() - $(window).height();
        var $results = $("#profile-newsfeed");
        if(position >= bottom && pageProfile >0) {
            if (!$results.data("loading")) {
                pageProfile = pageProfile+1
                loadNewFeedProfile(pageProfile)
            }
        }
    });
})


function loadNewFeedProfile(page){
    
    var urlCurrent = window.location.href
    var idUser = urlCurrent.split('/profile/')[1]
    if(idUser == undefined){
        idUser= ''
    }
    else if(idUser.length == 24){
        idUser = idUser
    }
    else if(idUser.length > 24){
        idUser = idUser.substring(0,24)
    }
    else {
        idUser= ''
    }

    if(idUser.length > 0){
        urlSendRequest = '/post/all/profile?page='+page+'&id='+idUser;
    }
    else{
        urlSendRequest = '/post/all/profile?page='+page
    }
    $.ajax({
        url: urlSendRequest,
        type: 'GET',
        dataType: "json",
        beforeSend: function(xhr){
            $("#profile-newsfeed").after($(`<div class="loading"> Đang tải dữ liệu....</div>`).fadeIn('slow')).data("loading", true);
        },
        success: function(data) {
            if(data.success == false){
                pageProfile = -1
            }
            if(data.posts.length == 0){
                pageProfile = -1
            }
            var $resultsProfile = $("#profile-newsfeed")
            $(".loading").fadeOut('fast', function() {
                $(this).remove();
            });
            var divPost=``
            for(var i = 0; i < data.posts.length ; i++){     
                if(!$(`#${data.posts[i]._id}`).length){
                    divPost += `<div class="card item-post" id="${data.posts[i]._id}">
                    <div class="card-header creator-item-post">
                        <div class="d-flex">
                            <div>`
                            if(data.posts[i].creator.image.length > 0){
                                divPost += `<img src="${data.posts[i].creator.image}" width="50" class="rounded-circle">`
                            }
                            else{
                                divPost += ` <img src="/images/avatar.jpg" width="50" class="rounded-circle">`
                            }
                        divPost +=`
                            </div>
                            <div class="d-inline-grid">
                                <b><a href="/profile/${data.posts[i].creator._id}" title="">${data.posts[i].creator.name}</a></b>
                                <div class='d-flex'>
                                <a href="/posts/detail?id=${data.posts[i]._id}" title="" >${data.posts[i].created}</a>&nbsp;&nbsp;
                            `
                        if(data.posts[i].creator._id == data.idSend){
                            divPost+=`
                                <a role='button' class="btnUpdatePost" data-id="${data.posts[i]._id}" onclick=clickUpdatePost("${data.posts[i]._id}")>Sửa</a>&nbsp;&nbsp;
                                <a role='button' class="btnRemovePost" data-id="${data.posts[i]._id}" onclick=clickBtnRemovePost("${data.posts[i]._id}")>Xóa</a>`
                        }
                        divPost+=`</div></div> </div>
                    </div>
                    <div class="card-body">
                        <p>${data.posts[i].content}</p>
                        `
                        if(data.posts[i].video.length > 0){
                            divPost+=`<iframe width="600" height="500" src="https://www.youtube.com/embed/${data.posts[i].video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    
                        }
                        if(data.posts[i].image.length > 0){
                            divPost+=`<img src="${data.posts[i].image}" class="full-width" alt="Image" >`
    
                        }
                        divPost +=`</div>
                        <div class="card-footer cmt-post">
                            <button class="btn btn-light btn-open-comment" onclick=openComment("${data.posts[i]._id}")>Bình luận</button>
                        </div>
                    </div>`
                }  
                
            }
            var $data = $(divPost)
            $data.hide();
            $resultsProfile.append($data);
            
            $data.fadeIn();
            $resultsProfile.removeData("loading");
        }
    })
    
}
function clickBtnRemovePost(id) {  
    $('#id-post-remove').val(id)
    $('#removePost').modal('show')
}

function clickUpdatePost(id){
    loadPostEditByID(id)
}

function openComment(id){
    loadCommentByID(id)
    
}

async function loadCommentByID(id){
    await fetch(`/posts/comment/all/${id}`).then(Response => {
        if(Response.status == 200){
            Response.json().then(data => {
                if(data){
                    if(data.success){
                        var divCmt = `<div class="area-comment">
                        <div>
                                <img src="${data.sender.image}" width="50" class="rounded-circle">
                        </div>
                        <div class="form-group d-90">
                            <input class="input-comment" type="text" class="form-control" placeholder="Viết bình luận..." id="${id}-cmt-input" name="contentComment">
                        </div>
                        <div>
                            <button class="btn btn-info" onclick='clickSubmitComment("${id}")' data-id="${id}">Gửi</button>
                        </div>
                        </div>`
                        divCmt+=`<div class="area-list-comment">`
                        for(var i = data.data.length - 1 ; i >=0;i--){
                            divCmt+=`<div class="item-comment d-flex" id="${data.data[i]._id}">
                            <div>
                                <img src="${data.data[i].creator.image}" width="50" class="rounded-circle">
                            </div>
                            <div class="content-comment">
                                <div>
                                    <a href="/profile/${data.data[i].creator._id}"><b>${data.data[i].creator.name}</b></a><br>
                                    <span>${data.data[i].content}</span>
                                </div>
            
                                <div>
                                    <a href="" role="button">${data.data[i].created}</a>`
                                    if(data.sender._id == data.data[i].creator._id){
                                        divCmt+=`<a role="button" class="btn-delete-comment" onclick='deleteComment("${data.data[i]._id}")'>Xóa</a>`
                                    }
                                    
                                    divCmt+=`</div> </div> </div>`
                        }
                        divCmt+=`</div>`
                        $(`#${id} .cmt-post`).html(divCmt)

                    }
                }
                else
                {

                }
            })
        }
    })
}

async function loadPostEditByID(id) {  
    $(`#id-edit-post`).val(``)
    $(`#image-edit-post-url`).val(``)
    $(`#youtube-edit-post-url`).val(``)
    $(`#content-post-edit`).val(``)
    $('#area-video-edit').html(``)
    $(`#area-image-edit`).html(``)
    await fetch('/post/'+id).then(response => response.json()).then(data=> {
        if(data){
            $(`#id-edit-post`).val(id)
            $(`#image-edit-post-url`).val(data.data.image)
            $(`#youtube-edit-post-url`).val(`https://www.youtube.com/watch?v=${data.data.video}`)
            $(`#content-post-edit`).val(data.data.content)
            
            if(data.data.video.length>0){
                $(`#txt-url-youtube-edit`).val(`https://www.youtube.com/watch?v=${data.data.video}`)
                $('#area-video-edit').html(`<iframe width="560" height="315" height="300" src="https://www.youtube.com/embed/${data.data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
            }   
            if(data.data.image.length>0){
                $(`#area-image-edit`).html(`<img src="${data.data.image}" class="full-width" alt="Image" >`)
            }
            $(`#modalEditPost`).modal('show')
        }
        
    })
}

function deleteComment(id){
    $(`#id-comment-remove`).val(id)
    $(`#removeComment`).modal('show')
}
function clickSubmitComment(id){
    var content = $(`#${id}-cmt-input`).val()
    if(content.length > 0){
        submitCommentPostA(content,id)
    }
}

async function submitCommentPostA(content, idPost){
    await fetch('/posts/comment', {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }, method: 'POST',
        body: JSON.stringify({content, idPost})
    }).then(Response => {
        if(Response.status == 200){
            Response.json().then(data => {
                if(data.success){
                    $('#txt-content-comment').val('')
                    var divCmt = `<div class="item-comment d-flex" id="${data.data._id}">
                    <div>
                        <img src="${data.data.creator.image}" width="50" class="rounded-circle">
                    </div>
                    <div class="content-comment">
                        <div>
                            <a href="/profile/${data.data.creator.id}"><b>${data.data.creator.name}</b></a><br>
                            <span class="tag-content-cmt">${data.data.content}</span>
                        </div>
                        <div>
                            <a href="">${data.data.created}</a>
                            <a role="button" class="btn-delete-comment" onclick='deleteComment("${data.data._id}")'>Xóa</a>
                        </div>
                    </div>
                    
                </div>`
                $(`#${data.idPost} .area-list-comment`).prepend(divCmt)
                $(`#${data.idPost}-cmt-input`).val('')
                }
            })
        }
    })
    .catch(() => console.log())
}