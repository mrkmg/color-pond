(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BaseEntity;

BaseEntity = (function() {
  BaseEntity.prototype.name = 'Base';

  function BaseEntity() {
    this.is_moveable = true;
    this.is_deleted = false;
    this.color = [0, 0, 0, 255];
  }

  BaseEntity.prototype.init = function(map, index) {
    this.map = map;
    this.map_index = index;
    return this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);
  };

  BaseEntity.prototype.moved = function(new_index) {
    this.map_index = new_index;
    return this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);
  };

  BaseEntity.prototype.setColor = function(r, g, b, a) {
    var image_index;
    if (!this.is_deleted) {
      this.color = [r, g, b, a];
      image_index = this.map_index * 4;
      this.map._image[image_index] = r;
      this.map._image[image_index + 1] = g;
      this.map._image[image_index + 2] = b;
      return this.map._image[image_index + 3] = a;
    }
  };

  BaseEntity.prototype.tick = function() {
    return !this.is_deleted;
  };

  return BaseEntity;

})();

module.exports = BaseEntity;


},{}],2:[function(require,module,exports){
var ComplexMaterialEntity, FlowingEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FlowingEntity = require('./FlowingEntity');

ComplexMaterialEntity = (function(superClass) {
  extend(ComplexMaterialEntity, superClass);

  ComplexMaterialEntity.prototype.name = 'ComplexMaterial';

  function ComplexMaterialEntity() {
    ComplexMaterialEntity.__super__.constructor.apply(this, arguments);
    this.type = Math.floor(Math.random() * 3);
    this.is_moveable = false;
    switch (this.type) {
      case 0:
        this.color = [255, 200, 0, 255];
        break;
      case 1:
        this.color = [255, 125, 0, 255];
        break;
      case 2:
        this.color = [255, 50, 0, 255];
    }
  }

  return ComplexMaterialEntity;

})(FlowingEntity);

module.exports = ComplexMaterialEntity;


},{"./FlowingEntity":4}],3:[function(require,module,exports){
var BaseEntity, EmptyEntity, maxBrightness, minBrightness,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

minBrightness = 10;

maxBrightness = 20;

EmptyEntity = (function(superClass) {
  extend(EmptyEntity, superClass);

  EmptyEntity.prototype.name = 'Empty';

  function EmptyEntity() {
    EmptyEntity.__super__.constructor.call(this);
    this.color = [25, 25, 25, 255];
  }

  EmptyEntity.prototype.tick = function() {
    var colors, current_color, increment, ind;
    colors = this.color.concat();
    ind = Math.floor(Math.random() * 3);
    current_color = colors[ind];
    increment = (Math.floor(Math.random() * 3) - 1) * 3;
    colors[ind] = Math.min(maxBrightness, Math.max(minBrightness, current_color + increment));
    this.setColor(colors[0], colors[1], colors[2], colors[3]);
    return EmptyEntity.__super__.tick.call(this);
  };

  return EmptyEntity;

})(BaseEntity);

module.exports = EmptyEntity;


},{"./BaseEntity":1}],4:[function(require,module,exports){
var BaseEntity, FlowingEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

FlowingEntity = (function(superClass) {
  extend(FlowingEntity, superClass);

  FlowingEntity.prototype.name = 'Flowing';

  function FlowingEntity() {
    FlowingEntity.__super__.constructor.apply(this, arguments);
  }

  FlowingEntity.prototype.tick = function() {
    var direction, entity;
    return FlowingEntity.__super__.tick.call(this) && (direction = this.map.flow(this.map_index), entity = this.map.getEntityAtDirection(this.map_index, direction), entity && entity.is_moveable ? this.map.swapEntities(this.map_index, entity.map_index) : void 0, true);
  };

  return FlowingEntity;

})(BaseEntity);

module.exports = FlowingEntity;


},{"./BaseEntity":1}],5:[function(require,module,exports){
var BaseEntity, EmptyEntity, ProducerEntity, shuffle,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

EmptyEntity = require('./EmptyEntity');

shuffle = function(array) {
  var counter, index, temp;
  counter = array.length;
  while (counter > 0) {
    index = Math.floor(Math.random() * counter);
    counter--;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
};

ProducerEntity = (function(superClass) {
  extend(ProducerEntity, superClass);

  ProducerEntity.prototype.name = 'Producer';

  function ProducerEntity() {
    ProducerEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    this.color = [0, 255, 0, 255];
    this.health = 300;
    this.wants = Math.floor(Math.random() * 3);
    this.makes = Math.floor(Math.random() * 3);
  }

  ProducerEntity.prototype.processSides = function() {
    var countFriendly, entity, i, len, newPiece, ref, side;
    countFriendly = 0;
    ref = shuffle(['up', 'down', 'left', 'right']);
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      entity = this.map.getEntityAtDirection(this.map_index, side);
      if (entity) {
        if (entity.name === 'Producer' && entity.wants === this.wants) {
          countFriendly++;
          if (this.health > entity.health + 5) {
            this.health -= 5;
            entity.health += 5;
          }
        }
        if (entity.name === 'RawMaterial' && entity.type === this.wants) {
          this.health += 500;
          this.map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true);
        }
        if (entity.name === 'Empty' && this.health > 600) {
          newPiece = new ProducerEntity();
          newPiece.wants = this.wants;
          newPiece.makes = this.makes;
          this.map.assignEntityToIndex(entity.map_index, newPiece, true);
        }
      }
    }
    return {
      countFriendly: countFriendly
    };
  };

  ProducerEntity.prototype.tick = function() {
    var counts;
    return ProducerEntity.__super__.tick.call(this) && (counts = this.processSides(), counts.countFriendly < 4 ? this.health-- : void 0, this.health <= 0 ? this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true) : void 0, this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, Math.round((this.health / 500) * 255))));
  };

  return ProducerEntity;

})(BaseEntity);

