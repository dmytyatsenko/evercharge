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