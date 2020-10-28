"use strict";

window.addEventListener('scroll', (e) => {
    const el = document.getElementById('header');
    if (el) {
        if (window.pageYOffset > 200) {
            el.classList.add('_visible');
        } else {
            el.classList.remove('_visible');
        }
    }
})

$(document).ready(function () {
    $('.header__burger').click(function (e) {
        $('.header__burger,.nav').toggleClass('active');
    });


    $(document).bind('mousemove', function (e) {
        var $img = $('.homepage__photo');
        var offset = $img.offset();
        var width = $img.width();
        var height = $img.height();

        let shiftx = mapclamp(e.pageX - offset.left - width / 2,
            -offset.left, offset.left, -4, 6);
        let shifty = mapclamp(e.pageY - offset.top - height / 2,
            -offset.top, offset.top, -3, 3);

        $img.css("transform", `translate(${shiftx}px, ${shifty}px)`);
    });
});


// $(document).ready(function () {
//     // Add smooth scrolling to all links
//     $(".nav__item a").on('click', function (event) {

//         // Make sure this.hash has a value before overriding default behavior
//         if (this.hash !== "") {
//             // Prevent default anchor click behavior
//             event.preventDefault();

//             // Store hash
//             var hash = this.hash;
//             console.log(hash);

//             // Using jQuery's animate() method to add smooth page scroll
//             // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
//             $('html, body').animate({
//                 scrollTop: $(hash).offset().top
//             }, 800, function () {

//                 // Add hash (#) to URL when done scrolling (default click behavior)
//                 window.location.hash = hash;
//             });
//         } // End if
//     });
// });

const animItems = document.querySelectorAll('._anim-items');

if (animItems.length > 0) {

    function animOnScroll(params) {
        for (let index = 0; index < animItems.length; ++index) {
            const animItem = animItems[index];
            const animItemHeight = animItem.offsetHeight;
            const animItemOffset = offset(animItem).top;
            const animStart = 4;

            let animItemPoint = window.innerHeight - animItemHeight / animStart;
            if (animItemHeight > window.innerHeight) {
                animItemPoint = window.innerHeight - window.innerHeight / animStart;
            }

            if ((pageYOffset > animItemOffset - animItemPoint) && pageYOffset < (animItemOffset + animItemHeight)) {
                animItem.classList.add('_active');
            } else {
                if (!animItem.classList.contains('_anim-item-no-hide')) {
                    animItem.classList.remove('_active');
                }
            }
        }
    }

    function offset(el) {
        const rect = el.getBoundingClientRect(),
            scrollLeft = window.pageYOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }

    setTimeout(() => { animOnScroll(); }, 300);

    window.addEventListener('scroll', () => { animOnScroll(); });

}