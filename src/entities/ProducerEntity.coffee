BaseEntity = require './BaseEntity'
EmptyEntity = require './EmptyEntity'

shuffle = (array) ->
  counter = array.length
  # While there are elements in the array
  while counter > 0
# Pick a random index
    index = Math.floor(Math.random() * counter)
    # Decrease counter by 1
    counter--
    # And swap the last element with it
    temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  array

class ProducerEntity extends BaseEntity
  name: 'Producer'

  constructor: ->
    super
    @is_moveable = false
    @color = [0, 255, 0, 255]
    @health = 300
    @wants = Math.floor(Math.random() * 3)
    @makes = Math.floor(Math.random() * 3)

  processSides: ->
    countFriendly = 0
    (
      entity = @map.getEntityAtDirection(@map_index, side)

      if entity
        if entity.name is 'Producer' and entity.wants is @wants
          countFriendly++
          if @health > entity.health + 5
            @health -= 5
            entity.health += 5
        if entity.name is 'RawMaterial' and entity.type is @wants
          @health += 500
          @map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)
        if entity.name is 'Empty' and @health > 600
          newPiece = new ProducerEntity()
          newPiece.wants = @wants
          newPiece.makes = @makes
          @map.assignEntityToIndex(entity.map_index, newPiece, true)
    ) for side in shuffle ['up', 'down', 'left', 'right']
    {
      countFriendly: countFriendly
    }

  tick: ->
    super() and (
      counts = @processSides()
      if counts.countFriendly < 4
        @health--
      if @health <= 0
        @map.assignEntityToIndex(@map_index, new EmptyEntity(), true)

      @setColor(@color[0], @color[1], @color[2], Math.min(255, Math.round((@health / 500)*255)))
    )


module.exports = ProducerEntity