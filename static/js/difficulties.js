
$('h2.difficulties').hover(function() {
	var item_id = $(this).attr('id');
	$('div#'+ item_id).toggle();

});


