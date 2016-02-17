BaseEntity = require './BaseEntity'

class RoamingEntity extends BaseEntity
  name: 'Roaming'

  constructor: ->
    super()
    @is_moveable = false
    @color = [255, 255, 255, 255]

  tick: ->
    direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random()*4)]

    entity = @map.getEntityAtDirection(@map_index, direction);

    if entity and entity.is_moveable
      @map.swapEntities @map_index, entity.map_index



module.exports = RoamingEntity
