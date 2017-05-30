helmet = require 'helmet'
compression = require 'compression'
express = require 'express'
http = require 'http'

app = express()
server = app.listen process.env.PORT or 3000
io = require('socket.io') server

KEY = 'tZWNpjTrjnM5rMh8xLpeM8X95'
REQUEST_TIME = 30000
map_key = 'AIzaSyCEEF6lOjdGNiqMZYrQczJi0JpK7R0iZhs'
route = undefined
interval = undefined

app.use helmet()
app.use (req, res, next) ->
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
app.use compression()
app.get '/map.html', (req, res, next) ->
  route = req.query.rt
  next()
app.use express.static 'build/public'


getJSON = (type, options, fun, args...) ->
  options ?= ''
  # console.log "http://www.ctabustracker.com/bustime/api/v2/#{type}?key=#{KEY}#{options}&format=json"
  http.get "http://www.ctabustracker.com/bustime/api/v2/#{type}?key=#{KEY}#{options}&format=json", (res) ->
    bodyChunks = []
    res
      .on 'data', (chunk) ->
        bodyChunks.push chunk
      .on 'end', ->
        # console.log(JSON.parse(Buffer.concat(bodyChunks)))
        fun JSON.parse(Buffer.concat(bodyChunks))['bustime-response'], args...

getRoutes = (socket) ->
  socket.emit 'routes'
  getJSON 'getroutes', '', (body) ->
    for route in body.routes
      getJSON 'getvehicles', "&rt=#{route.rt}", (body, route) ->
        if not body.error?
          socket.emit 'route', route
      , route

getPoints = (socket, route) ->
  socket.emit 'points'
  getJSON 'getpatterns', "&rt=#{route}", (body) ->
    for point in body.ptr[0].pt
      socket.emit 'point', {lat: parseFloat(point.lat), lng: parseFloat(point.lon)}
    socket.emit 'end'

# getStops = (socket, route) ->
#   socket.emit 'stops'
#   getJSON 'getdirections', "&rt=#{route}", (body) ->
#     dir = body.directions[0].dir

#     getJSON 'getstops', "&rt=#{route}&dir=#{dir}", (body) ->
      
#       for stop in body.stops
#         socket.emit 'stop', {lat: parseFloat(stop.lat), lng: parseFloat(stop.lon)}
#       socket.emit 'end'

getVehicles = (socket, route) ->
  socket.emit 'vehicles'
  getJSON 'getvehicles', "&rt=#{route}", (body) ->
    for vehicle in body.vehicle
      socket.emit 'vehicle', {lat: parseFloat(vehicle.lat), lng: parseFloat(vehicle.lon)}, vehicle.hdg

io.on 'connection', (socket) ->
  socket.on 'index_ready', ->
    getRoutes(socket)

  socket.on 'map_ready', ->
    getPoints(socket, route)
    getVehicles(socket, route)
    interval = setInterval(getVehicles, REQUEST_TIME, socket, route)
  
  socket.on 'disconnect', ->
    clearInterval(interval)
