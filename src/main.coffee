###
  Color Pond
###

render = require './lib/render'
fps = require('./lib/fps')()
OptionManager = require('./lib/optionManager')
fps_target = 20

[x, y] = require('./lib/optimalResolution')()


stats = document.getElementById('stats')
stats.textContent = "TPS: ?? | FPS: ??"

worker = new Worker('build/process.js');

worker.postMessage ['init', x, y]
render.setSize x, y

canvas = document.getElementById('main')
document.getElementById('start').addEventListener('click', -> worker.postMessage ['start']);
document.getElementById('stop').addEventListener('click', -> worker.postMessage ['stop']);
document.getElementById('toggle_pixel').addEventListener('click', ->
  if canvas.classList.contains('pixeled')
    canvas.classList.remove('pixeled')
  else
    canvas.classList.add('pixeled')
)

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
), 1000

setInterval ( ->
  worker.postMessage ['sendImageData']
), 1000/fps_target