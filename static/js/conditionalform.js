
var deliveryOptions = document.getElementById('delivery_listener');
deliveryOptions.addEventListener('click', deliveryCheck);


function deliveryCheck() {
    if (document.getElementById('knowdelivery').checked) {
        document.getElementById('delivery_date_div').style.display = 'block';
    }
    else document.getElementById('delivery_date_div').style.display = 'none';



};

var parkingOptions = document.getElementById('parking_listener');
parkingOptions.addEventListener('click', parkingCheck);


function parkingCheck() {
    if (document.getElementById('assignedparking').checked) {
        document.getElementById('parking_spot_div').style.display = 'block';
    }
    else document.getElementById('parking_spot_div').style.display = 'none';


};


var teslaOptions = document.getElementById('tesla_listener');
teslaOptions.addEventListener('click', teslaCheck);


function teslaCheck() {
    if (document.getElementById('teslaradio_control').checked) {
        document.getElementById('tesla_div').style.display = 'block';
    }
    else document.getElementById('tesla_div').style.display = 'none';


};





// deliveryCheck



// function changeIt() {

// 	var g = document.getElementById('knowdelivery');
// 	if (g.style.display=='none') {
// 		g.style.display='block';
// 	} else {
// 		g.style.display='none';
// 	}
// }


// $("#generalAdmissionList").change(function () {
// var selected = $("#generalAdmissionList option:selected").form();
// $('div').hide();
// $('#' + selected).show();
// });

// $(document).ready(function (e) {
// $('div').hide();
// });