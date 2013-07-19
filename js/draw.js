
tpmLoop=null;
getFps=null;

(function(){
    var filterStrength = 5;
    var frameTime = 0, lastLoop = new Date, thisLoop;

    tpmLoop = function(){
      var thisFrameTime = (thisLoop=new Date) - lastLoop;
      frameTime+= (thisFrameTime - frameTime) / filterStrength;
      lastLoop = thisLoop;
    }

    getFps = function(){
        return (1000/frameTime).toFixed(1);
    }

})();

draw = {
    //variables
    scale:5,
    pond:null,
    pondCtx:null,
    pondData:null,
    pondWidth:null,
    pondHeight:null,
    currentCanvas:0,
    currentMap:[],
    tmpCanvas:null,
    tmpCanvasCtx:null,
    prefilter:'none',
    postfilter:'none',
    //functions
    init:function(width,height){
        this.pondWidth = width;
        this.pondHeight = height;
        this.pond = document.getElementById("pond");
        var screenX = $('html').width()-350;
        var screenY = $('html').height()-150;
        this.scale = Math.min(Math.floor(screenX/width),Math.floor(screenY/height));
        $('#pond').attr('height',height*this.scale);
        $('#pond').attr('width',width*this.scale);
        // $('#pond').attr('height',height);
        // $('#pond').attr('width',width);
        // $('#pond').css('height',height*this.scale);
        // $('#pond').css('width',width*this.scale);
        this.pondCtx = this.pond.getContext("2d");
        this.pondCtx.imageSmoothingEnabled = false;
        this.pondCtx.webkitImageSmoothingEnabled = false;
        this.pondCtx.mozImageSmoothingEnabled = false;
        //this.pondCtx.scale(this.scale,this.scale);
        this.tmpCanvas = $('<canvas>').attr('width',width).attr('height',height)[0];
        this.tmpCanvasCtx = this.tmpCanvas.getContext("2d");
    },
    point:function(i, r, g, b, o){
        if(o == undefined || o == null) o = 0;
        var xy = helpers.indexToCart(i);
        var sx = (xy[0]*this.scale)+o;
        var sy = (xy[1]*this.scale)+o;
        this.pondCtx.beginPath();
        this.pondCtx.rect(sx, sy, this.scale-o, this.scale-o);
        this.pondCtx.fillStyle = 'rgb('+r+','+g+','+b+')';
        this.pondCtx.fill();
    },
    pointStroke:function(i, r, g, b, s){
        this.point(i, r, g, b,s);
        if(s == 0) return;
        this.pondCtx.lineWidth = 2;
        this.pondCtx.strokeStyle = s;
        this.pondCtx.stroke();
    },
    render:function(value){
        tpmLoop();
        var data = this.pondCtx.createImageData(this.pondWidth,this.pondHeight);
        for(var i=0;i<value.length;i++) data.data[i] = value[i];
        if(this.prefilter == 'none'){
            this.tmpCanvasCtx.putImageData(data,0,0);
        }
        else{
            this.tmpCanvasCtx.putImageData(Filters[this.prefilter](data),0,0);
        }

        this.pondCtx.drawImage(this.tmpCanvas,0,0,this.pondWidth*this.scale,this.pondHeight*this.scale);
        //this.pondCtx.putImageData(data,0,0);
        if(this.postfilter != 'none')
            Filters.filterImage(this.postfilter);
    }
}

Filters = {};
Filters.getPixels = function(img) {
  return this.getCanvas().getImageData(0,0,draw.pondWidth*draw.scale,draw.pondHeight*draw.scale);
};

Filters.getCanvas = function() {
  return draw.pondCtx;
};

Filters.filterImage = function(filter,var_args) {
  this.getCanvas().putImageData(this[filter](this.getPixels(),var_args),0,0);
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.convolute = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

var f19 = 1/4;

Filters.emboss = function(pixels){
    return this.convolute(pixels,
      [ -2, -1, 0,
        -1, 1, 1,
        0, 1, 2 ]
    );
}

Filters.sharpen = function(pixels){
    return this.convolute(pixels,
      [ 0,-1,0,
        -1,5,-1,
        0,-1,0 ]
    );
}

Filters.edge = function(pixels){
    return this.convolute(pixels,
      [ 0,1.5,0,
        1.5,-5,1.5,
        0,1.5,0 ]
    );
}

Filters.smooth = function(pixels){
    return this.convolute(pixels,
      [ f19, f19, f19,
        f19, f19, f19,
        f19, f19, f19 ]
    );
}