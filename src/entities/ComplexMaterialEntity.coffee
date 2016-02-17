FlowingEntity = require './FlowingEntity'

class ComplexMaterialEntity extends FlowingEntity
  name: 'ComplexMaterial'

  constructor: ->
    super
    @type = Math.floor(Math.random()*3)
    @is_moveable = false
    switch @type
      when 0
        @color = [255, 200, 0, 255]
      when 1
        @color = [255, 125, 0, 255]
      when 2
        @color = [255, 50, 0, 255]


module.exports = ComplexMaterialEntity