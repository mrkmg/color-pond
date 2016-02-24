BaseEntity = require './BaseEntity'

directions = ['right', 'down', 'left', 'up']

class EdgeEntity extends BaseEntity
  name: 'Edge'
  constructor: ->
    super
    @is_moveable = false
    @color = [50, 50, 50, 255]

module.exports = EdgeEntity