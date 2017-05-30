(function() {
  var anchor, chicago, convertDirection, directionsDisplay, iconSize, icons, map, socket, vehicles;

  chicago = {
    lat: 41.8781,
    lng: -87.6298
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: chicago
  });

  iconSize = new google.maps.Size(60, 60);

  anchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 2);

  icons = {
    e: {
      url: '/media/arrow_e.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    w: {
      url: '/media/arrow_w.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    n: {
      url: '/media/arrow_n.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    s: {
      url: '/media/arrow_s.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    ne: {
      url: '/media/arrow_ne.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    nw: {
      url: '/media/arrow_nw.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    se: {
      url: '/media/arrow_se.png',
      scaledSize: iconSize,
      anchor: anchor
    },
    sw: {
      url: '/media/arrow_sw.png',
      scaledSize: iconSize,
      anchor: anchor
    }
  };

  directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);

  vehicles = [];

  socket = io();

  socket.emit('map_ready');

  convertDirection = function(direction) {
    switch (false) {
      case !(direction < 23):
        return 'n';
      case !(direction < 68):
        return 'ne';
      case !(direction < 113):
        return 'e';
      case !(direction < 158):
        return 'se';
      case !(direction < 203):
        return 's';
      case !(direction < 248):
        return 'sw';
      case !(direction < 293):
        return 'w';
      case !(direction < 338):
        return 'nw';
      default:
        return 'n';
    }
  };

  socket.on('points', function() {
    var first, last, path;
    path = [];
    first = void 0;
    last = void 0;
    socket.on('point', function(coords) {
      path.push(coords);
      if (first == null) {
        first = coords;
      }
      return last = coords;
    });
    console.log(first, last);
    return socket.on('end', function() {
      var bounds, directions;
      if (first.lng <= last.lng) {
        bounds = new google.maps.LatLngBounds(first, last);
      } else {
        bounds = new google.maps.LatLngBounds(last, first);
      }
      directions = {
        routes: [
          {
            legs: [
              {
                steps: [
                  {
                    travel_mode: 'DRIVING',
                    path: path
                  }
                ]
              }
            ],
            bounds: bounds
          }
        ],
        request: {
          travelMode: 'DRIVING'
        }
      };
      return directionsDisplay.setDirections(directions);
    });
  });

  socket.on('vehicles', function() {
    var i, len, marker;
    for (i = 0, len = vehicles.length; i < len; i++) {
      marker = vehicles[i];
      marker.setMap(null);
    }
    vehicles = [];
    return socket.on('vehicle', function(coords, direction) {
      return vehicles.push(new google.maps.Marker({
        map: map,
        position: coords,
        icon: icons[convertDirection(direction)]
      }));
    });
  });

}).call(this);
