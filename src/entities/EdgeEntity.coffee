###
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The EdgeEntity is for the edges of the map
###

BaseEntity = require './BaseEntity'

directions = ['right', 'down', 'left', 'up']

class EdgeEntity extends BaseEntity
  name: 'Edge'
  constructor: ->
    super
    @is_moveable = false
    @color = [50, 50, 50, 255]

module.exports = EdgeEntity