BaseEntity = require './BaseEntity'

minBrightness = 10
maxBrightness = 20

class EmptyEntity extends BaseEntity
  name: 'Empty'

  constructor: ->
    super()
    @color = [25, 25, 25, 255]

  tick: ->
    colors = @color.concat()
    ind = Math.floor(Math.random() * 3);
    current_color = colors[ind];
    increment = (Math.floor(Math.random() * 3) - 1) * 3
    colors[ind] = Math.min(maxBrightness, Math.max(minBrightness, current_color + increment))
    @setColor(colors[0], colors[1], colors[2], colors[3])
    super()


module.exports = EmptyEntity