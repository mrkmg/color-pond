###
  Color Pond
###

render = require './lib/render'
fps = require('./lib/fps')()
OptionManager = require('./lib/optionManager')

[x, y] = require('./lib/optimalResolution')()

console.log x, y

fps_target = 20

stats = document.getElementById('stats')
stats.textContent = "TPS: ?? | FPS: ??"

worker = new Worker('build/process.js');

worker.postMessage ['init', x, y]
render.setSize x, y

optionManager = new OptionManager((type, variable, value) -> worker.postMessage ['updateVariable', type, variable, value])



worker.onmessage = (e) ->
  switch e.data[0]
    when 'imageData'
      fps.tick()
      render.writeImage e.data[1]
    when 'tpm'
      stats.textContent = "TPS: #{Math.round(e.data[1])} | FPS: #{Math.round(fps.getFps())}"
    when 'initialized'
      worker.postMessage ['start']
      worker.postMessage ['getVariables']
    when 'variables'
      optionManager.setVariables(e.data[1])

setInterval ( ->
  worker.postMessage ['sendTPS']
), 5000

setInterval ( ->
  worker.postMessage ['sendImageData']
), 1000/fps_target