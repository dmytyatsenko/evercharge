var teslaOptions = document.getElementById('tesla_listener');
teslaOptions.addEventListener('click', teslaCheck);


function teslaCheck() {
    if (document.getElementById('teslaradio_control').checked) {
        document.getElementById('tesla_div').style.display = 'block';
    }
    else document.getElementById('tesla_div').style.display = 'none';


};



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




