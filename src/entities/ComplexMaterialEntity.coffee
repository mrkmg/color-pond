FlowingEntity = require './FlowingEntity'

class ComplexMaterialEntity extends FlowingEntity
  name: 'ComplexMaterial'

  constructor: (@type = Math.floor(Math.random()*3))->
    super
    @is_moveable = false
    switch @type
      when 0
        @color = [255, 150, 0, 255]
      when 1
        @color = [255, 100, 0, 255]
      when 2
        @color = [255, 50, 0, 255]


module.exports = ComplexMaterialEntity