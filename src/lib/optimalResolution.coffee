module.exports = ->
  ideal = 20000
  screenX = window.innerWidth
  screenY = window.innerHeight

  if(screenX > screenY)
    s1 = Math.round((screenX/screenY)*100)/100
    s2 = Math.floor(ideal/s1)
    s3 = Math.floor(Math.sqrt(s2))
    dx = Math.floor(s1*s3)
    dy = s3
  else
    s1 = Math.round((screenY/screenX)*100)/100
    s2 = Math.floor(ideal/s1)
    s3 = Math.floor(Math.sqrt(s2))
    dy = Math.floor(s1*s3)
    dx = s3
  [dx, dy]