module.exports = ProducerEntity;


},{"./BaseEntity":1,"./EmptyEntity":3}],6:[function(require,module,exports){
var FlowingEntity, RawMaterialEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FlowingEntity = require('./FlowingEntity');

RawMaterialEntity = (function(superClass) {
  extend(RawMaterialEntity, superClass);

  RawMaterialEntity.prototype.name = 'RawMaterial';

  function RawMaterialEntity() {
    RawMaterialEntity.__super__.constructor.apply(this, arguments);
    this.type = Math.floor(Math.random() * 3);
    this.is_moveable = true;
    switch (this.type) {
      case 0:
        this.color = [0, 200, 255, 255];
        break;
      case 1:
        this.color = [0, 125, 255, 255];
        break;
      case 2:
        this.color = [0, 50, 255, 255];
    }
  }

  return RawMaterialEntity;

})(FlowingEntity);

module.exports = RawMaterialEntity;


},{"./FlowingEntity":4}],7:[function(require,module,exports){
var BaseEntity, RoamingEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

RoamingEntity = (function(superClass) {
  extend(RoamingEntity, superClass);

  RoamingEntity.prototype.name = 'Roaming';

  function RoamingEntity() {
    RoamingEntity.__super__.constructor.call(this);
    this.is_moveable = false;
    this.color = [255, 255, 255, 255];
  }

  RoamingEntity.prototype.tick = function() {
    var direction, entity;
    direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
    entity = this.map.getEntityAtDirection(this.map_index, direction);
    if (entity && entity.is_moveable) {
      return this.map.swapEntities(this.map_index, entity.map_index);
    }
  };

  return RoamingEntity;

})(BaseEntity);

module.exports = RoamingEntity;


},{"./BaseEntity":1}],8:[function(require,module,exports){
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

module.exports.spiral = function(width, height) {
  var center_x, center_y, directions, division_angle, maxDistance, mx, my;
  center_x = Math.floor(width / 2);
  center_y = Math.floor(height / 2);
  division_angle = Math.floor(360 / 4);
  maxDistance = Math.sqrt(Math.pow(width - center_x, 2) + Math.pow(height - center_y, 2));
  mx = 1;
  my = 1;
  if (width > height) {
    mx = height / width;
  } else {
    my = width / height;
  }
  directions = ['right', 'down', 'left', 'up'];
  return function(index) {
    var angle, dec, direction, distance, dx, dy, intp, x, y;
    if (Math.random() > .5) {
      return directions[Math.floor(Math.random() * 4)];
    } else {
      x = index % width;
      y = Math.floor(index / width);
      dx = (x - center_x) * mx;
      dy = (y - center_y + 1) * my;
      distance = Math.sin((Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / maxDistance) * 10);
      angle = Math.floor(((((Math.atan2(dy, dx) * 180) / Math.PI) + distance).mod(360) / division_angle) * 100) / 100;
      intp = Math.floor(angle);
      dec = Math.floor((angle - intp) * 100);
      direction = Math.random() * 100 > dec ? (intp + 1).mod(4) : (intp + 2).mod(4);
      return directions[direction];
    }
  };
};


},{}],9:[function(require,module,exports){
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


},{}],10:[function(require,module,exports){
var ComplexMaterialEntity, EmptyEntity, Map, ProducerEntity, RawMaterialEntity, RoamingEntity, flow;

EmptyEntity = require('../entities/EmptyEntity');

RoamingEntity = require('../entities/RoamingEntity');

RawMaterialEntity = require('../entities/RawMaterialEntity');

ComplexMaterialEntity = require('../entities/ComplexMaterialEntity');

ProducerEntity = require('../entities/ProducerEntity');

flow = require('./flow');

Map = (function() {
  Map.prototype._map = [];

  Map.prototype._tick = 0;

  Map.prototype._pointToIndex = function(x, y) {
    return x * this.width + y;
  };

  Map.prototype._indexToPoint = function(index) {
    return [index % this.width, Math.floor(index / this.width)];
  };

  Map.prototype._image = null;

  Map.prototype._counts = {
    Base: 0,
    Empty: 0,
    RawMaterial: 0,
    Roaming: 0,
    ComplexMaterial: 0,
    Producer: 0
  };

  Map.prototype._raw_ratio = .05;

  Map.prototype._complex_ratio = .01;

  Map.prototype._roamer_ratio = .0001;

  Map.prototype._producer_ratio = .001;

  Map.prototype._checkRawRatio = function() {
    var i, j, ref, results, target_count;
    target_count = Math.floor(this._raw_ratio * this._map.length) - this._counts.RawMaterial;
    if (target_count > 0) {
      results = [];
      for (j = 0, ref = target_count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        results.push((function() {
          var ref1;
          while (true) {
            i = Math.floor(Math.random() * (this._map.length - 1));
            if (((ref1 = this.getEntityAtIndex(i)) != null ? ref1.name : void 0) !== !'Empty') {
              break;
            }
          }
          return this.assignEntityToIndex(i, new RawMaterialEntity(), true);
        }).call(this));
      }
      return results;
    }
  };

  Map.prototype._checkComplexRatio = function() {
    var i, j, ref, results, target_count;
    target_count = Math.floor(this._complex_ratio * this._map.length) - this._counts.ComplexMaterial;
    if (target_count > 0) {
      results = [];
      for (j = 0, ref = target_count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        results.push((function() {
          var ref1;
          while (true) {
            i = Math.floor(Math.random() * (this._map.length - 1));
            if (((ref1 = this.getEntityAtIndex(i)) != null ? ref1.name : void 0) !== !'Empty') {
              break;
            }
          }
          return this.assignEntityToIndex(i, new ComplexMaterialEntity(), true);
        }).call(this));
      }
      return results;
    }
  };

  Map.prototype._checkRoamerRatio = function() {
    var i, j, ref, results, target_count;
    target_count = Math.floor(this._roamer_ratio * this._map.length) - this._counts.Roaming;
    if (target_count > 0) {
      console.log(target_count);
      results = [];
      for (j = 0, ref = target_count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        results.push((function() {
          var ref1;
          while (true) {
            i = Math.floor(Math.random() * (this._map.length - 1));
            if (((ref1 = this.getEntityAtIndex(i)) != null ? ref1.name : void 0) !== !'Empty') {
              break;
            }
          }
          return this.assignEntityToIndex(i, new RoamingEntity(), true);
        }).call(this));
      }
      return results;
    }
  };

  Map.prototype._checkProducerRatio = function() {
    var i, j, ref, results, target_count;
    target_count = Math.floor(this._producer_ratio * this._map.length) - this._counts.Producer;
    if (target_count > 0) {
      console.log(target_count);
      results = [];
      for (j = 0, ref = target_count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        results.push((function() {
          var ref1;
          while (true) {
            i = Math.floor(Math.random() * (this._map.length - 1));
            if (((ref1 = this.getEntityAtIndex(i)) != null ? ref1.name : void 0) !== !'Empty') {
              break;
            }
          }
          return this.assignEntityToIndex(i, new ProducerEntity(), true);
        }).call(this));
      }
      return results;
    }
  };

  function Map(width, height) {
    var i, j, ref;
    this.width = width;
    this.height = height;
    this.flow = flow.spiral(this.width, this.height);
    this._image = new Uint8Array(this.width * this.height * 4);
    for (i = j = 0, ref = this.width * this.height - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.assignEntityToIndex(i, new EmptyEntity(), true);
    }
  }

  Map.prototype.tick = function() {
    var entity, j, len, ref, results;
    this._checkRawRatio();
    this._checkRoamerRatio();
    this._checkProducerRatio();
    this._tick++;
    ref = (this._tick % 2 === 0 ? this._map.slice() : this._map.slice().reverse());
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      entity = ref[j];
      results.push(entity.tick());
    }
    return results;
  };

  Map.prototype.getRender = function() {
    return this._image;
  };

  Map.prototype.getEntityAtXY = function(x, y) {
    return this.getEntityAtIndex(this._pointToIndex(x, y));
  };

  Map.prototype.getEntityAtIndex = function(index) {
    if (this._map[index] != null) {
      return this._map[index];
    } else {
      return false;
    }
  };

  Map.prototype.swapEntities = function(index1, index2) {
    var ent1, ent2;
    ent1 = this.getEntityAtIndex(index1);
    ent2 = this.getEntityAtIndex(index2);
    this.assignEntityToIndex(index1, ent2);
    this.assignEntityToIndex(index2, ent1);
    ent1.is_deleted = false;
    return ent2.is_deleted = false;
  };

  Map.prototype.getEntityAtDirection = function(index, direction) {
    switch (direction) {
      case 'up':
        if (index > this.width - 1) {
          return this.getEntityAtIndex(index - this.width);
        }
        break;
      case 'down':
        if (index < this._map.length - 1) {
          return this.getEntityAtIndex(index + this.width);
        }
        break;
      case 'left':
        if (index % this.width > 0) {
          return this.getEntityAtIndex(index - 1);
        }
        break;
      case 'right':
        if (index % this.width < this.width - 1) {
          return this.getEntityAtIndex(index + 1);
        }
    }
  };

  Map.prototype.assignEntityToIndex = function(index, entity, is_new) {
    var current_entity;
    if (is_new == null) {
      is_new = false;
    }
    current_entity = this.getEntityAtIndex(index);
    if (current_entity) {
      current_entity.is_deleted = true;
      this._counts[current_entity.name]--;
    }
    this._counts[entity.name]++;
    this._map[index] = entity;
    entity.is_deleted = false;
    if (is_new) {
      return entity.init(this, index);
    } else {
      return entity.moved(index);
    }
  };

  Map.prototype.$$dumpMap = function() {
    return console.debug(this._map);
  };

  return Map;

})();

module.exports = Map;


},{"../entities/ComplexMaterialEntity":2,"../entities/EmptyEntity":3,"../entities/ProducerEntity":5,"../entities/RawMaterialEntity":6,"../entities/RoamingEntity":7,"./flow":8}],11:[function(require,module,exports){
var Map, fps, init, map, map_tick_int, running, sendImageData, sendTPS, start, stop, tick;

Map = require('./lib/map');

fps = require('./lib/fps')();

map = null;

running = false;

map_tick_int = -1;

tick = function() {
  map.tick();
  fps.tick();
  if (running) {
    return setTimeout(tick, 10);
  }
};

init = function(width, height) {
  map = new Map(width, height);
  return self.postMessage(['initialized']);
};

start = function() {
  running = true;
  self.postMessage(['started']);
  return tick();
};

stop = function() {
  running = falsethen;
  clearTimeout(map_tick_int);
  return self.postMessage(['stopped']);
};

sendImageData = function() {
  return self.postMessage(['imageData', map.getRender()]);
};

sendTPS = function() {
  return self.postMessage(['tpm', fps.getFps()]);
};

self.onmessage = function(e) {
  switch (e.data[0]) {
    case 'init':
      return init(e.data[1], e.data[2]);
    case 'start':
      return start();
    case 'stop':
      return stop();
    case 'sendImageData':
      return sendImageData();
    case 'sendTPS':
      return sendTPS();
    default:
      return console.error("Unknown Command " + e.data[0]);
  }
};


},{"./lib/fps":9,"./lib/map":10}]},{},[11]);
