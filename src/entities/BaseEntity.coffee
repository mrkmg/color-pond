class BaseEntity
  name: 'Base'

  constructor: ->
    @is_moveable = true
    @is_deleted = false
    @color = [0, 0, 0, 255]

  init: (map, index) ->
    @map = map
    @map_index = index
    [@map_x, @map_y] = @map._indexToPoint(index)
    @setColor @color[0], @color[1], @color[2], @color[3]

  moved: (new_index) ->
    @map_index = new_index
    [@map_x, @map_y] = @map._indexToPoint(new_index)
    @setColor @color[0], @color[1], @color[2], @color[3]

  setColor: (r, g, b, a) ->
    unless @is_deleted
      @color = [r, g, b, a]
      image_index = @map_index * 4;
      @map._image[image_index] = r
      @map._image[image_index + 1] = g
      @map._image[image_index + 2] = b
      @map._image[image_index + 3] = a

  tick: ->
    not @is_deleted

module.exports = BaseEntity