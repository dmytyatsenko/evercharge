$(document).ready(function() {
	var offset = 425;
	var duration = 300;
	var quoteForm = $('#quote');
	var scrollButton = $('.scroll-down');

	$(window).scroll(function() {
		if ($(this).scrollTop() > offset) {
			if (quoteForm.offset().top - offset < $(this).scrollTop()) { scrollButton.fadeOut(duration)}
			else {scrollButton.fadeIn(duration);}
		} else {
			scrollButton.fadeOut(duration);
		}
	});

	scrollButton.click(function(event) {
		event.preventDefault();
		$('html, body').animate({scrollTop: quoteForm.offset().top}, duration);
		return false;
	})
});