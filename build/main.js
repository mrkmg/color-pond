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
  ideal = 20000;
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
var OptionManager;

OptionManager = (function() {
  function OptionManager(listener) {
    this.listener = listener;
    this.variables = {};
    this.option_holder = document.getElementById('options');
  }

  OptionManager.prototype.clearOptions = function() {
    return this.option_holder.innerHTML = "";
  };

  OptionManager.prototype.addOptions = function() {
    var header, holder, input, label, option, options, ref, self, type, value;
    this.clearOptions();
    self = this;
    ref = this.variables;
    for (type in ref) {
      options = ref[type];
      holder = document.createElement('div');
      holder.classList.add('type');
      header = document.createElement('h2');
      header.textContent = type;
      holder.appendChild(header);
      for (option in options) {
        value = options[option];
        label = document.createElement('label');
        label.textContent = option.replace(/_/g, ' ');
        label.style.textTransform = 'capitalize';
        input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.value = value;
        input.dataset['type'] = type;
        input.dataset['option'] = option;
        input.addEventListener('input', function() {
          var element;
          element = this;
          if (element.dataset.updateTimeout) {
            clearTimeout(element.dataset.updateTimeout);
          }
          return element.dataset.updateTimeout = setTimeout((function() {
            self.writeValue(element.dataset.type, element.dataset.option, element.value);
            element.dataset.updateTimeout = null;
            element.style.backgroundColor = '#ddd';
            return setTimeout((function() {
              return element.style.backgroundColor = '#fff';
            }), 100);
          }), 500);
        });
        holder.appendChild(label);
        holder.appendChild(document.createElement('br'));
        holder.appendChild(input);
        holder.appendChild(document.createElement('br'));
      }
      this.option_holder.appendChild(holder);
    }
    return null;
  };

  OptionManager.prototype.writeValue = function(type, option, value) {
    return this.listener(type, option, parseFloat(value));
  };

  OptionManager.prototype.setVariables = function(variables) {
    this.variables = variables;
    return this.addOptions();
  };

  return OptionManager;

})();

