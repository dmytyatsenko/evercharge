var map;
var emeryville = new google.maps.LatLng(37.825187, -122.289265);

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
    zoom: 13,
    center: emeryville,
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
    name: 'Evercharge Custom Style'
  };

  var marker = new google.maps.Marker({
      position: emeryville,
      map: map,
      title: 'Hello World!'});

  var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

  map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}

google.maps.event.addDomListener(window, 'load', initialize);