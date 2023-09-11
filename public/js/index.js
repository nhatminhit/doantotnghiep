    var buttons = document.getElementsByClassName('tablinks');
    console.log(buttons);
    var contents = document.getElementsByClassName('tabcontent');
    function showContent(id){
        for (var i = 0; i < contents.length; i++) {
            contents[i].style.display = 'none';
        }
        var content = document.getElementById(id);
        content.style.display = 'block';
    }
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(){
            var id = this.getAttribute('data-hienthi');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove("active");
            }
            this.className += " active";
            showContent(id);
        });
    }
    showContent('hienthio');

    var tang = document.getElementById('tang');
    var tang = document.getElementById('nuttang');
    var giam = document.getElementById('nutgiam');
    var soluong = document.getElementsByClassName('soluong');

    tang.addEventListener('click', function() {
        for (i = 0; i < soluong.length; i++) {
            var number = soluong[i].value;
            if (number > 0) {
                number++;
            }
            soluong[i].value = number;
        }
    });
    giam.addEventListener('click', function() {
        for (i = 0; i < soluong.length; i++) {
            var number = soluong[i].value;
            if (number <= 0) {
                number = 0;
            }
            else {
                number--;
            }
            soluong[i].value = number;
        }
    })

//     var sohopgh = document.getElementsByClassName('hopgh').length;
//     if (sohopgh > 0) {
//         document.getElementsByClassName('sltronggh')[0].innerHTML= sohopgh;
//         document.getElementsByClassName('sl')[0].innerHTML = sohopgh;
//     }
//     else {
//         document.getElementsByClassName('sltronggh')[0].innerHTML= 0;
//         document.getElementsByClassName('sl')[0].innerHTML = 0;
//     }

//      var tennguoidung = document.getElementsByClassName('tentaikhoan');
//      var thongtinnd = document.getElementsByClassName('hoptaikhoanuser');
//      tennguoidung[0].addEventListener("click", function(e) {
//      thongtinnd[0].classList.toggle('hienthitkuser');
//      e.preventDefault();
//      });
//      //Hiển thị thanh menu khi cuộn
//      var menu = document.querySelector('.thanhmenu');
//      window.addEventListener('scroll', function() {
//          if (this.window.pageYOffset > 150) {
//              menu.classList.add('hienthimenu');
//          }
//          else {
//              menu.classList.remove('hienthimenu');
//          }
//      })

//     var tabtieude = document.getElementsByClassName('tab_mota');
//     var tabthongtin = document.getElementsByClassName('tabnoidung');
//     function shownoidung(id){
//         for (var i = 0; i < tabthongtin.length; i++) {
//             tabthongtin[i].style.display = 'none';
//         }
//         var noidung = document.getElementById(id);
//         noidung.style.display = 'block';
//     }
//     for (var i = 0; i < tabtieude.length; i++) {
//         tabtieude[i].addEventListener("click", function(){
//             var id = this.getAttribute('data-chitiet');
//             for (var i = 0; i < tabtieude.length; i++) {
//                 tabtieude[i].classList.remove("hienthi_mota");
//             }
//             this.className += " hienthi_mota";
//             shownoidung(id);
//         });
//     }
//     shownoidung('mota');
//     // Tạo menu
//     var tenmenu = document.querySelectorAll('ul.tenmenu li a')
//     console.log(tenmenu);
//     for (var i = 0; i < tenmenu.length; i++) {
//         tenmenu[i].addEventListener("click", function(e) {
//             for (var j = 0; j < tenmenu.length; j++) {
//                 tenmenu[j].classList.remove('active');
//             }
//             this.classList.add('active');
//             e.preventDefault();
//         })
//     }

// //    Tạo ngày sinh
//    //Hiển thị hộp tài khoản
//    var ngay = document.getElementById('ngay');
//    for (var i = 1; i <= 31; i++) {
//        ngay.innerHTML += '<option value="' + i + '">' + i + '</option>';
//    }
//    var thang = document.getElementById('thang');
//    for (var i = 1; i <= 12; i++) {
//        thang.innerHTML += '<option value="' + i + '"> Tháng ' + i + '</option>';
//    }
//    var nam = document.getElementById('nam');
//    for (var i = 1970; i <= 2022; i++) {
//        nam.innerHTML += '<option value="' + i + '">' + i + '</option>';
//    }
