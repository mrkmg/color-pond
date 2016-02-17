(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  var filter_strength, frame_time, last_loop;
  filter_strength = 20;
  frame_time = 0;
  last_loop = new Date();
  return {
    tick: function() {
      var this_loop, this_time;
      this_loop = new Date;
      this_time = this_loop - last_loop;
      frame_time += (this_time - frame_time) / filter_strength;
      return last_loop = this_loop;
    },
    getFps: function() {
      return 1000 / frame_time;
    }
  };
};


},{}],2:[function(require,module,exports){
module.exports = function() {
  var dx, dy, ideal, s1, s2, s3, screenX, screenY;
  ideal = 90000;
  screenX = window.innerWidth;
  screenY = window.innerHeight;
  if (screenX > screenY) {
    s1 = Math.round((screenX / screenY) * 100) / 100;
    s2 = Math.floor(ideal / s1);
    s3 = Math.floor(Math.sqrt(s2));
    dx = Math.floor(s1 * s3);
    dy = s3;
  } else {
    s1 = Math.round((screenY / screenX) * 100) / 100;
    s2 = Math.floor(ideal / s1);
    s3 = Math.floor(Math.sqrt(s2));
    dy = Math.floor(s1 * s3);
    dx = s3;
  }
  return [dx, dy];
};


},{}],3:[function(require,module,exports){
var canvas, context, image_data;

canvas = document.getElementById('main');

canvas.style.backgroundColor = 'rgba(0, 0, 0, 255)';

context = canvas.getContext('2d');

context.imageSmoothingEnabled = false;

image_data = context.createImageData(1, 1);

module.exports.setSize = function(x, y) {
  context.canvas.width = x;
  context.canvas.height = y;
  return image_data = context.createImageData(x, y);
};

module.exports.writeImage = function(data) {
  var i, j, len, v;
  for (i = j = 0, len = data.length; j < len; i = ++j) {
    v = data[i];
    image_data.data[i] = v;
  }
  return context.putImageData(image_data, 0, 0);
};


},{}],4:[function(require,module,exports){

/*
  Color Pond
 */
var fps, fps_target, ref, render, worker, x, y;

render = require('./lib/render');

fps = require('./lib/fps')();

ref = require('./lib/optimalResolution')(), x = ref[0], y = ref[1];

console.log(x, y);

fps_target = 20;

worker = new Worker('build/process.js');

worker.postMessage(['init', x, y]);

render.setSize(x, y);

worker.onmessage = function(e) {
  switch (e.data[0]) {
    case 'imageData':
      fps.tick();
      return render.writeImage(e.data[1]);
    case 'tpm':
      return console.log("TPS: " + e.data[1] + " | FPS: " + (fps.getFps()));
    case 'initialized':
      return worker.postMessage(['start']);
  }
};

setInterval((function() {
  return worker.postMessage(['sendTPS']);
}), 5000);

setInterval((function() {
  return worker.postMessage(['sendImageData']);
}), 1000 / fps_target);


},{"./lib/fps":1,"./lib/optimalResolution":2,"./lib/render":3}]},{},[4]);
