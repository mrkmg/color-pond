BaseEntity = require './BaseEntity'

class FlowingEntity extends BaseEntity
  name: 'Flowing'
  constructor: -> super

  tick: ->
    super() and (
      direction = @map.flow(@map_index)

      entity = @map.getEntityAtDirection(@map_index, direction)

      if entity and entity.is_moveable
        @map.swapEntities(@map_index, entity.map_index)

      true
    )

module.exports = FlowingEntity