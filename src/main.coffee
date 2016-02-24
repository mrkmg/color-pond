###
  Color Pond
###

fps_target = 20

render = require './lib/render'
fps = require('./lib/fps')()
OptionManager = require('./lib/optionManager')

worker = new Worker('build/process.js');
right_panel = document.getElementById('right_panel')
canvas = document.getElementById('main')
stats = document.getElementById('stats')
flow_selector = document.getElementById('flow')
seed_holder = document.getElementById('seed_holder')
seed = document.getElementById('seed')
options = document.getElementById('options')

seed.value = Math.round(Math.random() * 10000000)


[x, y] = require('./lib/optimalResolution')()

stats.textContent = "TPS: ?? | FPS: ??"
render.setSize x, y

did_init = false

optionManager = new OptionManager((type, variable, value) -> worker.postMessage ['updateVariable', type, variable,
  value])

worker.postMessage ['getVariables']
worker.onmessage = (e) ->
  switch e.data[0]
    when 'imageData'
      fps.tick()
      render.writeImage e.data[1]
    when 'tpm'
      stats.textContent = "TPS: #{Math.round(e.data[1])} | FPS: #{Math.round(fps.getFps())}"
    when 'initialized'
      setInterval ( ->
        worker.postMessage ['sendTPS']
      ), 1000

      setInterval ( ->
        worker.postMessage ['sendImageData']
      ), 1000 / fps_target
      worker.postMessage ['start']
    when 'variables'
      optionManager.setVariables(e.data[1])

canvas.addEventListener 'click', ->
  if right_panel.classList.contains('show')
    right_panel.classList.remove('show')
  else
    right_panel.classList.add('show')
  true

document.getElementById('start').addEventListener 'click', ->
  if did_init
    worker.postMessage ['start']
  else
    worker.postMessage ['init', x, y, seed.value]
    right_panel.classList.remove('show')
    options.style.top = '60px'
    seed_holder.style.display = 'none'

document.getElementById('stop').addEventListener('click', -> worker.postMessage ['stop']);

document.getElementById('toggle_pixel').addEventListener 'click', ->
  if canvas.classList.contains('pixeled')
    canvas.classList.remove('pixeled')
  else
    canvas.classList.add('pixeled')

flow_selector.addEventListener 'change', ->
  worker.postMessage ['setFlowType', this.value]

