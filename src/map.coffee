chicago = {lat: 41.8781, lng: -87.6298}
map = new google.maps.Map document.getElementById('map'), {
  zoom: 12
  center: chicago
}
iconSize = new google.maps.Size(60, 60)
anchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 2)
icons =
  e:
    url: '/media/arrow_e.png'
    scaledSize: iconSize
    anchor: anchor
  w:
    url: '/media/arrow_w.png'
    scaledSize: iconSize
    anchor: anchor
  n:
    url: '/media/arrow_n.png'
    scaledSize: iconSize
    anchor: anchor
  s:
    url: '/media/arrow_s.png'
    scaledSize: iconSize
    anchor: anchor
  ne:
    url: '/media/arrow_ne.png'
    scaledSize: iconSize
    anchor: anchor
  nw:
    url: '/media/arrow_nw.png'
    scaledSize: iconSize
    anchor: anchor
  se:
    url: '/media/arrow_se.png'
    scaledSize: iconSize
    anchor: anchor
  sw:
    url: '/media/arrow_sw.png'
    scaledSize: iconSize
    anchor: anchor


# mapStyle = new google.maps.StyledMapType [
#   {
#     "elementType": "labels",
#     "stylers": [
#       {
#         "visibility": "off"
#       }
#     ]
#   },
#   {
#     "featureType": "administrative.land_parcel",
#     "stylers": [
#       {
#         "visibility": "off"
#       }
#     ]
#   },
#   {
#     "featureType": "administrative.neighborhood",
#     "stylers": [
#       {
#         "visibility": "off"
#       }
#     ]
#   }
# ]
# map.mapTypes.set('styled_map', mapStyle);
# map.setMapTypeId('styled_map');

# trafficLayer = new google.maps.TrafficLayer()
# trafficLayer.setMap(map)


directionsDisplay = new google.maps.DirectionsRenderer()
directionsDisplay.setMap(map)
# directionsService = new google.maps.DirectionsService()    
# stops = []
vehicles = []

socket = io()
socket.emit('map_ready')

# socket.on 'stops', ->
#   socket.on 'stop', (coords) ->
#     stops.push(new google.maps.Marker {
#       map: map
#       position: coords
#     })

convertDirection = (direction) ->
  switch
    when direction < 23 then 'n'
    when direction < 68 then 'ne'
    when direction < 113 then 'e'
    when direction < 158 then 'se'
    when direction < 203 then 's'
    when direction < 248 then 'sw'
    when direction < 293 then 'w'
    when direction < 338 then 'nw'
    else 'n'

socket.on 'points', ->
  path = []
  first = undefined
  last = undefined
  socket.on 'point', (coords) ->
    path.push coords
    if not first?
      first = coords
    last = coords
  console.log(first, last, )

  socket.on 'end', ->
    if first.lng <= last.lng
      bounds = new google.maps.LatLngBounds(first, last)
    else
      bounds = new google.maps.LatLngBounds(last, first)

    directions =
      routes: [
        legs: [steps: [travel_mode: 'DRIVING', path: path]]
        bounds: bounds
      ]
      request:
        travelMode: 'DRIVING'
    directionsDisplay.setDirections(directions)

socket.on 'vehicles', ->
  for marker in vehicles
    marker.setMap(null)
  vehicles = []
  socket.on 'vehicle', (coords, direction) ->
    vehicles.push(new google.maps.Marker {
      map: map
      position: coords
      icon: icons[convertDirection(direction)]
    })
