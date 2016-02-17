Map = require './lib/map'
fps = require('./lib/fps')()

map = null
running = false
map_tick_int = -1;

tick = ->
  map.tick()
  fps.tick()

init = (width, height) ->
  map = new Map width, height
  self.postMessage ['initialized']

start = ->
  running = true
  self.postMessage ['started']
  clearInterval map_tick_int
  map_tick_int = setInterval tick, 25

stop = ->
  running = false
  clearInterval map_tick_int
  self.postMessage ['stopped']

sendImageData = ->
  self.postMessage ['imageData', map.getRender()]

sendTPS = ->
  self.postMessage ['tpm', fps.getFps()]

self.onmessage = (e) ->
  switch e.data[0]
    when 'init'           then init(e.data[1], e.data[2])
    when 'start'          then start()
    when 'stop'           then stop()
    when 'sendImageData'  then sendImageData()
    when 'sendTPS'        then sendTPS()
    else console.error "Unknown Command #{e.data[0]}"

