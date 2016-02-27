###
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Predictable 1d noise maker

  Retrieved from http://www.michaelbromley.co.uk/api/90/simple-1d-noise-in-javascript
###


Simple1DNoise = ->
  MAX_VERTICES = 256
  MAX_VERTICES_MASK = MAX_VERTICES - 1
  amplitude = 1
  scale = .015
  r = []
  i = 0
  while i < MAX_VERTICES
    r.push Math.random()
    ++i

  getVal = (x) ->
    scaledX = x * scale
    xFloor = Math.floor(scaledX)
    t = scaledX - xFloor
    tRemapSmoothstep = t * t * (3 - (2 * t))
    #/ Modulo using &
    xMin = xFloor & MAX_VERTICES_MASK
    xMax = xMin + 1 & MAX_VERTICES_MASK
    y = lerp(r[xMin], r[xMax], tRemapSmoothstep)
    y * amplitude

  ###*
  * Linear interpolation function.
  * @param a The lower integer value
  * @param b The upper integer value
  * @param t The value between the two
  * @returns {number}
  ###

  lerp = (a, b, t) ->
    a * (1 - t) + b * t

  # return the API
  {
    getVal: getVal
    setAmplitude: (newAmplitude) ->
      amplitude = newAmplitude
      return
    setScale: (newScale) ->
      scale = newScale
      return

  }

module.exports = Simple1DNoise