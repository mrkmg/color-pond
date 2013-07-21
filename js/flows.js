Number.prototype.mod = function(n) { return ((this%n)+n)%n; }

flows = {}

flows._spiral={
    divisions:4,
}


// This is my first try at a spiral.
// flows.spiral = function(width,height){
//     var centerX = Math.floor(width/2),
//         centerY = Math.floor(height/2),
//         divisionAngle = Math.floor(360/this._spiral.divisions),
//         maxDistance = Math.sqrt(Math.pow(width-centerX,2)+Math.pow(height-centerY,2)),
//         dx,dy,distance,angle
//         ;

//         if(width > height){
//             var mx = height/width;
//             var my = 1;
//         } else {
//             var mx = 1;
//             var my = width/height;
//         }

//     return function(i){
//         var xy = helpers.indexToCart(i),x=xy[0],y=xy[1],
//             dx = (x-centerX)*mx,
//             dy = (y-centerY)*my,
//             //distance = Math.pow(1.17,(Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))/maxDistance)),
//             angle = Math.floor(((((Math.atan2(dy,dx)*180)/3.14)+Math.floor(Math.random()*10)).mod(360)/divisionAngle)*100)/100,
//             intp = Math.floor(angle),
//             dec = Math.floor((angle - intp)*100);
//             ;

//             return helpers.percentage(dec)?(intp+1).mod(4):(intp+2).mod(4);

//     }
// }

// Maybe use this later
// flows.eye = function(width,height){
//     var centerX = Math.floor(width/2),
//         centerY = Math.floor(height/2),
//         divisionAngle = Math.floor(360/this._spiral.divisions),
//         maxDistance = Math.sqrt(Math.pow(width-centerX,2)+Math.pow(height-centerY,2)),
//         dx,dy,distance,angle
//         ;

//         if(width > height){
//             var mx = height/width;
//             var my = 1;
//         } else {
//             var mx = 1;
//             var my = width/height;
//         }

//     return function(i){
//         var xy = helpers.indexToCart(i),x=xy[0],y=xy[1],
//             dx = (x-centerX)*mx,
//             dy = (y-centerY)*my,
//             distance = Math.exp((Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))/maxDistance)*15),
//             angle = Math.floor(((((Math.atan2(dy,dx)*180)/3.14)+distance).mod(360)/divisionAngle)*100)/100,
//             intp = Math.floor(angle),
//             dec = Math.floor((angle - intp)*100);
//             ;

//             return helpers.percentage(dec)?(intp+1).mod(4):(intp+2).mod(4);

//     }
// }

flows.sin = function(width,height){
    var centerX = Math.floor(width/2),
        centerY = Math.floor(height/2),
        divisionAngle = Math.floor(360/this._spiral.divisions),
        maxDistance = Math.sqrt(Math.pow(width-centerX,2)+Math.pow(height-centerY,2)),
        dx,dy,distance,angle
        ;

        if(width > height){
            var mx = height/width;
            var my = 1;
        } else {
            var mx = 1;
            var my = width/height;
        }

    return function(i){
        var xy = helpers.indexToCart(i),x=xy[0],y=xy[1],
            dx = (x-centerX)*mx,
            dy = (y-centerY)*my,
            distance = Math.sin((Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))/maxDistance)*10),
            angle = Math.floor(((((Math.atan2(dy,dx)*180)/3.14)+distance).mod(360)/divisionAngle)*100)/100,
            intp = Math.floor(angle),
            dec = Math.floor((angle - intp)*100);
            ;

            return helpers.percentage(dec)?(intp+1).mod(4):(intp+2).mod(4);

    }
}

flows.river = function(width,height){
    return function(){ return 0; }
}

flows.random = function(width,height){
    return function(){
        return Math.floor(Math.random()*4)
    }
}




/*
       1
   1.5    .5

  2    -    0

   2.5   3.5
       3


*/