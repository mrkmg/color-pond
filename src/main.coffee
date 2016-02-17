###
  Color Pond
###

render = require './lib/render'
fps = require('./lib/fps')()

x = 250
y = 250

fps_target = 20

worker = new Worker('build/process.js');

worker.postMessage ['init', x, y]
render.setSize x, y

worker.onmessage = (e) ->
  switch e.data[0]
    when 'imageData'
      fps.tick()
      render.writeImage e.data[1]
    when 'tpm'
      console.log "TPS: #{e.data[1]} | FPS: #{fps.getFps()}"
    when 'initialized'
      worker.postMessage ['start']

setInterval ( ->
  worker.postMessage ['sendTPS']
), 5000

setInterval ( ->
  worker.postMessage ['sendImageData']
), 1000/fps_target