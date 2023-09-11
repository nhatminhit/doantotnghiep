var category = document.getElementById('category');
var xemthem = document.getElementById('xemthem');
var rutgon = document.getElementById('rutgon');

xemthem.addEventListener('click', function() {
    category.style.height = "auto";
    xemthem.style.display = "none";
    rutgon.style.display = "block";
    rutgon.style.margin = "auto";
})

rutgon.addEventListener('click', function() {
    category.style.height = "150px";
    xemthem.style.display = "block";
    rutgon.style.display = "none";
})

