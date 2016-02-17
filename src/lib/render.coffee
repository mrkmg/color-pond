canvas = document.getElementById 'main'
canvas.style.backgroundColor = 'rgba(0, 0, 0, 255)'

#if window.innerHeight > window.innerWidth
#  canvas.setAttribute('width', window.innerWidth)
#  canvas.setAttribute('height', window.innerWidth)
#  canvas.style.height = "#{window.innerWidth}px"
#  canvas.style.width = "#{window.innerWidth}px"
#  canvas.style.marginLeft = 0;
#  canvas.style.marginTop = "#{(window.innerHeight - window.innerWidth)/2}px"
#else
#  canvas.setAttribute('width', window.innerHeight)
#  canvas.setAttribute('height', window.innerHeight)
#  canvas.style.height = "#{window.innerHeight}px"
#  canvas.style.width = "#{window.innerHeight}px"
#  canvas.style.marginTop = 0
#  canvas.style.marginLeft = "#{(window.innerWidth - window.innerHeight)/2}px"

context = canvas.getContext '2d'
context.imageSmoothingEnabled = false;
image_data = context.createImageData(1, 1)

module.exports.setSize = (x, y) ->
  context.canvas.width = x
  context.canvas.height = y
  image_data = context.createImageData x, y

module.exports.writeImage = (data) ->
  image_data.data[i]=v for v, i in data
  context.putImageData(image_data, 0, 0)
