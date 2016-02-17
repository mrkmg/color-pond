LivingEntity = require './LivingEntity'
EmptyEntity = require './EmptyEntity'
ComplexMaterialEntity = require './ComplexMaterialEntity'
shuffle = require '../lib/shuffleArray'

life_gain_per_food = 200
life_to_reproduce = 500

class ProducerEntity extends LivingEntity
  name: 'Producer'

  constructor: (@wants = false, @makes = false)->
    super
    @is_moveable = false
    @color = [0, 255, 0, 255]
    @health = 400
    @max_health = 800
    if @wants == false
      @wants = Math.floor(Math.random() * 3)
    if @makes == false
      @makes = Math.floor(Math.random() * 3)

  transferHealth: (target_entity) ->
    if @health > target_entity.health
      to_transfer = Math.floor((@health - target_entity.health) / 2)
      @health -= to_transfer
      target_entity.health += to_transfer

  processSides: ->
    countFriendly = 0
    (
      entity = @map.getEntityAtDirection(@map_index, side)

      if entity
        if entity.name is 'Producer' and entity.wants is @wants
          countFriendly++
          @transferHealth(entity)
        if entity.name is 'RawMaterial' and entity.type is @wants and @health + life_gain_per_food < @max_health
          @health += life_gain_per_food
          @map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)
        if entity.name is 'Empty' and @health > life_to_reproduce and Math.random() > .8
          @map.assignEntityToIndex(entity.map_index, new ProducerEntity(@wants, @makes), true)
    ) for side in shuffle ['up', 'down', 'left', 'right']
    {
      friendly: countFriendly
    }

  died: ->
    @map.assignEntityToIndex(@map_index, new ComplexMaterialEntity(@makes), true)

  tick: ->
    super() and (
      counts = @processSides()
      if counts.friendly is 4
        @health++
    )


module.exports = ProducerEntity