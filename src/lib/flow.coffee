Number.prototype.mod = (n) -> ((this%n)+n)%n

module.exports.spiral = (width, height) ->
  center_x = Math.floor width/2
  center_y = Math.floor height/2

  division_angle = Math.floor 360/4
  maxDistance = Math.sqrt(Math.pow(width-center_x, 2) + Math.pow(height-center_y, 2))
  mx = 1
  my = 1

  if width > height
    mx = height/width
  else
    my = width/height

  directions = ['right', 'down', 'left', 'up']

  (index) ->
    if Math.random() > .4
      directions[Math.floor(Math.random() * 4)]
    else
      x = index % width
      y = Math.floor index / width

      dx = ((x - center_x) * mx)
      dy = ((y - center_y + 1) * my)

      distance = Math.sin((Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / maxDistance) * 10)
      angle = Math.floor(((((Math.atan2(dy, dx)*180)/Math.PI)+distance).mod(360)/division_angle)*100)/100
      intp = Math.floor(angle)
      dec = Math.floor((angle-intp)*100)

      direction =  if Math.random()*90 > dec then (intp+1).mod(4) else (intp+2).mod(4)

      directions[direction]