
var fadeNavbar = function() {

	$(window).scroll(
		{
			previousTop: 0
		}, 
		function () {
		var currentTop = $(window).scrollTop();
		if (currentTop > this.previousTop) {
			$(".navbar-fixed-top").fadeOut();

		} else {
			$(".navbar-fixed-top").fadeIn();

		}
		this.previousTop = currentTop;
	});

}


//Checking for mobile to disable navbar fade


if($(window).width() < 480) { 
    // do any 480 width stuff here, or simply do nothing
    var mobile = true;
} else {
	fadeNavbar();
}
