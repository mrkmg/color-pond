EmptyEntity = require '../entities/EmptyEntity'
RoamingEntity = require '../entities/RoamingEntity'
RawMaterialEntity = require '../entities/RawMaterialEntity'
ComplexMaterialEntity = require '../entities/ComplexMaterialEntity'
ProducerEntity = require '../entities/ProducerEntity'
flow = require './flow'

class Map
  # Privates
  _map: []

  _tick: 0

  _pointToIndex: (x, y) -> x + @width * y
  _indexToPoint: (index) -> [index % @width, Math.floor(index / @width)]
  _image: null
  _counts: {Base:0, Empty:0, RawMaterial:0, Roaming:0, ComplexMaterial:0, Producer:0}
  _material_ratio: .05
  _roamer_ratio: .0001
  _producer_ratio: .001

  _checkMaterialRatio: ->
    current_count = @_counts.RawMaterial + @_counts.ComplexMaterial
    target_count = Math.floor(@_material_ratio * @_map.length)
    if current_count < target_count
      loop
        i = Math.floor(Math.random() * (@_map.length-1))
        break unless @getEntityAtIndex(i)?.name is not 'Empty'
      @assignEntityToIndex(i, new RawMaterialEntity(), true)

  _checkRoamerRatio: ->
    current_count = @_counts.Roaming
    target_count = Math.floor(@_roamer_ratio * @_map.length)
    if current_count < target_count
      loop
        i = Math.floor(Math.random() * (@_map.length-1))
        break unless @getEntityAtIndex(i)?.name is not 'Empty'
      @assignEntityToIndex(i, new RoamingEntity(), true)

  _checkProducerRatio: ->
    current_count = @_counts.Producer
    target_count = Math.floor(@_producer_ratio * @_map.length)
    if current_count < target_count
      loop
        i = Math.floor(Math.random() * (@_map.length-1))
        break unless @getEntityAtIndex(i)?.name is not 'Empty'
      @assignEntityToIndex(i, new ProducerEntity(), true)

  #publics
  constructor: (@width, @height) ->
    @flow = flow.spiral(@width, @height)
    @_image = new Uint8Array(@width * @height * 4)
    @assignEntityToIndex(i, new EmptyEntity(), true) for i in [0 .. @width*@height - 1]

  tick: ->
    @_checkMaterialRatio()
    @_checkRoamerRatio()
    @_checkProducerRatio()
    entity.tick() for entity in (if @_tick % 2 is 0 then @_map.slice() else @_map.slice().reverse())
    @_tick++

  getRender: ->
    @_image

  getEntityAtXY: (x, y) ->
    @getEntityAtIndex(@_pointToIndex(x, y))

  getEntityAtIndex: (index) ->
    if @_map[index]? then @_map[index] else false

  getEntitiesInRange: (index_min, index_max) ->
    @_map.slice(index_min, index_max+1)

  swapEntities: (index1, index2) ->
    ent1 = @getEntityAtIndex index1
    ent2 = @getEntityAtIndex index2
    @assignEntityToIndex index1, ent2
    @assignEntityToIndex index2, ent1
    ent1.is_deleted = false
    ent2.is_deleted = false

  getEntityAtDirection: (index, direction) ->
    switch direction
      when 'up'
        if index > @width - 1
          @getEntityAtIndex(index - @width)
        else false
      when 'down'
        if index < @_map.length - 1
          @getEntityAtIndex(index + @width)
        else false
      when 'left'
        if index % @width > 0
          @getEntityAtIndex(index - 1)
        else false
      when 'right'
        if index % @width < @width - 1
          @getEntityAtIndex(index + 1)
        else false

  assignEntityToIndex: (index, entity, is_new = false) ->
    current_entity = @getEntityAtIndex(index)
    if current_entity
      current_entity.is_deleted = true
      @_counts[current_entity.name]--

    @_counts[entity.name]++

    @_map[index] = entity
    entity.is_deleted = false
    if is_new
      entity.init @, index
    else
      entity.moved(index)


  #debugs
  $$dumpMap: ->
    console.debug @_map

module.exports = Map


