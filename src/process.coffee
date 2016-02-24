Map = require './lib/map'
FPS = require('./lib/fps')


variables = require './lib/variableHolder'

target_tps = 40

map = null
running = false
did_set_seed = false;
map_tick_int = -1;
fps = FPS()


tick = ->
  map.tick()
  fps.tick()
  null

init = (width, height, seed) ->
  Math.random = require('seedrandom').alea(seed)
  map = new Map width, height
  self.postMessage ['initialized']

start = (seed) ->
  running = true
  fps = FPS()
  self.postMessage ['started']
  clearInterval map_tick_int
  map_tick_int = setInterval tick, 1000/target_tps

stop = ->
  running = false
  clearInterval map_tick_int
  self.postMessage ['stopped']

sendImageData = ->
  self.postMessage ['imageData', map.getRender()]

sendTPS = ->
  self.postMessage ['tpm', fps.getFps()]

updateVariable = (type, variable, value) ->
  console.debug "Updating #{type}.#{variable} to #{value}"
  variables[type][variable] = value

getVariables = ->
  self.postMessage ['variables', variables]

setFlowType = (type) ->
  map.setFlowType(type)


self.onmessage = (e) ->
  switch e.data[0]
    when 'init'           then init(e.data[1], e.data[2], e.data[3])
    when 'start'          then start()
    when 'stop'           then stop()
    when 'sendImageData'  then sendImageData()
    when 'sendTPS'        then sendTPS()
    when 'updateVariable' then updateVariable(e.data[1], e.data[2], e.data[3])
    when 'getVariables'   then getVariables()
    when 'setFlowType'    then setFlowType(e.data[1])
    else console.error "Unknown Command #{e.data[0]}"

