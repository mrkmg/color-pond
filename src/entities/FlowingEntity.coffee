BaseEntity = require './BaseEntity'

directions = ['right', 'down', 'left', 'up']

class FlowingEntity extends BaseEntity
  name: 'Flowing'
  constructor: -> super

  tick: ->
    if super()
      direction = if Math.random() > .5 then directions[Math.floor(Math.random() * 4)] else @map.flow(@map_index)

      entity = @map.getEntityAtDirection(@map_index, direction)

      if entity and entity.is_moveable
        @map.swapEntities(@map_index, entity.map_index)
      else


      true
    else
      false

module.exports = FlowingEntity