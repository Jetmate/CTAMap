selector = document.getElementById("selector")

socket = io()
socket.emit 'index_ready'

socket.on 'routes', ->
  socket.on 'route', (route) ->
    option = document.createElement("option")
    option.setAttribute("value", route.rt)
    option.innerHTML = "<p>#{route.rtnm}</p>"
    selector.appendChild(option)