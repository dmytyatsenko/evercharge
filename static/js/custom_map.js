var map;
var emeryville = new google.maps.LatLng(37.825187, -122.289265);
var bolt = new google.maps.LatLng(37.800081, -122.397838);
var bay = new google.maps.LatLng(37.807980, -122.369946)

var emeryString = '<h3>Homebase</h3>'+
                  'Emeryville, CA 94608'
var boltString = '<h3>PIER 9</h3>'+
                  'San Francisco, CA 94111'

var MY_MAPTYPE_ID = 'custom_style';

function initialize() {

  var featureOpts = [
    {
      stylers: [
        { hue: '#14AB58' },
        { visibility: 'simplified' },
        { gamma: 0.5 },
        { weight: 0.5 }
      ]
    },
    {
      elementType: 'labels',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'water',
      stylers: [
        { color: '#3C3D39' }
      ]
    }
  ];

  var mapOptions = {
    zoom: 12,
    center: bay,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
    },
    scrollwheel: false,
    navigationControl: false,
    // mapTypeControl: false,
    // scaleControl: false,
    // draggable: false,
    mapTypeId: MY_MAPTYPE_ID,

  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var styledMapOptions = {
    name: 'EverCharge Custom Style'
  };

  var emeryMarker = new google.maps.Marker({
      position: emeryville,
      map: map,
      title: 'Emeryville Office'});
  
  var emeryWindow = new google.maps.InfoWindow({
      content: emeryString
  });

    var boltMarker = new google.maps.Marker({
      position: bolt,
      map: map,
      title: 'SF Office'});

  var boltWindow = new google.maps.InfoWindow({
      content: boltString
  });

  google.maps.event.addListener(emeryMarker, 'click', function() {
    emeryWindow.open(map,emeryMarker);
  });

  google.maps.event.addListener(boltMarker, 'click', function() {
    boltWindow.open(map,boltMarker);
  });

  var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

  map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}

google.maps.event.addDomListener(window, 'load', initialize);
