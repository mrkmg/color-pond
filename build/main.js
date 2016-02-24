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
  ideal = 60000;
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
var OptionManager, canvas, did_init, flow_selector, fps, fps_target, optionManager, options, ref, render, right_panel, seed, seed_holder, stats, worker, x, y;

fps_target = 20;

render = require('./lib/render');

fps = require('./lib/fps')();

OptionManager = require('./lib/optionManager');

worker = new Worker('build/process.js');

right_panel = document.getElementById('right_panel');

canvas = document.getElementById('main');

stats = document.getElementById('stats');

flow_selector = document.getElementById('flow');

seed_holder = document.getElementById('seed_holder');

seed = document.getElementById('seed');

options = document.getElementById('options');

seed.value = Math.round(Math.random() * 10000000);

ref = require('./lib/optimalResolution')(), x = ref[0], y = ref[1];

stats.textContent = "TPS: ?? | FPS: ??";

render.setSize(x, y);

did_init = false;

optionManager = new OptionManager(function(type, variable, value) {
  return worker.postMessage(['updateVariable', type, variable, value]);
});

worker.postMessage(['getVariables']);

worker.onmessage = function(e) {
  switch (e.data[0]) {
    case 'imageData':
      fps.tick();
      return render.writeImage(e.data[1]);
    case 'tpm':
      return stats.textContent = "TPS: " + (Math.round(e.data[1])) + " | FPS: " + (Math.round(fps.getFps()));
    case 'initialized':
      setInterval((function() {
        return worker.postMessage(['sendTPS']);
      }), 1000);
      setInterval((function() {
        return worker.postMessage(['sendImageData']);
      }), 1000 / fps_target);
      return worker.postMessage(['start']);
    case 'variables':
      return optionManager.setVariables(e.data[1]);
  }
};

canvas.addEventListener('click', function() {
  if (right_panel.classList.contains('show')) {
    right_panel.classList.remove('show');
  } else {
    right_panel.classList.add('show');
  }
  return true;
});

