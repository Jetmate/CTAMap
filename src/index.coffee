name_selector = document.getElementById('rt-name')
number_selector = document.getElementById('rt-number')

socket = io()
socket.emit 'index_ready'

names = []
numbers = []
pairs = {}

sortNumbers = (a, b) ->
  return a - b

socket.on 'routes', ->
  socket.on 'route', (route) ->
    names.push(route.rtnm)
    pairs[route.rtnm] = route.rt
    numbers.push(route.rt)
    
  socket.on 'end', ->
    names.sort()
    numbers.sort(sortNumbers)
    for name in names
      name_option = document.createElement('option')
      name_option.setAttribute('value', pairs[name])
      name_option.innerHTML = "<p>#{name}</p>"
      name_selector.appendChild(name_option)
    for number in numbers
      num_option = document.createElement('option')
      num_option.setAttribute('value', number)
      num_option.innerHTML = "<p>#{number}</p>"
      number_selector.appendChild(num_option)