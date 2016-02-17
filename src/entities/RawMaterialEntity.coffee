FlowingEntity = require './FlowingEntity'

class RawMaterialEntity extends FlowingEntity
  name: 'RawMaterial'

  constructor: ->
    super
    @type = Math.floor(Math.random()*3)
    switch @type
      when 0
        @color = [0, 200, 255, 255]
      when 1
        @color = [0, 125, 255, 255]
      when 2
        @color = [0, 50, 255, 255]

module.exports = RawMaterialEntity