$(document).ready(function(){
    $("#linknhap").click(function(e) {
        $("#onhapma").slideToggle();
        e.preventDefault();
    })
    $("#linkvc").click(function(e) {
        console.log("Nhập thành công");
        $("#chonvc").slideToggle();
        e.preventDefault();
        
    })
    $("#name").click(function(e) {
        console.log("Nhập thành công");
        $("#oname").slideToggle();
        e.preventDefault();
    })
    $("#email").click(function(e) {
        console.log("Nhập thành công");
        $("#oemail").slideToggle();
        e.preventDefault();
    })
    $("#sdt").click(function(e) {
        console.log("Nhập thành công");
        $("#osdt").slideToggle();
        e.preventDefault();
    })
    $("#birthday").click(function(e) {
        console.log("Nhập thành công");
        $("#obirthday").slideToggle();
        e.preventDefault();
    })
    $("#gender").click(function(e) {
        console.log("Nhập thành công");
        $("#ogender").slideToggle();
        e.preventDefault();
    })
    $("#diachi").click(function(e) {
        console.log("Nhập thành công");
        $("#odiachi").slideToggle();
        e.preventDefault();
    })
    $(".hopgiohang").click(function(e){
        console.log("Nhập thành công");
        $(".chitiethopgh").slideToggle();
        e.preventDefault();
    })
    $(".cart-plus-minus").append('<div class="dec qtybutton"><i class="fa fa-angle-down"></i></div><div class="inc qtybutton"><i class="fa fa-angle-up"></i></div>');
    $(".qtybutton").on("click", function() {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.hasClass('inc')) {
       var newVal = parseFloat(oldValue) + 1;
    } else {
        // Don't allow decrementing below zero
       if (oldValue > 1) {
         var newVal = parseFloat(oldValue) - 1;
         } else {
         newVal = 1;
       }
       }
    $button.parent().find("input").val(newVal);
   });
})