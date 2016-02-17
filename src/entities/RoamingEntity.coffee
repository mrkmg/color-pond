LivingEntity = require './LivingEntity'
EmptyEntity = require './EmptyEntity'
shuffle = require '../lib/shuffleArray'

search_radius = 10

class RoamingEntity extends LivingEntity
  name: 'Roaming'

  constructor: (@wants = false)->
    super()
    @max_health = 400
    @is_moveable = false
    if @wants == false
      @wants = Math.floor(Math.random() * 3)
    @health = 300
    @color = [255, 255, 255, 255]

  consumeMaterial: ->
    (
      entity = @map.getEntityAtDirection(@map_index, side)

      if entity
        if entity.name is 'ComplexMaterial' and entity.type is @wants
          @map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)
          @health += 50
    ) for side in shuffle ['up', 'down', 'left', 'right']

  doMovement: ->
    self = @

    x_neg = Math.max(@map_x - search_radius, 0)
    y_neg = Math.max(@map_y - search_radius, 0)
    x_pos = Math.min(@map_x + search_radius, @map.width)
    y_pos = Math.min(@map_y + search_radius, @map.height)

    all_entities = []

    for y in [y_neg .. y_pos]
      all_entities = all_entities.concat(self.map.getEntitiesInRange(self.map._pointToIndex(x_neg, y), self.map._pointToIndex(x_pos, y)))

    filtered_entities = all_entities.filter (entity) ->
      entity.name is 'ComplexMaterial' and entity.type is self.wants

    filtered_entities.sort (ent_a, ent_b) ->
      a_distance = Math.sqrt(Math.pow(ent_a.map_x - self.map_x, 2) + Math.pow(ent_a.map_y - self.map_y, 2))
      b_distance = Math.sqrt(Math.pow(ent_b.map_x - self.map_x, 2) + Math.pow(ent_b.map_y - self.map_y, 2))

      if a_distance < b_distance then -1
      else if a_distance > b_distance then 1
      else 0

    direction = (
      if filtered_entities.length
        target_entity = filtered_entities[0]
        dx = target_entity.map_x - self.map_x
        dy = target_entity.map_y - self.map_y

        if Math.abs(dx) > Math.abs(dy)
          if dx > 0 then 'right' else 'left'
        else
          if dy > 0 then 'down' else 'up'
      else
        ['up', 'down', 'left', 'right'][Math.floor(Math.random()*4)]
    )

    entity = @map.getEntityAtDirection(@map_index, direction);

    if entity and entity.is_moveable
      @map.swapEntities @map_index, entity.map_index

  reproduce: ->
    if @health > 400
      (
        entity = @map.getEntityAtDirection(@map_index, side)

        if entity and entity.name is 'Empty'
            @map.assignEntityToIndex(entity.map_index, new RoamingEntity(@wants), true)
            @health -= 200
            break
      ) for side in shuffle ['up', 'down', 'left', 'right']
    true

  tick: ->
    super() and (
      @consumeMaterial()
      @doMovement()
      @reproduce()
    )




module.exports = RoamingEntity
