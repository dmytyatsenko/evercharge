$(document).ready(function() {

	$('.hideme').each(function(i) {
		var bottom_of_object = $(this).offset().top + $(this).outerHeight();
		var bottom_of_window = $(window).scrollTop() + $(window).height();

		if (bottom_of_window > bottom_of_object) {
			$(this).animate({'opacity' : '1'}, 500);
		}

	});
	
	$(window).scroll( function(){
	
		$('.hideme').each( function(i){
			
			var bottom_of_object = $(this).offset().top + $(this).outerHeight();
			var bottom_of_window = $(window).scrollTop() + $(window).height();
			
			if( bottom_of_window > bottom_of_object ){
				
				$(this).animate({'opacity':'1'},500);
					
			}
			
		}); 
		$('#scaling_cars img').each(function(i) {
			var bottom_of_car = $(this).offset().top + $(this).outerHeight();
			var bottom_of_window = $(window).scrollTop() + $(window).height();


			if (bottom_of_window > bottom_of_car) {
				$(this).delay((i++) * 500).fadeTo(1000,1); 
			}
			
		})
	});
	
});
	



// fade in charging ca
// $(function() {
// $('#fds img').each(function(i) {
// $(this).delay((i++) * 500).fadeTo(1000, 1); })
// });