module.exports = OptionManager;


},{}],4:[function(require,module,exports){
var canvas, context, image_data;

canvas = document.getElementById('main');

canvas.style.backgroundColor = 'rgba(0, 0, 0, 255)';

context = canvas.getContext('2d');

context.imageSmoothingEnabled = false;

image_data = null;

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


},{}],5:[function(require,module,exports){

/*
  Color Pond
 */
var OptionManager, canvas, fps, fps_target, optionManager, ref, render, stats, worker, x, y;

render = require('./lib/render');

fps = require('./lib/fps')();

OptionManager = require('./lib/optionManager');

fps_target = 20;

ref = require('./lib/optimalResolution')(), x = ref[0], y = ref[1];

stats = document.getElementById('stats');

stats.textContent = "TPS: ?? | FPS: ??";

worker = new Worker('build/process.js');

worker.postMessage(['init', x, y]);

render.setSize(x, y);

canvas = document.getElementById('main');

document.getElementById('start').addEventListener('click', function() {
  return worker.postMessage(['start']);
});

document.getElementById('stop').addEventListener('click', function() {
  return worker.postMessage(['stop']);
});

document.getElementById('toggle_pixel').addEventListener('click', function() {
  if (canvas.classList.contains('pixeled')) {
    return canvas.classList.remove('pixeled');
  } else {
    return canvas.classList.add('pixeled');
  }
});

optionManager = new OptionManager(function(type, variable, value) {
  return worker.postMessage(['updateVariable', type, variable, value]);
});

worker.onmessage = function(e) {
  switch (e.data[0]) {
    case 'imageData':
      fps.tick();
      return render.writeImage(e.data[1]);
    case 'tpm':
      return stats.textContent = "TPS: " + (Math.round(e.data[1])) + " | FPS: " + (Math.round(fps.getFps()));
    case 'initialized':
      worker.postMessage(['start']);
      return worker.postMessage(['getVariables']);
    case 'variables':
      return optionManager.setVariables(e.data[1]);
  }
};

setInterval((function() {
  return worker.postMessage(['sendTPS']);
}), 1000);

setInterval((function() {
  return worker.postMessage(['sendImageData']);
}), 1000 / fps_target);


},{"./lib/fps":1,"./lib/optimalResolution":2,"./lib/optionManager":3,"./lib/render":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL2Zwcy5jb2ZmZWUiLCJzcmMvbGliL29wdGltYWxSZXNvbHV0aW9uLmNvZmZlZSIsInNyYy9saWIvb3B0aW9uTWFuYWdlci5jb2ZmZWUiLCJzcmMvbGliL3JlbmRlci5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsTUFBQTtFQUFBLGVBQUEsR0FBa0I7RUFDbEIsVUFBQSxHQUFhO0VBQ2IsU0FBQSxHQUFnQixJQUFBLElBQUEsQ0FBQTtTQUNoQjtJQUNFLElBQUEsRUFBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFJO01BQ2hCLFNBQUEsR0FBWSxTQUFBLEdBQVk7TUFDeEIsVUFBQSxJQUFjLENBQUMsU0FBQSxHQUFZLFVBQWIsQ0FBQSxHQUEyQjthQUN6QyxTQUFBLEdBQVk7SUFKUCxDQURUO0lBTUUsTUFBQSxFQUFTLFNBQUE7YUFDUCxJQUFBLEdBQU87SUFEQSxDQU5YOztBQUplOzs7O0FDQWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7QUFDZixNQUFBO0VBQUEsS0FBQSxHQUFRO0VBQ1IsT0FBQSxHQUFVLE1BQU0sQ0FBQztFQUNqQixPQUFBLEdBQVUsTUFBTSxDQUFDO0VBRWpCLElBQUcsT0FBQSxHQUFVLE9BQWI7SUFDRSxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLE9BQUEsR0FBUSxPQUFULENBQUEsR0FBa0IsR0FBN0IsQ0FBQSxHQUFrQztJQUN2QyxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFBLEdBQU0sRUFBakI7SUFDTCxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsQ0FBWDtJQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxD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Q0FBWixFQUVHLElBRkg7O0FBSUEsV0FBQSxDQUFZLENBQUUsU0FBQTtTQUNaLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsZUFBRCxDQUFuQjtBQURZLENBQUYsQ0FBWixFQUVHLElBQUEsR0FBSyxVQUZSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gLT5cbiAgZmlsdGVyX3N0cmVuZ3RoID0gMjBcbiAgZnJhbWVfdGltZSA9IDBcbiAgbGFzdF9sb29wID0gbmV3IERhdGUoKVxuICB7XG4gICAgdGljayA6IC0+XG4gICAgICB0aGlzX2xvb3AgPSBuZXcgRGF0ZVxuICAgICAgdGhpc190aW1lID0gdGhpc19sb29wIC0gbGFzdF9sb29wXG4gICAgICBmcmFtZV90aW1lICs9ICh0aGlzX3RpbWUgLSBmcmFtZV90aW1lKSAvIGZpbHRlcl9zdHJlbmd0aFxuICAgICAgbGFzdF9sb29wID0gdGhpc19sb29wXG4gICAgZ2V0RnBzIDogLT5cbiAgICAgIDEwMDAgLyBmcmFtZV90aW1lXG4gIH1cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlkZWFsID0gMjAwMDBcbiAgc2NyZWVuWCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gIHNjcmVlblkgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuICBpZihzY3JlZW5YID4gc2NyZWVuWSlcbiAgICBzMSA9IE1hdGgucm91bmQoKHNjcmVlblgvc2NyZWVuWSkqMTAwKS8xMDBcbiAgICBzMiA9IE1hdGguZmxvb3IoaWRlYWwvczEpXG4gICAgczMgPSBNYXRoLmZsb29yKE1hdGguc3FydChzMikpXG4gICAgZHggPSBNYXRoLmZsb29yKHMxKnMzKVxuICAgIGR5ID0gczNcbiAgZWxzZVxuICAgIHMxID0gTWF0aC5yb3VuZCgoc2NyZWVuWS9zY3JlZW5YKSoxMDApLzEwMFxuICAgIHMyID0gTWF0aC5mbG9vcihpZGVhbC9zMSlcbiAgICBzMyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KHMyKSlcbiAgICBkeSA9IE1hdGguZmxvb3IoczEqczMpXG4gICAgZHggPSBzM1xuICBbZHgsIGR5XSIsImNsYXNzIE9wdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAbGlzdGVuZXIpIC0+XG4gICAgQHZhcmlhYmxlcyA9IHt9XG4gICAgQG9wdGlvbl9ob2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3B0aW9ucycpXG5cbiAgY2xlYXJPcHRpb25zOiAtPlxuICAgIEBvcHRpb25faG9sZGVyLmlubmVySFRNTCA9IFwiXCJcblxuICBhZGRPcHRpb25zOiAtPlxuICAgIEBjbGVhck9wdGlvbnMoKVxuICAgIHNlbGYgPSBAXG4gICAgZm9yIHR5cGUsIG9wdGlvbnMgb2YgQHZhcmlhYmxlc1xuICAgICAgaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGhvbGRlci5jbGFzc0xpc3QuYWRkKCd0eXBlJylcblxuICAgICAgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKVxuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gdHlwZVxuXG4gICAgICBob2xkZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKVxuXG4gICAgICBmb3Igb3B0aW9uLCB2YWx1ZSBvZiBvcHRpb25zXG4gICAgICAgIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbi5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgICAgbGFiZWwuc3R5bGUudGV4dFRyYW5zZm9ybSA9ICdjYXBpdGFsaXplJ1xuXG4gICAgICAgIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnbnVtYmVyJylcbiAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZVxuICAgICAgICBpbnB1dC5kYXRhc2V0Wyd0eXBlJ10gPSB0eXBlXG4gICAgICAgIGlucHV0LmRhdGFzZXRbJ29wdGlvbiddID0gb3B0aW9uXG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgLT5cbiAgICAgICAgICBlbGVtZW50ID0gQFxuICAgICAgICAgIGlmIGVsZW1lbnQuZGF0YXNldC51cGRhdGVUaW1lb3V0IHRoZW4gY2xlYXJUaW1lb3V0IGVsZW1lbnQuZGF0YXNldC51cGRhdGVUaW1lb3V0XG4gICAgICAgICAgZWxlbWVudC5kYXRhc2V0LnVwZGF0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCggLT5cbiAgICAgICAgICAgIHNlbGYud3JpdGVWYWx1ZShlbGVtZW50LmRhdGFzZXQudHlwZSwgZWxlbWVudC5kYXRhc2V0Lm9wdGlvbiwgZWxlbWVudC52YWx1ZSlcbiAgICAgICAgICAgIGVsZW1lbnQuZGF0YXNldC51cGRhdGVUaW1lb3V0ID0gbnVsbFxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2RkZCdcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCAtPiBlbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmZmJyksIDEwMClcbiAgICAgICAgICApLCA1MDApXG5cbiAgICAgICAgKVxuXG4gICAgICAgIGhvbGRlci5hcHBlbmRDaGlsZChsYWJlbClcbiAgICAgICAgaG9sZGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpXG4gICAgICAgIGhvbGRlci5hcHBlbmRDaGlsZChpbnB1dClcbiAgICAgICAgaG9sZGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpXG5cbiAgICAgIEBvcHRpb25faG9sZGVyLmFwcGVuZENoaWxkKGhvbGRlcilcbiAgICBudWxsXG5cbiAgd3JpdGVWYWx1ZTogKHR5cGUsIG9wdGlvbiwgdmFsdWUpIC0+XG4gICAgQGxpc3RlbmVyKHR5cGUsIG9wdGlvbiwgcGFyc2VGbG9hdCh2YWx1ZSkpXG5cbiAgc2V0VmFyaWFibGVzOiAodmFyaWFibGVzKSAtPlxuICAgIEB2YXJpYWJsZXMgPSB2YXJpYWJsZXNcbiAgICBAYWRkT3B0aW9ucygpXG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uTWFuYWdlciIsImNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtYWluJ1xuY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDI1NSknXG5cbmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG5pbWFnZV9kYXRhID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cy5zZXRTaXplID0gKHgsIHkpIC0+XG4gIGNvbnRleHQuY2FudmFzLndpZHRoID0geFxuICBjb250ZXh0LmNhbnZhcy5oZWlnaHQgPSB5XG4gIGltYWdlX2RhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSB4LCB5XG5cbm1vZHVsZS5leHBvcnRzLndyaXRlSW1hZ2UgPSAoZGF0YSkgLT5cbiAgaW1hZ2VfZGF0YS5kYXRhW2ldPXYgZm9yIHYsIGkgaW4gZGF0YVxuICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZV9kYXRhLCAwLCAwKVxuIiwiIyMjXG4gIENvbG9yIFBvbmRcbiMjI1xuXG5yZW5kZXIgPSByZXF1aXJlICcuL2xpYi9yZW5kZXInXG5mcHMgPSByZXF1aXJlKCcuL2xpYi9mcHMnKSgpXG5PcHRpb25NYW5hZ2VyID0gcmVxdWlyZSgnLi9saWIvb3B0aW9uTWFuYWdlcicpXG5mcHNfdGFyZ2V0ID0gMjBcblxuW3gsIHldID0gcmVxdWlyZSgnLi9saWIvb3B0aW1hbFJlc29sdXRpb24nKSgpXG5cblxuc3RhdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdHMnKVxuc3RhdHMudGV4dENvbnRlbnQgPSBcIlRQUzogPz8gfCBGUFM6ID8/XCJcblxud29ya2VyID0gbmV3IFdvcmtlcignYnVpbGQvcHJvY2Vzcy5qcycpO1xuXG53b3JrZXIucG9zdE1lc3NhZ2UgWydpbml0JywgeCwgeV1cbnJlbmRlci5zZXRTaXplIHgsIHlcblxuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKVxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAtPiB3b3JrZXIucG9zdE1lc3NhZ2UgWydzdGFydCddKTtcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAtPiB3b3JrZXIucG9zdE1lc3NhZ2UgWydzdG9wJ10pO1xuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZV9waXhlbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgLT5cbiAgaWYgY2FudmFzLmNsYXNzTGlzdC5jb250YWlucygncGl4ZWxlZCcpXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ3BpeGVsZWQnKVxuICBlbHNlXG4gICAgY2FudmFzLmNsYXNzTGlzdC5hZGQoJ3BpeGVsZWQnKVxuKVxuXG5vcHRpb25NYW5hZ2VyID0gbmV3IE9wdGlvbk1hbmFnZXIoKHR5cGUsIHZhcmlhYmxlLCB2YWx1ZSkgLT4gd29ya2VyLnBvc3RNZXNzYWdlIFsndXBkYXRlVmFyaWFibGUnLCB0eXBlLCB2YXJpYWJsZSwgdmFsdWVdKVxuXG53b3JrZXIub25tZXNzYWdlID0gKGUpIC0+XG4gIHN3aXRjaCBlLmRhdGFbMF1cbiAgICB3aGVuICdpbWFnZURhdGEnXG4gICAgICBmcHMudGljaygpXG4gICAgICByZW5kZXIud3JpdGVJbWFnZSBlLmRhdGFbMV1cbiAgICB3aGVuICd0cG0nXG4gICAgICBzdGF0cy50ZXh0Q29udGVudCA9IFwiVFBTOiAje01hdGgucm91bmQoZS5kYXRhWzFdKX0gfCBGUFM6ICN7TWF0aC5yb3VuZChmcHMuZ2V0RnBzKCkpfVwiXG4gICAgd2hlbiAnaW5pdGlhbGl6ZWQnXG4gICAgICB3b3JrZXIucG9zdE1lc3NhZ2UgWydzdGFydCddXG4gICAgICB3b3JrZXIucG9zdE1lc3NhZ2UgWydnZXRWYXJpYWJsZXMnXVxuICAgIHdoZW4gJ3ZhcmlhYmxlcydcbiAgICAgIG9wdGlvbk1hbmFnZXIuc2V0VmFyaWFibGVzKGUuZGF0YVsxXSlcblxuXG5cbnNldEludGVydmFsICggLT5cbiAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc2VuZFRQUyddXG4pLCAxMDAwXG5cbnNldEludGVydmFsICggLT5cbiAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc2VuZEltYWdlRGF0YSddXG4pLCAxMDAwL2Zwc190YXJnZXQiXX0=
