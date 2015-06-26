$(window).scroll(
    {
        previousTop: 0
    }, 
    function () {
    var currentTop = $(window).scrollTop();
    if (currentTop < this.previousTop) {
        $(".navbar-fixed-top").fadeIn();

    } else {
        $(".navbar-fixed-top").fadeOut();


    }
    this.previousTop = currentTop;
});