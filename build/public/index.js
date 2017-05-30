(function() {
  var selector, socket;

  selector = document.getElementById("selector");

  socket = io();

  socket.emit('index_ready');

  socket.on('routes', function() {
    return socket.on('route', function(route) {
      var option;
      option = document.createElement("option");
      option.setAttribute("value", route.rt);
      option.innerHTML = "<p>" + route.rtnm + "</p>";
      return selector.appendChild(option);
    });
  });

}).call(this);
