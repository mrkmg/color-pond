FlowingEntity = require './FlowingEntity'

class RawMaterialEntity extends FlowingEntity
  name: 'RawMaterial'

  constructor: (@type = Math.floor(Math.random()*3)) ->
    super
    switch @type
      when 0
        @color = [0, 150, 255, 255]
      when 1
        @color = [0, 100, 255, 255]
      when 2
        @color = [0, 50, 255, 255]

module.exports = RawMaterialEntity