(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Simple object to keep track of FPS
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Calculates the width and height that gives approximately the total area at the ratio of the screen size
 */
module.exports = function() {
  var dx, dy, ideal, s1, s2, s3, screenX, screenY;
  ideal = 40000;
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Handles the adjustment of options
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Simple renderer. More to come here in time
 */
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
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Does everything needed in the main browser thread, including starting the webworker. Need to move a lot
  of this logic to separate files
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
    worker.postMessage(['init', x, y, seed.value, flow.value]);
    right_panel.classList.remove('show');
    return seed.setAttribute('readonly', 'readonly');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL2Zwcy5jb2ZmZWUiLCJzcmMvbGliL29wdGltYWxSZXNvbHV0aW9uLmNvZmZlZSIsInNyYy9saWIvb3B0aW9uTWFuYWdlci5jb2ZmZWUiLCJzcmMvbGliL3JlbmRlci5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7Ozs7Ozs7QUFRQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsTUFBQTtFQUFBLGVBQUEsR0FBa0I7RUFDbEIsVUFBQSxHQUFhO0VBQ2IsU0FBQSxHQUFnQixJQUFBLElBQUEsQ0FBQTtTQUNoQjtJQUNFLElBQUEsRUFBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFJO01BQ2hCLFNBQUEsR0FBWSxTQUFBLEdBQVk7TUFDeEIsVUFBQSxJQUFjLENBQUMsU0FBQSxHQUFZLFVBQWIsQ0FBQSxHQUEyQjthQUN6QyxTQUFBLEdBQVk7SUFKUCxDQURUO0lBTUUsTUFBQSxFQUFTLFNBQUE7YUFDUCxJQUFBLEdBQU87SUFEQSxDQU5YOztBQUplOzs7OztBQ1JqQjs7Ozs7OztBQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7QUFDZixNQUFBO0VBQUEsS0FBQSxHQUFRO0VBQ1IsT0FBQSxHQUFVLE1BQU0sQ0FBQztFQUNqQixPQUFBLEdBQVUsTUFBTSxDQUFDO0VBRWpCLElBQUcsT0FBQSxHQUFVLE9BQWI7SUFDRSxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLE9BQUEsR0FBUSxPQUFULENBQUEsR0FBa0IsR0FBN0IsQ0FBQSxHQUFrQztJQUN2QyxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFBLEdBQU0sRUFBakI7SUFDTCxFQUFBLEdBQUssSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsQ0FBWDtJQUNMLEVB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ZCxDQUErQixRQUEvQixFQUF5QyxTQUFBO1NBQ3ZDLE1BQU0sQ0FBQyxXQUFQLENBQW1CLENBQUMsYUFBRCxFQUFnQixJQUFJLENBQUMsS0FBckIsQ0FBbkI7QUFEdUMsQ0FBekMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIFNpbXBsZSBvYmplY3QgdG8ga2VlcCB0cmFjayBvZiBGUFNcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGZpbHRlcl9zdHJlbmd0aCA9IDIwXG4gIGZyYW1lX3RpbWUgPSAwXG4gIGxhc3RfbG9vcCA9IG5ldyBEYXRlKClcbiAge1xuICAgIHRpY2sgOiAtPlxuICAgICAgdGhpc19sb29wID0gbmV3IERhdGVcbiAgICAgIHRoaXNfdGltZSA9IHRoaXNfbG9vcCAtIGxhc3RfbG9vcFxuICAgICAgZnJhbWVfdGltZSArPSAodGhpc190aW1lIC0gZnJhbWVfdGltZSkgLyBmaWx0ZXJfc3RyZW5ndGhcbiAgICAgIGxhc3RfbG9vcCA9IHRoaXNfbG9vcFxuICAgIGdldEZwcyA6IC0+XG4gICAgICAxMDAwIC8gZnJhbWVfdGltZVxuICB9XG5cblxuIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIENhbGN1bGF0ZXMgdGhlIHdpZHRoIGFuZCBoZWlnaHQgdGhhdCBnaXZlcyBhcHByb3hpbWF0ZWx5IHRoZSB0b3RhbCBhcmVhIGF0IHRoZSByYXRpbyBvZiB0aGUgc2NyZWVuIHNpemVcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlkZWFsID0gNDAwMDBcbiAgc2NyZWVuWCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gIHNjcmVlblkgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuICBpZihzY3JlZW5YID4gc2NyZWVuWSlcbiAgICBzMSA9IE1hdGgucm91bmQoKHNjcmVlblgvc2NyZWVuWSkqMTAwKS8xMDBcbiAgICBzMiA9IE1hdGguZmxvb3IoaWRlYWwvczEpXG4gICAgczMgPSBNYXRoLmZsb29yKE1hdGguc3FydChzMikpXG4gICAgZHggPSBNYXRoLmZsb29yKHMxKnMzKVxuICAgIGR5ID0gczNcbiAgZWxzZVxuICAgIHMxID0gTWF0aC5yb3VuZCgoc2NyZWVuWS9zY3JlZW5YKSoxMDApLzEwMFxuICAgIHMyID0gTWF0aC5mbG9vcihpZGVhbC9zMSlcbiAgICBzMyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KHMyKSlcbiAgICBkeSA9IE1hdGguZmxvb3IoczEqczMpXG4gICAgZHggPSBzM1xuICBbZHgsIGR5XSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBIYW5kbGVzIHRoZSBhZGp1c3RtZW50IG9mIG9wdGlvbnNcbiMjI1xuXG5jbGFzcyBPcHRpb25NYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQGxpc3RlbmVyKSAtPlxuICAgIEB2YXJpYWJsZXMgPSB7fVxuICAgIEBvcHRpb25faG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wdGlvbnMnKVxuXG4gIGNsZWFyT3B0aW9uczogLT5cbiAgICBAb3B0aW9uX2hvbGRlci5pbm5lckhUTUwgPSBcIlwiXG5cbiAgYWRkT3B0aW9uczogLT5cbiAgICBAY2xlYXJPcHRpb25zKClcbiAgICBzZWxmID0gQFxuICAgIGZvciB0eXBlLCBvcHRpb25zIG9mIEB2YXJpYWJsZXNcbiAgICAgIGhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBob2xkZXIuY2xhc3NMaXN0LmFkZCgndHlwZScpXG5cbiAgICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJylcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IHR5cGVcblxuICAgICAgaG9sZGVyLmFwcGVuZENoaWxkKGhlYWRlcilcblxuICAgICAgZm9yIG9wdGlvbiwgdmFsdWUgb2Ygb3B0aW9uc1xuICAgICAgICBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJylcbiAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBvcHRpb24ucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgICAgIGxhYmVsLnN0eWxlLnRleHRUcmFuc2Zvcm0gPSAnY2FwaXRhbGl6ZSdcblxuICAgICAgICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ251bWJlcicpXG4gICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWVcbiAgICAgICAgaW5wdXQuZGF0YXNldFsndHlwZSddID0gdHlwZVxuICAgICAgICBpbnB1dC5kYXRhc2V0WydvcHRpb24nXSA9IG9wdGlvblxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIC0+XG4gICAgICAgICAgZWxlbWVudCA9IEBcbiAgICAgICAgICBpZiBlbGVtZW50LmRhdGFzZXQudXBkYXRlVGltZW91dCB0aGVuIGNsZWFyVGltZW91dCBlbGVtZW50LmRhdGFzZXQudXBkYXRlVGltZW91dFxuICAgICAgICAgIGVsZW1lbnQuZGF0YXNldC51cGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dCgoIC0+XG4gICAgICAgICAgICBzZWxmLndyaXRlVmFsdWUoZWxlbWVudC5kYXRhc2V0LnR5cGUsIGVsZW1lbnQuZGF0YXNldC5vcHRpb24sIGVsZW1lbnQudmFsdWUpXG4gICAgICAgICAgICBlbGVtZW50LmRhdGFzZXQudXBkYXRlVGltZW91dCA9IG51bGxcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNkZGQnXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCggLT4gZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZicpLCAxMDApXG4gICAgICAgICAgKSwgNTAwKVxuXG4gICAgICAgIClcblxuICAgICAgICBob2xkZXIuYXBwZW5kQ2hpbGQobGFiZWwpXG4gICAgICAgIGhvbGRlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKVxuICAgICAgICBob2xkZXIuYXBwZW5kQ2hpbGQoaW5wdXQpXG4gICAgICAgIGhvbGRlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKVxuXG4gICAgICBAb3B0aW9uX2hvbGRlci5hcHBlbmRDaGlsZChob2xkZXIpXG4gICAgbnVsbFxuXG4gIHdyaXRlVmFsdWU6ICh0eXBlLCBvcHRpb24sIHZhbHVlKSAtPlxuICAgIEBsaXN0ZW5lcih0eXBlLCBvcHRpb24sIHBhcnNlRmxvYXQodmFsdWUpKVxuXG4gIHNldFZhcmlhYmxlczogKHZhcmlhYmxlcykgLT5cbiAgICBAdmFyaWFibGVzID0gdmFyaWFibGVzXG4gICAgQGFkZE9wdGlvbnMoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbk1hbmFnZXIiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgU2ltcGxlIHJlbmRlcmVyLiBNb3JlIHRvIGNvbWUgaGVyZSBpbiB0aW1lXG4jIyNcblxuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21haW4nXG5jYW52YXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMjU1KSdcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbmltYWdlX2RhdGEgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzLnNldFNpemUgPSAoeCwgeSkgLT5cbiAgY29udGV4dC5jYW52YXMud2lkdGggPSB4XG4gIGNvbnRleHQuY2FudmFzLmhlaWdodCA9IHlcbiAgaW1hZ2VfZGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhIHgsIHlcblxubW9kdWxlLmV4cG9ydHMud3JpdGVJbWFnZSA9IChkYXRhKSAtPlxuICBpbWFnZV9kYXRhLmRhdGFbaV09diBmb3IgdiwgaSBpbiBkYXRhXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlX2RhdGEsIDAsIDApXG4iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgRG9lcyBldmVyeXRoaW5nIG5lZWRlZCBpbiB0aGUgbWFpbiBicm93c2VyIHRocmVhZCwgaW5jbHVkaW5nIHN0YXJ0aW5nIHRoZSB3ZWJ3b3JrZXIuIE5lZWQgdG8gbW92ZSBhIGxvdFxuICBvZiB0aGlzIGxvZ2ljIHRvIHNlcGFyYXRlIGZpbGVzXG4jIyNcblxuZnBzX3RhcmdldCA9IDIwXG5cbnJlbmRlciA9IHJlcXVpcmUgJy4vbGliL3JlbmRlcidcbmZwcyA9IHJlcXVpcmUoJy4vbGliL2ZwcycpKClcbk9wdGlvbk1hbmFnZXIgPSByZXF1aXJlKCcuL2xpYi9vcHRpb25NYW5hZ2VyJylcblxud29ya2VyID0gbmV3IFdvcmtlcignYnVpbGQvcHJvY2Vzcy5qcycpO1xucmlnaHRfcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmlnaHRfcGFuZWwnKVxuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKVxuc3RhdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdHMnKVxuZmxvd19zZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbG93JylcbnNlZWRfaG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlZWRfaG9sZGVyJylcbnNlZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VlZCcpXG5vcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wdGlvbnMnKVxuXG5zZWVkLnZhbHVlID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMDAwMDApXG5cblxuW3gsIHldID0gcmVxdWlyZSgnLi9saWIvb3B0aW1hbFJlc29sdXRpb24nKSgpXG5cbnN0YXRzLnRleHRDb250ZW50ID0gXCJUUFM6ID8/IHwgRlBTOiA/P1wiXG5yZW5kZXIuc2V0U2l6ZSB4LCB5XG5cbmRpZF9pbml0ID0gZmFsc2Vcblxub3B0aW9uTWFuYWdlciA9IG5ldyBPcHRpb25NYW5hZ2VyKCh0eXBlLCB2YXJpYWJsZSwgdmFsdWUpIC0+IHdvcmtlci5wb3N0TWVzc2FnZSBbJ3VwZGF0ZVZhcmlhYmxlJywgdHlwZSwgdmFyaWFibGUsXG4gIHZhbHVlXSlcblxud29ya2VyLnBvc3RNZXNzYWdlIFsnZ2V0VmFyaWFibGVzJ11cbndvcmtlci5vbm1lc3NhZ2UgPSAoZSkgLT5cbiAgc3dpdGNoIGUuZGF0YVswXVxuICAgIHdoZW4gJ2ltYWdlRGF0YSdcbiAgICAgIGZwcy50aWNrKClcbiAgICAgIHJlbmRlci53cml0ZUltYWdlIGUuZGF0YVsxXVxuICAgIHdoZW4gJ3RwbSdcbiAgICAgIHN0YXRzLnRleHRDb250ZW50ID0gXCJUUFM6ICN7TWF0aC5yb3VuZChlLmRhdGFbMV0pfSB8IEZQUzogI3tNYXRoLnJvdW5kKGZwcy5nZXRGcHMoKSl9XCJcbiAgICB3aGVuICdpbml0aWFsaXplZCdcbiAgICAgIHNldEludGVydmFsICggLT5cbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc2VuZFRQUyddXG4gICAgICApLCAxMDAwXG5cbiAgICAgIHNldEludGVydmFsICggLT5cbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc2VuZEltYWdlRGF0YSddXG4gICAgICApLCAxMDAwIC8gZnBzX3RhcmdldFxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlIFsnc3RhcnQnXVxuICAgIHdoZW4gJ3ZhcmlhYmxlcydcbiAgICAgIG9wdGlvbk1hbmFnZXIuc2V0VmFyaWFibGVzKGUuZGF0YVsxXSlcblxuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT5cbiAgaWYgcmlnaHRfcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JylcbiAgICByaWdodF9wYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93JylcbiAgZWxzZVxuICAgIHJpZ2h0X3BhbmVsLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKVxuICB0cnVlXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT5cbiAgaWYgZGlkX2luaXRcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UgWydzdGFydCddXG4gIGVsc2VcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UgWydpbml0JywgeCwgeSwgc2VlZC52YWx1ZSwgZmxvdy52YWx1ZV1cbiAgICByaWdodF9wYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93JylcbiAgICBzZWVkLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAncmVhZG9ubHknKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgLT4gd29ya2VyLnBvc3RNZXNzYWdlIFsnc3RvcCddKTtcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZV9waXhlbCcpLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgLT5cbiAgaWYgY2FudmFzLmNsYXNzTGlzdC5jb250YWlucygncGl4ZWxlZCcpXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ3BpeGVsZWQnKVxuICBlbHNlXG4gICAgY2FudmFzLmNsYXNzTGlzdC5hZGQoJ3BpeGVsZWQnKVxuXG5mbG93X3NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIgJ2NoYW5nZScsIC0+XG4gIHdvcmtlci5wb3N0TWVzc2FnZSBbJ3NldEZsb3dUeXBlJywgdGhpcy52YWx1ZV1cblxuIl19