document.getElementById('start').addEventListener('click', function() {
  if (did_init) {
    return worker.postMessage(['start']);
  } else {
    worker.postMessage(['init', x, y, seed.value]);
    right_panel.classList.remove('show');
    options.style.top = '60px';
    return seed_holder.style.display = 'none';
  }
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

flow_selector.addEventListener('change', function() {
  return worker.postMessage(['setFlowType', this.value]);
});


},{"./lib/fps":1,"./lib/optimalResolution":2,"./lib/optionManager":3,"./lib/render":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL2Zwcy5jb2ZmZWUiLCJzcmMvbGliL29wdGltYWxSZXNvbHV0aW9uLmNvZmZlZSIsInNyYy9saWIvb3B0aW9uTWFuYWdlci5jb2ZmZWUiLCJzcmMvbGliL3JlbmRlci5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsTUFBQTtFQUFBLGVBQUEsR0FBa0I7RUFDbEIsVUFBQSxHQUFhO0VBQ2IsU0FBQSxHQUFnQixJQUFBLElBQUEsQ0FBQTtTQUNoQjtJQUNFLElBQUEsRUFBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFJO01BQ2hCLFNBQUEsR0FBWSxTQUFBLEdBQVk7TUFDeEIsVUFBQSxJQUFjLENBQUMsU0FBQSxHQUFZLFVBQWIsQ0FBQSxHQUEyQjthQUN6QyxTQUFBLEdBQVk7SUFKUCxDQURUO0lBTUUsTUFBQSxFQUFTLFNBQUE7YUFDUCxJQUFBLEdBQU87SUFEQSxDQU5YOztBQUplOzs7O0FDQWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7QUFDZixNQUFBO0VBQUEsS0FBQSxHQUFRO0VBQ1IsT0FBQSxHQUFVLE1BQU0sQ0FBQztFQUNqQixPQUFBLEdBQVUsTUFBTSxDQUFDO0VBRWpCLElBQUcsT0FBQSxHQUFVLE9BQWI7SUFDRSxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLE9BQUEsR0FBUSxPQUFULENBQUEsR0FBa0IsR0FBN0IsQ0FBQSxHQUFrQztJQUN2QyxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFBLEdBQU0sRUFBakI7SUFDTCxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsQ0FBWDtJQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxD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LENBQW1CLENBQUMsYUFBRCxFQUFnQixJQUFJLENBQUMsS0FBckIsQ0FBbkI7QUFEdUMsQ0FBekMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAtPlxuICBmaWx0ZXJfc3RyZW5ndGggPSAyMFxuICBmcmFtZV90aW1lID0gMFxuICBsYXN0X2xvb3AgPSBuZXcgRGF0ZSgpXG4gIHtcbiAgICB0aWNrIDogLT5cbiAgICAgIHRoaXNfbG9vcCA9IG5ldyBEYXRlXG4gICAgICB0aGlzX3RpbWUgPSB0aGlzX2xvb3AgLSBsYXN0X2xvb3BcbiAgICAgIGZyYW1lX3RpbWUgKz0gKHRoaXNfdGltZSAtIGZyYW1lX3RpbWUpIC8gZmlsdGVyX3N0cmVuZ3RoXG4gICAgICBsYXN0X2xvb3AgPSB0aGlzX2xvb3BcbiAgICBnZXRGcHMgOiAtPlxuICAgICAgMTAwMCAvIGZyYW1lX3RpbWVcbiAgfVxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gLT5cbiAgaWRlYWwgPSA2MDAwMFxuICBzY3JlZW5YID0gd2luZG93LmlubmVyV2lkdGhcbiAgc2NyZWVuWSA9IHdpbmRvdy5pbm5lckhlaWdodFxuXG4gIGlmKHNjcmVlblggPiBzY3JlZW5ZKVxuICAgIHMxID0gTWF0aC5yb3VuZCgoc2NyZWVuWC9zY3JlZW5ZKSoxMDApLzEwMFxuICAgIHMyID0gTWF0aC5mbG9vcihpZGVhbC9zMSlcbiAgICBzMyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KHMyKSlcbiAgICBkeCA9IE1hdGguZmxvb3IoczEqczMpXG4gICAgZHkgPSBzM1xuICBlbHNlXG4gICAgczEgPSBNYXRoLnJvdW5kKChzY3JlZW5ZL3NjcmVlblgpKjEwMCkvMTAwXG4gICAgczIgPSBNYXRoLmZsb29yKGlkZWFsL3MxKVxuICAgIHMzID0gTWF0aC5mbG9vcihNYXRoLnNxcnQoczIpKVxuICAgIGR5ID0gTWF0aC5mbG9vcihzMSpzMylcbiAgICBkeCA9IHMzXG4gIFtkeCwgZHldIiwiY2xhc3MgT3B0aW9uTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEBsaXN0ZW5lcikgLT5cbiAgICBAdmFyaWFibGVzID0ge31cbiAgICBAb3B0aW9uX2hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcHRpb25zJylcblxuICBjbGVhck9wdGlvbnM6IC0+XG4gICAgQG9wdGlvbl9ob2xkZXIuaW5uZXJIVE1MID0gXCJcIlxuXG4gIGFkZE9wdGlvbnM6IC0+XG4gICAgQGNsZWFyT3B0aW9ucygpXG4gICAgc2VsZiA9IEBcbiAgICBmb3IgdHlwZSwgb3B0aW9ucyBvZiBAdmFyaWFibGVzXG4gICAgICBob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgaG9sZGVyLmNsYXNzTGlzdC5hZGQoJ3R5cGUnKVxuXG4gICAgICBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpXG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSB0eXBlXG5cbiAgICAgIGhvbGRlci5hcHBlbmRDaGlsZChoZWFkZXIpXG5cbiAgICAgIGZvciBvcHRpb24sIHZhbHVlIG9mIG9wdGlvbnNcbiAgICAgICAgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gICAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gb3B0aW9uLnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgICBsYWJlbC5zdHlsZS50ZXh0VHJhbnNmb3JtID0gJ2NhcGl0YWxpemUnXG5cbiAgICAgICAgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdudW1iZXInKVxuICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlXG4gICAgICAgIGlucHV0LmRhdGFzZXRbJ3R5cGUnXSA9IHR5cGVcbiAgICAgICAgaW5wdXQuZGF0YXNldFsnb3B0aW9uJ10gPSBvcHRpb25cbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAtPlxuICAgICAgICAgIGVsZW1lbnQgPSBAXG4gICAgICAgICAgaWYgZWxlbWVudC5kYXRhc2V0LnVwZGF0ZVRpbWVvdXQgdGhlbiBjbGVhclRpbWVvdXQgZWxlbWVudC5kYXRhc2V0LnVwZGF0ZVRpbWVvdXRcbiAgICAgICAgICBlbGVtZW50LmRhdGFzZXQudXBkYXRlVGltZW91dCA9IHNldFRpbWVvdXQoKCAtPlxuICAgICAgICAgICAgc2VsZi53cml0ZVZhbHVlKGVsZW1lbnQuZGF0YXNldC50eXBlLCBlbGVtZW50LmRhdGFzZXQub3B0aW9uLCBlbGVtZW50LnZhbHVlKVxuICAgICAgICAgICAgZWxlbWVudC5kYXRhc2V0LnVwZGF0ZVRpbWVvdXQgPSBudWxsXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZGRkJ1xuICAgICAgICAgICAgc2V0VGltZW91dCgoIC0+IGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmZmYnKSwgMTAwKVxuICAgICAgICAgICksIDUwMClcblxuICAgICAgICApXG5cbiAgICAgICAgaG9sZGVyLmFwcGVuZENoaWxkKGxhYmVsKVxuICAgICAgICBob2xkZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSlcbiAgICAgICAgaG9sZGVyLmFwcGVuZENoaWxkKGlucHV0KVxuICAgICAgICBob2xkZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSlcblxuICAgICAgQG9wdGlvbl9ob2xkZXIuYXBwZW5kQ2hpbGQoaG9sZGVyKVxuICAgIG51bGxcblxuICB3cml0ZVZhbHVlOiAodHlwZSwgb3B0aW9uLCB2YWx1ZSkgLT5cbiAgICBAbGlzdGVuZXIodHlwZSwgb3B0aW9uLCBwYXJzZUZsb2F0KHZhbHVlKSlcblxuICBzZXRWYXJpYWJsZXM6ICh2YXJpYWJsZXMpIC0+XG4gICAgQHZhcmlhYmxlcyA9IHZhcmlhYmxlc1xuICAgIEBhZGRPcHRpb25zKClcblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb25NYW5hZ2VyIiwiY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21haW4nXG5jYW52YXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMjU1KSdcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbmltYWdlX2RhdGEgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzLnNldFNpemUgPSAoeCwgeSkgLT5cbiAgY29udGV4dC5jYW52YXMud2lkdGggPSB4XG4gIGNvbnRleHQuY2FudmFzLmhlaWdodCA9IHlcbiAgaW1hZ2VfZGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhIHgsIHlcblxubW9kdWxlLmV4cG9ydHMud3JpdGVJbWFnZSA9IChkYXRhKSAtPlxuICBpbWFnZV9kYXRhLmRhdGFbaV09diBmb3IgdiwgaSBpbiBkYXRhXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlX2RhdGEsIDAsIDApXG4iLCIjIyNcbiAgQ29sb3IgUG9uZFxuIyMjXG5cbmZwc190YXJnZXQgPSAyMFxuXG5yZW5kZXIgPSByZXF1aXJlICcuL2xpYi9yZW5kZXInXG5mcHMgPSByZXF1aXJlKCcuL2xpYi9mcHMnKSgpXG5PcHRpb25NYW5hZ2VyID0gcmVxdWlyZSgnLi9saWIvb3B0aW9uTWFuYWdlcicpXG5cbndvcmtlciA9IG5ldyBXb3JrZXIoJ2J1aWxkL3Byb2Nlc3MuanMnKTtcbnJpZ2h0X3BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0X3BhbmVsJylcbmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJylcbnN0YXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXRzJylcbmZsb3dfc2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxvdycpXG5zZWVkX2hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWVkX2hvbGRlcicpXG5zZWVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlZWQnKVxub3B0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcHRpb25zJylcblxuc2VlZC52YWx1ZSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwKVxuXG5cblt4LCB5XSA9IHJlcXVpcmUoJy4vbGliL29wdGltYWxSZXNvbHV0aW9uJykoKVxuXG5zdGF0cy50ZXh0Q29udGVudCA9IFwiVFBTOiA/PyB8IEZQUzogPz9cIlxucmVuZGVyLnNldFNpemUgeCwgeVxuXG5kaWRfaW5pdCA9IGZhbHNlXG5cbm9wdGlvbk1hbmFnZXIgPSBuZXcgT3B0aW9uTWFuYWdlcigodHlwZSwgdmFyaWFibGUsIHZhbHVlKSAtPiB3b3JrZXIucG9zdE1lc3NhZ2UgWyd1cGRhdGVWYXJpYWJsZScsIHR5cGUsIHZhcmlhYmxlLFxuICB2YWx1ZV0pXG5cbndvcmtlci5wb3N0TWVzc2FnZSBbJ2dldFZhcmlhYmxlcyddXG53b3JrZXIub25tZXNzYWdlID0gKGUpIC0+XG4gIHN3aXRjaCBlLmRhdGFbMF1cbiAgICB3aGVuICdpbWFnZURhdGEnXG4gICAgICBmcHMudGljaygpXG4gICAgICByZW5kZXIud3JpdGVJbWFnZSBlLmRhdGFbMV1cbiAgICB3aGVuICd0cG0nXG4gICAgICBzdGF0cy50ZXh0Q29udGVudCA9IFwiVFBTOiAje01hdGgucm91bmQoZS5kYXRhWzFdKX0gfCBGUFM6ICN7TWF0aC5yb3VuZChmcHMuZ2V0RnBzKCkpfVwiXG4gICAgd2hlbiAnaW5pdGlhbGl6ZWQnXG4gICAgICBzZXRJbnRlcnZhbCAoIC0+XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSBbJ3NlbmRUUFMnXVxuICAgICAgKSwgMTAwMFxuXG4gICAgICBzZXRJbnRlcnZhbCAoIC0+XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSBbJ3NlbmRJbWFnZURhdGEnXVxuICAgICAgKSwgMTAwMCAvIGZwc190YXJnZXRcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSBbJ3N0YXJ0J11cbiAgICB3aGVuICd2YXJpYWJsZXMnXG4gICAgICBvcHRpb25NYW5hZ2VyLnNldFZhcmlhYmxlcyhlLmRhdGFbMV0pXG5cbmNhbnZhcy5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+XG4gIGlmIHJpZ2h0X3BhbmVsLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpXG4gICAgcmlnaHRfcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXG4gIGVsc2VcbiAgICByaWdodF9wYW5lbC5jbGFzc0xpc3QuYWRkKCdzaG93JylcbiAgdHJ1ZVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKS5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIC0+XG4gIGlmIGRpZF9pbml0XG4gICAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc3RhcnQnXVxuICBlbHNlXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlIFsnaW5pdCcsIHgsIHksIHNlZWQudmFsdWVdXG4gICAgcmlnaHRfcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXG4gICAgb3B0aW9ucy5zdHlsZS50b3AgPSAnNjBweCdcbiAgICBzZWVkX2hvbGRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAtPiB3b3JrZXIucG9zdE1lc3NhZ2UgWydzdG9wJ10pO1xuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlX3BpeGVsJykuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAtPlxuICBpZiBjYW52YXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdwaXhlbGVkJylcbiAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgncGl4ZWxlZCcpXG4gIGVsc2VcbiAgICBjYW52YXMuY2xhc3NMaXN0LmFkZCgncGl4ZWxlZCcpXG5cbmZsb3dfc2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lciAnY2hhbmdlJywgLT5cbiAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc2V0Rmxvd1R5cGUnLCB0aGlzLnZhbHVlXVxuXG4iXX0=
