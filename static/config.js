var caltr = caltr || {};

caltr.config = {
  stoptime: 30 * 1000, //in ms
  updateRate: 1000,
  icon: new google.maps.MarkerImage('static/caltrico.png',
    new google.maps.Size(25, 25), //sixe
    new google.maps.Point(0,0), // origin
    new google.maps.Point(0, 25) // anchor
  ),
  mapOptions: {
    zoom: 11,
    center: new google.maps.LatLng(37.6008618, -122.168077),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          {visibility: 'on'}
        ]
      },
      {
        featureType: 'transit.line',
        stylers: [
          {visibility: 'on'},  
          {hue: '#000000'},
          {lightness: -100}
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          {visibility: 'simplified'}  
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          {visibility: 'simplified'}  
        ]
      }
    ]
  },


};


