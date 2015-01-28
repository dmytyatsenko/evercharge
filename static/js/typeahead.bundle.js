$(document).ready(function () {


function initialize() {

        var input = document.getElementById('label4');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            console.log(place);
            var userLat = place.geometry.location.k;
            var userLon = place.geometry.location.D;
            var address = place.formatted_address;


            console.log(userLat);
            console.log(userLon);
            console.log(typeof address);


            // address = address + '';
            // userLocation = userLocation + '';
            // $.ajax({
            //     type: "GET",
            //     url: location,
            //     data: JSON.stringify(address),
            //     dataType: 'json',
            //     contentType: 'application/json; charset=utf-8'
            // }).done(function(msg) {
            //     alert("Data Saved:" + msg);
            //     console.log(msg);
            // });


            return address;
            // debugger;
            // console.log(userLocation)
            // document.getElementById('cityLat').value = place.geometry.location.lat();
            // document.getElementById('cityLng').value = place.geometry.location.lng();
            // alert("This function is working!");
            // alert(place.name);
       

        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    // this allows google autocomplete to display

    $(".typeahead").typeahead({
        minLength: 2,
        highlight: true,
    },
    {
        source: initialize,
        displayKey: 'description',
    });

});


