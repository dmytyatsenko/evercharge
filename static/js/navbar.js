
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
    var mobile = true;
} else {
	fadeNavbar();
}
