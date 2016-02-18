LivingEntity = require './LivingEntity'
EmptyEntity = require './EmptyEntity'
ComplexMaterialEntity = require './ComplexMaterialEntity'
shuffle = require '../lib/shuffleArray'
variableHolder = require('../lib/variableHolder').ProducerEntity

fixmod = (m, n) -> ((m%n)+n)%n

class ProducerEntity extends LivingEntity
  name: 'Producer'

  constructor: (@wants = Math.floor(Math.random()*3), @makes = fixmod((@wants+(if Math.random() > .5 then 1 else -1)), 3))->
    super
    @is_moveable = false
    @color = [0, 255, 0, 255]
    @health = variableHolder.starting_life
    @max_health = variableHolder.max_life
    @last_ate = 0
    @age = 0

  getSides: ->
    (@map.getEntityAtDirection(@map_index, side) for side in shuffle ['up', 'down', 'left', 'right'])

  eat: (entities) ->
    (
      @last_ate = 0
      @age -= 20
      @health += variableHolder.life_gain_per_food
      @map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)
    ) for entity in entities when @health < @max_health

  transferHealth: (entities) ->
    (
      to_transfer = Math.floor((@health - entity.health) / variableHolder.transfer_divisor)
      if to_transfer > 0
        @health -= to_transfer
        entity.health += to_transfer
    ) for entity in entities

  reproduce: (entities) ->
    (
      @health -= variableHolder.life_loss_to_reproduce
      @map.assignEntityToIndex(entity.map_index, new ProducerEntity(@wants, @makes), true)
    ) for entity in entities when @health >= variableHolder.life_to_reproduce

  died: ->
    @map.assignEntityToIndex(@map_index, new ComplexMaterialEntity(@makes), true)

  tick: ->
    if super()
      @last_ate++
      @age++

      sides = (entity for entity in @getSides() when entity)

      placeable_entities = (entity for entity in sides when entity.name is "Empty")
      friendly_entities = (entity for entity in sides when entity.name is "Producer" and entity.wants is @wants and entity.makes is @makes)
      consumable_entities = (entity for entity in sides when entity.name is "RawMaterial" and entity.type is @wants)

      @transferHealth(friendly_entities)
      if @last_ate > variableHolder.eating_cooldown
        @reproduce(placeable_entities)
      @eat(consumable_entities)

      if friendly_entities.length < 4 and @age > Math.random() * variableHolder.age_death_rate
        @died()
        true
      else
        if friendly_entities.length is 4
#          @health++
          @color[1] = 255
        else
          @color[1] = 128
        true
    else
      false


module.exports = ProducerEntity