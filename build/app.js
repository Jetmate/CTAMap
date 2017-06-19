(function() {
  var KEY, REQUEST_TIME, app, compression, express, getJSON, getPoints, getRoutes, getVehicles, helmet, http, interval, io, map_key, route, server,
    slice = [].slice;

  helmet = require('helmet');

  compression = require('compression');

  express = require('express');

  http = require('http');

  app = express();

  server = app.listen(process.env.PORT || 3000);

  io = require('socket.io')(server);

  KEY = 'tZWNpjTrjnM5rMh8xLpeM8X95';

  REQUEST_TIME = 30000;

  map_key = 'AIzaSyCEEF6lOjdGNiqMZYrQczJi0JpK7R0iZhs';

  route = void 0;

  interval = void 0;

  app.use(helmet());

  app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    return next();
  });

  app.use(compression());

  app.get('/map.html', function(req, res, next) {
    if (req.query.input_type === 'name') {
      route = req.query.rt;
    } else {
      route = req.query['rt-number'];
    }
    return next();
  });

  app.use(express["static"]('public'));

  getJSON = function() {
    var args, fun, options, type;
    type = arguments[0], options = arguments[1], fun = arguments[2], args = 4 <= arguments.length ? slice.call(arguments, 3) : [];
    if (options == null) {
      options = '';
    }
    return http.get("http://www.ctabustracker.com/bustime/api/v2/" + type + "?key=" + KEY + options + "&format=json", function(res) {
      var bodyChunks;
      bodyChunks = [];
      return res.on('data', function(chunk) {
        return bodyChunks.push(chunk);
      }).on('end', function() {
        return fun.apply(null, [JSON.parse(Buffer.concat(bodyChunks))['bustime-response']].concat(slice.call(args)));
      });
    });
  };

  getRoutes = function(socket) {
    socket.emit('routes');
    return getJSON('getroutes', '', function(body) {
      var i, len, ref, results;
      ref = body.routes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        route = ref[i];
        results.push(getJSON('getvehicles', "&rt=" + route.rt, function(body, route, routes) {
          if (body.error == null) {
            socket.emit('route', route);
          }
          if (route === routes[routes.length - 1]) {
            return socket.emit('end');
          }
        }, route, body.routes));
      }
      return results;
    });
  };

  getPoints = function(socket, route) {
    socket.emit('points');
    return getJSON('getpatterns', "&rt=" + route, function(body) {
      var i, len, point, ref;
      ref = body.ptr[0].pt;
      for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        socket.emit('point', {
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lon)
        });
      }
      return socket.emit('end');
    });
  };

  getVehicles = function(socket, route) {
    socket.emit('vehicles');
    return getJSON('getvehicles', "&rt=" + route, function(body) {
      var i, len, ref, results, vehicle;
      ref = body.vehicle;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        vehicle = ref[i];
        results.push(socket.emit('vehicle', {
          lat: parseFloat(vehicle.lat),
          lng: parseFloat(vehicle.lon)
        }, vehicle.hdg));
      }
      return results;
    });
  };

  io.on('connection', function(socket) {
    socket.on('index_ready', function() {
      return getRoutes(socket);
    });
    socket.on('map_ready', function() {
      getPoints(socket, route);
      getVehicles(socket, route);
      return interval = setInterval(getVehicles, REQUEST_TIME, socket, route);
    });
    return socket.on('disconnect', function() {
      return clearInterval(interval);
    });
  });

}).call(this);
