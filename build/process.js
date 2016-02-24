(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],2:[function(require,module,exports){
var BaseEntity;

BaseEntity = (function() {
  BaseEntity.prototype.name = 'Base';

  function BaseEntity() {
    this.is_moveable = true;
    this.is_deleted = false;
    this.color = [0, 0, 0, 255];
  }

  BaseEntity.prototype.init = function(map, index) {
    var ref;
    this.map = map;
    this.map_index = index;
    ref = this.map._indexToPoint(index), this.map_x = ref[0], this.map_y = ref[1];
    this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);
    return true;
  };

  BaseEntity.prototype.moved = function(new_index) {
    var ref;
    this.map_index = new_index;
    ref = this.map._indexToPoint(new_index), this.map_x = ref[0], this.map_y = ref[1];
    this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);
    return true;
  };

  BaseEntity.prototype.setColor = function(r, g, b, a) {
    var image_index;
    if (!this.is_deleted) {
      this.color = [r, g, b, a];
      image_index = this.map_index * 4;
      this.map._image[image_index] = r;
      this.map._image[image_index + 1] = g;
      this.map._image[image_index + 2] = b;
      this.map._image[image_index + 3] = a;
      return true;
    } else {
      return false;
    }
  };

  BaseEntity.prototype.tick = function() {
    return !this.is_deleted;
  };

  return BaseEntity;

})();

module.exports = BaseEntity;


},{}],3:[function(require,module,exports){
var ComplexMaterialEntity, FlowingEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FlowingEntity = require('./FlowingEntity');

ComplexMaterialEntity = (function(superClass) {
  extend(ComplexMaterialEntity, superClass);

  ComplexMaterialEntity.prototype.name = 'ComplexMaterial';

  function ComplexMaterialEntity(type) {
    this.type = type != null ? type : Math.floor(Math.random() * 3);
    ComplexMaterialEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    switch (this.type) {
      case 0:
        this.color = [255, 0, 0, 255];
        break;
      case 1:
        this.color = [255, 50, 50, 255];
        break;
      case 2:
        this.color = [255, 100, 100, 255];
    }
  }

  return ComplexMaterialEntity;

})(FlowingEntity);

module.exports = ComplexMaterialEntity;


},{"./FlowingEntity":6}],4:[function(require,module,exports){
var BaseEntity, EdgeEntity, directions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

directions = ['right', 'down', 'left', 'up'];

EdgeEntity = (function(superClass) {
  extend(EdgeEntity, superClass);

  EdgeEntity.prototype.name = 'Edge';

  function EdgeEntity() {
    EdgeEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    this.color = [50, 50, 50, 255];
  }

  return EdgeEntity;

})(BaseEntity);

module.exports = EdgeEntity;


},{"./BaseEntity":2}],5:[function(require,module,exports){
var BaseEntity, EmptyEntity, maxBrightness, minBrightness,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

minBrightness = 0;

maxBrightness = 20;

EmptyEntity = (function(superClass) {
  extend(EmptyEntity, superClass);

  EmptyEntity.prototype.name = 'Empty';

  function EmptyEntity() {
    EmptyEntity.__super__.constructor.call(this);
    this.color = [0, 0, 0, 255];
  }

  EmptyEntity.prototype.tick = function() {
    return EmptyEntity.__super__.tick.call(this) && false;
  };

  return EmptyEntity;

})(BaseEntity);

module.exports = EmptyEntity;


},{"./BaseEntity":2}],6:[function(require,module,exports){
var BaseEntity, FlowingEntity, directions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

directions = ['right', 'down', 'left', 'up'];

FlowingEntity = (function(superClass) {
  extend(FlowingEntity, superClass);

  FlowingEntity.prototype.name = 'Flowing';

  function FlowingEntity() {
    FlowingEntity.__super__.constructor.apply(this, arguments);
  }

  FlowingEntity.prototype.tick = function() {
    var direction, entity;
    if (FlowingEntity.__super__.tick.call(this)) {
      direction = Math.random() > .5 ? directions[Math.floor(Math.random() * 4)] : this.map.flow(this.map_index);
      entity = this.map.getEntityAtDirection(this.map_index, direction);
      if (entity && entity.is_moveable) {
        this.map.swapEntities(this.map_index, entity.map_index);
      } else {

      }
      return true;
    } else {
      return false;
    }
  };

  return FlowingEntity;

})(BaseEntity);

module.exports = FlowingEntity;


},{"./BaseEntity":2}],7:[function(require,module,exports){
var BaseEntity, EmptyEntity, LivingEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

EmptyEntity = require('./EmptyEntity');

LivingEntity = (function(superClass) {
  extend(LivingEntity, superClass);

  function LivingEntity() {
    LivingEntity.__super__.constructor.apply(this, arguments);
    this.max_health = 400;
  }

  LivingEntity.prototype.died = function() {};

  LivingEntity.prototype.tick = function() {
    return LivingEntity.__super__.tick.call(this) && (this.health <= 0 ? (this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true), this.died(), false) : (this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, 20 + Math.round((this.health / this.max_health) * 235))), true));
  };

  return LivingEntity;

})(BaseEntity);

module.exports = LivingEntity;


},{"./BaseEntity":2,"./EmptyEntity":5}],8:[function(require,module,exports){
var ComplexMaterialEntity, EmptyEntity, LivingEntity, ProducerEntity, fixmod, shuffle, variableHolder,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LivingEntity = require('./LivingEntity');

EmptyEntity = require('./EmptyEntity');

ComplexMaterialEntity = require('./ComplexMaterialEntity');

shuffle = require('../lib/shuffleArray');

variableHolder = require('../lib/variableHolder').ProducerEntity;

fixmod = function(m, n) {
  return ((m % n) + n) % n;
};

ProducerEntity = (function(superClass) {
  extend(ProducerEntity, superClass);

  ProducerEntity.prototype.name = 'Producer';

  function ProducerEntity(wants) {
    this.wants = wants != null ? wants : Math.floor(Math.random() * 3);
    ProducerEntity.__super__.constructor.apply(this, arguments);
    this.makes = fixmod(this.wants + 1, 3);
    this.is_moveable = false;
    this.color = [0, 255, 0, 255];
    this.health = variableHolder.starting_life;
    this.max_health = variableHolder.max_life;
    this.last_ate = 0;
    this.age = 0;
  }

  ProducerEntity.prototype.getSides = function() {
    var i, len, ref, results, side;
    ref = shuffle(['up', 'down', 'left', 'right']);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push(this.map.getEntityAtDirection(this.map_index, side));
    }
    return results;
  };

  ProducerEntity.prototype.eat = function(entities) {
    var entity, i, len, results;
    results = [];
    for (i = 0, len = entities.length; i < len; i++) {
      entity = entities[i];
      if (this.health < this.max_health) {
        results.push((this.last_ate = 0, this.age = 0, this.health += variableHolder.life_gain_per_food, this.map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)));
      }
    }
    return results;
  };

  ProducerEntity.prototype.transferHealth = function(entities) {
    var entity, i, len, needs;
    for (i = 0, len = entities.length; i < len; i++) {
      entity = entities[i];
      needs = (this.health < variableHolder.min_life_to_transfer && entity.health > variableHolder.min_life_to_transfer ? Math.floor(this.health * .9) : ((this.health < variableHolder.min_life_to_transfer && entity.health < variableHolder.min_life_to_transfer) || (this.health > variableHolder.min_life_to_transfer && entity.health > variableHolder.min_life_to_transfer)) && this.health > entity.health ? Math.min(Math.ceil((this.health - entity.health) / 2), variableHolder.max_life_transfer) : 0);
      if (needs > 0) {
        this.health -= needs;
        entity.health += needs;
      }
    }
    return true;
  };

  ProducerEntity.prototype.reproduce = function(entities) {
    var entity, i, len, results;
    results = [];
    for (i = 0, len = entities.length; i < len; i++) {
      entity = entities[i];
      if (this.health >= variableHolder.life_to_reproduce) {
        results.push((this.health -= variableHolder.life_loss_to_reproduce, this.map.assignEntityToIndex(entity.map_index, new ProducerEntity(this.wants), true), this.age = 0));
      }
    }
    return results;
  };

  ProducerEntity.prototype.died = function() {
    return this.map.assignEntityToIndex(this.map_index, new ComplexMaterialEntity(this.makes), true);
  };

  ProducerEntity.prototype.tick = function() {
    var consumable_entities, entity, friendly_entities, placeable_entities, sides;
    if (ProducerEntity.__super__.tick.call(this)) {
      this.last_ate++;
      this.age++;
      sides = (function() {
        var i, len, ref, results;
        ref = this.getSides();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          entity = ref[i];
          if (entity) {
            results.push(entity);
          }
        }
        return results;
      }).call(this);
      placeable_entities = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = sides.length; i < len; i++) {
          entity = sides[i];
          if (entity.name === "Empty") {
            results.push(entity);
          }
        }
        return results;
      })();
      friendly_entities = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = sides.length; i < len; i++) {
          entity = sides[i];
          if (entity.name === "Producer" && entity.wants === this.wants && entity.makes === this.makes) {
            results.push(entity);
          }
        }
        return results;
      }).call(this);
      consumable_entities = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = sides.length; i < len; i++) {
          entity = sides[i];
          if (entity.name === "RawMaterial" && entity.type === this.wants) {
            results.push(entity);
          }
        }
        return results;
      }).call(this);
      this.transferHealth(friendly_entities);
      if (this.age > variableHolder.age_to_reproduce && Math.pow(friendly_entities.length + 1, 2) / 16 > Math.random()) {
        this.reproduce(placeable_entities);
      }
      if (this.last_ate > variableHolder.eating_cooldown) {
        this.eat(consumable_entities);
      }
      if (friendly_entities.length === 4) {
        this.age = 0;
        this.color[1] = 255;
        this.health -= 1;
      } else {
        this.health -= 2;
        this.color[1] = 200;
      }
      if (this.age / variableHolder.old_age_death_multiplier > Math.random()) {
        this.died();
      }
      return true;
    } else {
      return false;
    }
  };

  return ProducerEntity;

})(LivingEntity);

module.exports = ProducerEntity;


},{"../lib/shuffleArray":15,"../lib/variableHolder":16,"./ComplexMaterialEntity":3,"./EmptyEntity":5,"./LivingEntity":7}],9:[function(require,module,exports){
var FlowingEntity, RawMaterialEntity,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FlowingEntity = require('./FlowingEntity');

RawMaterialEntity = (function(superClass) {
  extend(RawMaterialEntity, superClass);

  RawMaterialEntity.prototype.name = 'RawMaterial';

  function RawMaterialEntity(type) {
    this.type = type != null ? type : Math.floor(Math.random() * 3);
    RawMaterialEntity.__super__.constructor.apply(this, arguments);
    switch (this.type) {
      case 0:
        this.color = [0, 0, 255, 255];
        break;
      case 1:
        this.color = [50, 50, 255, 255];
        break;
      case 2:
        this.color = [100, 100, 255, 255];
    }
  }

  return RawMaterialEntity;

})(FlowingEntity);

module.exports = RawMaterialEntity;


},{"./FlowingEntity":6}],10:[function(require,module,exports){
var EmptyEntity, LivingEntity, RawMaterialEntity, RoamingEntity, directions, search_radius, shuffle, variables,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LivingEntity = require('./LivingEntity');

EmptyEntity = require('./EmptyEntity');

shuffle = require('../lib/shuffleArray');

RawMaterialEntity = require('./RawMaterialEntity');

variables = require('../lib/variableHolder.coffee').RoamingEntity;

search_radius = 10;

directions = ['right', 'down', 'left', 'up'];

RoamingEntity = (function(superClass) {
  extend(RoamingEntity, superClass);

  RoamingEntity.prototype.name = 'Roaming';

  function RoamingEntity() {
    RoamingEntity.__super__.constructor.call(this);
    this.max_health = variables.max_life;
    this.is_moveable = false;
    this.health = variables.starting_health_fresh;
    this.color = [255, 255, 0, 255];
    this.stuck_count = 0;
    this.stuck_cooldown = 0;
  }

  RoamingEntity.prototype.chooseDirection = function() {
    return this.wanted_direction = directions[Math.floor(Math.random() * 4)];
  };

  RoamingEntity.prototype.doMovement = function() {
    var all_entities, direction, dx, dy, entity, filtered_entities, self, target_entity, x_neg, x_pos, y, y_neg, y_pos;
    self = this;
    if (this.stuck_count > variables.stuck_ticks) {
      this.chooseDirection();
      this.stuck_cooldown = variables.stuck_cooldown;
    }
    if (this.stuck_cooldown > 0) {
      this.stuck_cooldown--;
      this.wanted_direction;
    }
    direction = ((function() {
      var i, ref, ref1;
      if (this.stuck_cooldown > 0) {
        this.stuck_cooldown--;
        return false;
      } else {
        x_neg = Math.max(this.map_x - search_radius, 0);
        y_neg = Math.max(this.map_y - search_radius, 0);
        x_pos = Math.min(this.map_x + search_radius, this.map.width);
        y_pos = Math.min(this.map_y + search_radius, this.map.height);
        all_entities = [];
        for (y = i = ref = y_neg, ref1 = y_pos; ref <= ref1 ? i <= ref1 : i >= ref1; y = ref <= ref1 ? ++i : --i) {
          all_entities = all_entities.concat(self.map.getEntitiesInRange(self.map._pointToIndex(x_neg, y), self.map._pointToIndex(x_pos, y)));
        }
        filtered_entities = all_entities.filter(function(entity) {
          return entity.name === 'ComplexMaterial';
        });
        filtered_entities.sort(function(ent_a, ent_b) {
          var a_distance, b_distance;
          a_distance = Math.sqrt(Math.pow(ent_a.map_x - self.map_x, 2) + Math.pow(ent_a.map_y - self.map_y, 2));
          b_distance = Math.sqrt(Math.pow(ent_b.map_x - self.map_x, 2) + Math.pow(ent_b.map_y - self.map_y, 2));
          if (a_distance < b_distance) {
            return -1;
          } else if (a_distance > b_distance) {
            return 1;
          } else {
            return 0;
          }
        });
        if (filtered_entities.length) {
          target_entity = filtered_entities[0];
          dx = target_entity.map_x - self.map_x;
          dy = target_entity.map_y - self.map_y;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              return 'right';
            } else {
              return 'left';
            }
          } else {
            if (dy > 0) {
              return 'down';
            } else {
              return 'up';
            }
          }
        } else {
          return false;
        }
      }
    }).call(this));
    if (!direction) {
      if (Math.random() > .9) {
        this.chooseDirection();
      }
      direction = this.wanted_direction;
    }
    entity = this.map.getEntityAtDirection(this.map_index, direction);
    if (entity && entity.name !== 'Edge') {
      this.map.swapEntities(this.map_index, entity.map_index);
      return this.stuck_count = 0;
    } else {
      return this.stuck_count++;
    }
  };

  RoamingEntity.prototype.consumeMaterial = function() {
    var entity, i, len, ref, results, side;
    ref = shuffle(['up', 'down', 'left', 'right']);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push((entity = this.map.getEntityAtDirection(this.map_index, side), entity ? entity.name === 'ComplexMaterial' ? (this.map.assignEntityToIndex(entity.map_index, new RawMaterialEntity(entity.type), true), this.health += variables.life_gain_per_food) : void 0 : void 0));
    }
    return results;
  };

  RoamingEntity.prototype.reproduce = function() {
    var child, entity, i, len, ref, side;
    if (this.health > variables.life_to_reproduce) {
      ref = shuffle(['up', 'down', 'left', 'right']);
      for (i = 0, len = ref.length; i < len; i++) {
        side = ref[i];
        entity = this.map.getEntityAtDirection(this.map_index, side);
        if (entity && entity.name === 'Empty') {
          child = new RoamingEntity();
          child.health = variables.starting_health_clone;
          this.map.assignEntityToIndex(entity.map_index, child, true);
          this.health -= variables.life_loss_to_reproduce;
          break;
        }
      }
    }
    return true;
  };

  RoamingEntity.prototype.tick = function() {
    if (RoamingEntity.__super__.tick.call(this)) {
      this.consumeMaterial();
      this.doMovement();
      this.reproduce();
      return this.health--;
    } else {
      return false;
    }
  };

  return RoamingEntity;

})(LivingEntity);

module.exports = RoamingEntity;


},{"../lib/shuffleArray":15,"../lib/variableHolder.coffee":16,"./EmptyEntity":5,"./LivingEntity":7,"./RawMaterialEntity":9}],11:[function(require,module,exports){
var Simple1DNoise;

Simple1DNoise = function() {
  var MAX_VERTICES, MAX_VERTICES_MASK, amplitude, getVal, i, lerp, r, scale;
  MAX_VERTICES = 256;
  MAX_VERTICES_MASK = MAX_VERTICES - 1;
  amplitude = 1;
  scale = .015;
  r = [];
  i = 0;
  while (i < MAX_VERTICES) {
    r.push(Math.random());
    ++i;
  }
  getVal = function(x) {
    var scaledX, t, tRemapSmoothstep, xFloor, xMax, xMin, y;
    scaledX = x * scale;
    xFloor = Math.floor(scaledX);
    t = scaledX - xFloor;
    tRemapSmoothstep = t * t * (3 - (2 * t));
    xMin = xFloor & MAX_VERTICES_MASK;
    xMax = xMin + 1 & MAX_VERTICES_MASK;
    y = lerp(r[xMin], r[xMax], tRemapSmoothstep);
    return y * amplitude;
  };

  /**
  * Linear interpolation function.
  * @param a The lower integer value
  * @param b The upper integer value
  * @param t The value between the two
  * @returns {number}
   */
  lerp = function(a, b, t) {
    return a * (1 - t) + b * t;
  };
  return {
    getVal: getVal,
    setAmplitude: function(newAmplitude) {
      amplitude = newAmplitude;
    },
    setScale: function(newScale) {
      scale = newScale;
    }
  };
};

module.exports = Simple1DNoise;


},{}],12:[function(require,module,exports){
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

module.exports.dual_spirals = function(width, height, map) {
  var center_x, center_y, z;
  center_x = Math.floor(width / 2);
  center_y = Math.floor(height / 2);
  z = 1;
  return function(index) {
    var dx, dy, mx, q, rand, x, y;
    x = index % width;
    y = Math.floor(index / width);
    dx = x - center_x;
    dy = y - center_y;
    mx = Math.abs(dx);
    q = (dy > 0 ? mx < center_x / 2 ? 0 : 1 : mx > center_x / 2 ? 2 : 3);
    rand = Math.random() >= .5;
    if (dx > 0) {
      switch (q) {
        case 0:
          if (rand) {
            return 'up';
          } else {
            return 'left';
          }
          break;
        case 1:
          if (rand) {
            return 'left';
          } else {
            return 'down';
          }
          break;
        case 2:
          if (rand) {
            return 'down';
          } else {
            return 'right';
          }
          break;
        case 3:
          if (rand) {
            return 'right';
          } else {
            return 'up';
          }
      }
    } else {
      switch (q) {
        case 0:
          if (rand) {
            return 'up';
          } else {
            return 'right';
          }
          break;
        case 1:
          if (rand) {
            return 'right';
          } else {
            return 'down';
          }
          break;
        case 2:
          if (rand) {
            return 'down';
          } else {
            return 'left';
          }
          break;
        case 3:
          if (rand) {
            return 'left';
          } else {
            return 'up';
          }
      }
    }
  };
};

module.exports.opposite_spirals = function(width, height, map) {
  var center_x, center_y, z;
  center_x = Math.floor(width / 2);
  center_y = Math.floor(height / 2);
  z = 1;
  return function(index) {
    var dx, dy, mx, q, rand, x, y;
    x = index % width;
    y = Math.floor(index / width);
    dx = x - center_x;
    dy = y - center_y;
    mx = Math.abs(dx);
    q = (dy > 0 ? mx < center_x / 2.5 ? 0 : 1 : mx > center_x / 2.5 ? 2 : 3);
    rand = Math.random() >= .49;
    if (dx > 0) {
      switch (q) {
        case 0:
          if (rand) {
            return 'left';
          } else {
            return 'up';
          }
          break;
        case 1:
          if (rand) {
            return 'down';
          } else {
            return 'left';
          }
          break;
        case 2:
          if (rand) {
            return 'right';
          } else {
            return 'down';
          }
          break;
        case 3:
          if (rand) {
            return 'up';
          } else {
            return 'right';
          }
      }
    } else {
      switch (q) {
        case 0:
          if (rand) {
            return 'down';
          } else {
            return 'left';
          }
          break;
        case 1:
          if (rand) {
            return 'left';
          } else {
            return 'up';
          }
          break;
        case 2:
          if (rand) {
            return 'up';
          } else {
            return 'right';
          }
          break;
        case 3:
          if (rand) {
            return 'right';
          } else {
            return 'down';
          }
      }
    }
  };
};

module.exports.tight_spiral = function(width, height, map) {
  var center_x, center_y;
  center_x = Math.floor(width / 2);
  center_y = Math.floor(height / 2);
  return function(index) {
    var dx, dy, x, y;
    x = index % width;
    y = Math.floor(index / width);
    dx = x - center_x;
    dy = y - center_y;
    if (dx > 0 && dy >= 0) {
      if (Math.random() < Math.abs(dx) / center_x) {
        return 'up';
      } else {
        return 'right';
      }
    } else if (dx >= 0 && dy < 0) {
      if (Math.random() < Math.abs(dy) / center_y) {
        return 'left';
      } else {
        return 'up';
      }
    } else if (dx < 0 && dy <= 0) {
      if (Math.random() < Math.abs(dx) / center_x) {
        return 'down';
      } else {
        return 'left';
      }
    } else if (dx <= 0 && dy > 0) {
      if (Math.random() < Math.abs(dy) / center_y) {
        return 'right';
      } else {
        return 'down';
      }
    } else {
      return ['right', 'down', 'left', 'up'][Math.floor(Math.random() * 4)];
    }
  };
};

module.exports.spiral = function(width, height) {
  var angle, center_x, center_y, directions, distance, division_angle, dx, dy, i, index, maxDistance, mx, my, pointCache, ref, x, y;
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
  pointCache = [];
  for (index = i = 0, ref = width * height - 1; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
    x = index % width;
    y = Math.floor(index / width);
    dx = (x - center_x) * mx;
    dy = (y - center_y + 1) * my;
    distance = Math.sin((Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / maxDistance) * 10);
    angle = Math.floor(((((Math.atan2(dy, dx) * 180) / Math.PI) + distance).mod(360) / division_angle) * 100) / 100;
    pointCache[index] = angle;
  }
  return function(index) {
    var dec, direction, intp;
    angle = pointCache[index];
    intp = Math.floor(angle);
    dec = Math.floor((angle - intp) * 100);
    direction = Math.random() * 90 > dec ? (intp + 1).mod(4) : (intp + 2).mod(4);
    return directions[direction];
  };
};


},{}],13:[function(require,module,exports){
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


},{}],14:[function(require,module,exports){
var ComplexMaterialEntity, EdgeEntity, EmptyEntity, Map, ProducerEntity, RawMaterialEntity, RoamingEntity, Simple1DNoise, flow, shuffle, variables;

EmptyEntity = require('../entities/EmptyEntity');

RoamingEntity = require('../entities/RoamingEntity');

RawMaterialEntity = require('../entities/RawMaterialEntity');

ComplexMaterialEntity = require('../entities/ComplexMaterialEntity');

ProducerEntity = require('../entities/ProducerEntity');

EdgeEntity = require('../entities/EdgeEntity');

flow = require('./flow');

shuffle = require('./shuffleArray');

variables = require('./variableHolder').Map;

Simple1DNoise = require('./Simple1DNoise');

Map = (function() {
  Map.prototype._map = [];

  Map.prototype._tick = 0;

  Map.prototype._image = null;

  Map.prototype._counts = {
    Base: 0,
    Empty: 0,
    RawMaterial: 0,
    Roaming: 0,
    ComplexMaterial: 0,
    Producer: 0
  };

  function Map(width, height, flow_type) {
    var i, j, k, ref;
    this.width = width;
    this.height = height;
    this.flow = flow[flow_type](this.width, this.height, this);
    this._image = new Uint8Array(this.width * this.height * 4);
    for (i = j = 0, ref = this.width * this.height - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.assignEntityToIndex(i, new EmptyEntity(), true);
    }
    this.makeBorder();
    for (k = 0; k <= 8; k++) {
      this._addProducer();
    }
  }

  Map.prototype.makeBorder = function() {
    var i, j, k, l, m, n, noise, o, out, p, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, results, x, x_multiplier, y, y_multiplier;
    x_multiplier = Math.round(this.width * .03);
    y_multiplier = Math.round(this.height * .03);
    noise = Simple1DNoise();
    noise.setScale(.09);
    i = 0;
    for (x = j = 0, ref = this.width; 0 <= ref ? j < ref : j > ref; x = 0 <= ref ? ++j : --j) {
      out = Math.ceil(noise.getVal(x) * y_multiplier);
      for (i = k = 0, ref1 = out; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        this.assignEntityToIndex(this._pointToIndex(x, i - 1), new EdgeEntity(), true);
      }
    }
    for (y = l = 0, ref2 = this.height; 0 <= ref2 ? l < ref2 : l > ref2; y = 0 <= ref2 ? ++l : --l) {
      out = Math.ceil(noise.getVal(y) * x_multiplier);
      for (i = m = 0, ref3 = out; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        this.assignEntityToIndex(this._pointToIndex(i - 1, y), new EdgeEntity(), true);
      }
    }
    for (x = n = 0, ref4 = this.width; 0 <= ref4 ? n < ref4 : n > ref4; x = 0 <= ref4 ? ++n : --n) {
      out = Math.ceil(noise.getVal(x) * y_multiplier);
      for (i = o = ref5 = this.height, ref6 = this.height - out; ref5 <= ref6 ? o < ref6 : o > ref6; i = ref5 <= ref6 ? ++o : --o) {
        this.assignEntityToIndex(this._pointToIndex(x, i - 1), new EdgeEntity(), true);
      }
    }
    results = [];
    for (y = p = 0, ref7 = this.height; 0 <= ref7 ? p < ref7 : p > ref7; y = 0 <= ref7 ? ++p : --p) {
      out = Math.ceil(noise.getVal(y) * x_multiplier);
      results.push((function() {
        var q, ref8, ref9, results1;
        results1 = [];
        for (i = q = ref8 = this.width, ref9 = this.width - out; ref8 <= ref9 ? q < ref9 : q > ref9; i = ref8 <= ref9 ? ++q : --q) {
          results1.push(this.assignEntityToIndex(this._pointToIndex(i - 1, y), new EdgeEntity(), true));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Map.prototype.setFlowType = function(type) {
    return this.flow = flow[type](this.width, this.height);
  };

  Map.prototype.tick = function() {
    var entity, j, k, len, needed_material, ref, ref1;
    needed_material = this._getNeededMaterialCount();
    if (needed_material > 0) {
      for (j = 0, ref = needed_material; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        this._addMaterial();
      }
    }
    if (Math.random() * 10000 < variables.chance_roamer_spawn) {
      this._addRoamer();
    }
    if (Math.random() * 10000 < variables.chance_producer_spawn) {
      this._addProducer();
    }
    ref1 = shuffle(this._map.slice());
    for (k = 0, len = ref1.length; k < len; k++) {
      entity = ref1[k];
      entity.tick();
    }
    return this._tick++;
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

  Map.prototype.getEntitiesInRange = function(index_min, index_max) {
    return this._map.slice(index_min, index_max + 1);
  };

  Map.prototype.swapEntities = function(index1, index2) {
    var ent1, ent2;
    ent1 = this.getEntityAtIndex(index1);
    ent2 = this.getEntityAtIndex(index2);
    this.assignEntityToIndex(index1, ent2);
    this.assignEntityToIndex(index2, ent1);
    ent1.is_deleted = false;
    ent2.is_deleted = false;
    return true;
  };

  Map.prototype.getEntityAtDirection = function(index, direction) {
    switch (direction) {
      case 'up':
        if (index > this.width - 1) {
          return this.getEntityAtIndex(index - this.width);
        } else {
          return false;
        }
        break;
      case 'down':
        if (index < this._map.length - 1) {
          return this.getEntityAtIndex(index + this.width);
        } else {
          return false;
        }
        break;
      case 'left':
        if (index % this.width > 0) {
          return this.getEntityAtIndex(index - 1);
        } else {
          return false;
        }
        break;
      case 'right':
        if (index % this.width < this.width - 1) {
          return this.getEntityAtIndex(index + 1);
        } else {
          return false;
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
      entity.init(this, index);
    } else {
      entity.moved(index);
    }
    return true;
  };

  Map.prototype._pointToIndex = function(x, y) {
    return x + this.width * y;
  };

  Map.prototype._indexToPoint = function(index) {
    return [index % this.width, Math.floor(index / this.width)];
  };

  Map.prototype._addEntityToEmpty = function(type) {
    var i, ref;
    while (true) {
      i = Math.floor(Math.random() * (this._map.length - 1));
      if (((ref = this.getEntityAtIndex(i)) != null ? ref.name : void 0) === 'Empty') {
        break;
      }
    }
    return this.assignEntityToIndex(i, new type(), true);
  };

  Map.prototype._getNeededMaterialCount = function() {
    return Math.floor(this._map.length * variables.empty_ratio) - this._counts.ComplexMaterial - this._counts.RawMaterial - this._counts.Producer;
  };

  Map.prototype._addMaterial = function() {
    return this._addEntityToEmpty(RawMaterialEntity);
  };

  Map.prototype._addComplexMaterial = function() {
    return this._addEntityToEmpty(ComplexMaterialEntity);
  };

  Map.prototype._addRoamer = function() {
    return this._addEntityToEmpty(RoamingEntity);
  };

  Map.prototype._addProducer = function() {
    return this._addEntityToEmpty(ProducerEntity);
  };

  Map.prototype.$$dumpMap = function() {
    return console.debug(this._map);
  };

  return Map;

})();

module.exports = Map;


},{"../entities/ComplexMaterialEntity":3,"../entities/EdgeEntity":4,"../entities/EmptyEntity":5,"../entities/ProducerEntity":8,"../entities/RawMaterialEntity":9,"../entities/RoamingEntity":10,"./Simple1DNoise":11,"./flow":12,"./shuffleArray":15,"./variableHolder":16}],15:[function(require,module,exports){
module.exports = function(array) {
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


},{}],16:[function(require,module,exports){
var variables;

variables = {
  Map: {
    empty_ratio: .1,
    chance_producer_spawn: 100,
    chance_roamer_spawn: 100
  },
  ProducerEntity: {
    starting_life: 200,
    life_gain_per_food: 1200,
    life_to_reproduce: 600,
    life_loss_to_reproduce: 400,
    max_life: 600,
    min_life_to_transfer: 50,
    max_life_transfer: 50,
    eating_cooldown: 10,
    age_to_reproduce: 80,
    old_age_death_multiplier: 10000000
  },
  RoamingEntity: {
    stuck_ticks: 20,
    stuck_cooldown: 20,
    starting_health_fresh: 100,
    starting_health_clone: 20,
    max_life: 200,
    life_gain_per_food: 50,
    life_to_reproduce: 200,
    life_loss_to_reproduce: 50
  }
};

module.exports = variables;


},{}],17:[function(require,module,exports){
var FPS, Map, fps, getVariables, init, map, map_tick_int, running, sendImageData, sendTPS, setFlowType, start, stop, target_tps, tick, updateVariable, variables;

Map = require('./lib/map');

FPS = require('./lib/fps');

variables = require('./lib/variableHolder');

target_tps = 40;

map = null;

running = false;

map_tick_int = -1;

fps = FPS();

tick = function() {
  map.tick();
  fps.tick();
  return null;
};

init = function(width, height, seed, flow) {
  Math.random = require('seedrandom/lib/alea')(seed);
  map = new Map(width, height, flow);
  return self.postMessage(['initialized']);
};

start = function() {
  running = true;
  fps = FPS();
  self.postMessage(['started']);
  clearInterval(map_tick_int);
  return map_tick_int = setInterval(tick, 1000 / target_tps);
};

stop = function() {
  running = false;
  clearInterval(map_tick_int);
  return self.postMessage(['stopped']);
};

sendImageData = function() {
  return self.postMessage(['imageData', map.getRender()]);
};

sendTPS = function() {
  return self.postMessage(['tpm', fps.getFps()]);
};

updateVariable = function(type, variable, value) {
  console.debug("Updating " + type + "." + variable + " to " + value);
  return variables[type][variable] = value;
};

getVariables = function() {
  return self.postMessage(['variables', variables]);
};

setFlowType = function(type) {
  return map.setFlowType(type);
};

self.onmessage = function(e) {
  switch (e.data[0]) {
    case 'init':
      return init(e.data[1], e.data[2], e.data[3], e.data[4]);
    case 'start':
      return start();
    case 'stop':
      return stop();
    case 'sendImageData':
      return sendImageData();
    case 'sendTPS':
      return sendTPS();
    case 'updateVariable':
      return updateVariable(e.data[1], e.data[2], e.data[3]);
    case 'getVariables':
      return getVariables();
    case 'setFlowType':
      return setFlowType(e.data[1]);
    default:
      return console.error("Unknown Command " + e.data[0]);
  }
};


},{"./lib/fps":13,"./lib/map":14,"./lib/variableHolder":16,"seedrandom/lib/alea":1}]},{},[17])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsInNyYy9lbnRpdGllcy9CYXNlRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9Db21wbGV4TWF0ZXJpYWxFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VkZ2VFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VtcHR5RW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9GbG93aW5nRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9MaXZpbmdFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL1Byb2R1Y2VyRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9SYXdNYXRlcmlhbEVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvUm9hbWluZ0VudGl0eS5jb2ZmZWUiLCJzcmMvbGliL1NpbXBsZTFETm9pc2UuY29mZmVlIiwic3JjL2xpYi9mbG93LmNvZmZlZSIsInNyYy9saWIvZnBzLmNvZmZlZSIsInNyYy9saWIvbWFwLmNvZmZlZSIsInNyYy9saWIvc2h1ZmZsZUFycmF5LmNvZmZlZSIsInNyYy9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlIiwic3JjL3Byb2Nlc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QSxDQUFBO0FBSjdCLFNBS08sU0FMUDthQUs2QixPQUFBLENBQUE7QUFMN0IsU0FNTyxnQkFOUDthQU02QixjQUFBLENBQWUsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXRCLEVBQTBCLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFqQyxFQUFxQyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBNUM7QUFON0IsU0FPTyxjQVBQO2FBTzZCLFlBQUEsQ0FBQTtBQVA3QixTQVFPLGFBUlA7YUFRNkIsV0FBQSxDQUFZLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFuQjtBQVI3QjthQVNPLE9BQU8sQ0FBQyxLQUFSLENBQWMsa0JBQUEsR0FBbUIsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXhDO0FBVFA7QUFEZSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy8gXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vLyBcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gQWxlYShzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIG1hc2ggPSBNYXNoKCk7XG5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gMjA5MTYzOSAqIG1lLnMwICsgbWUuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgbWUuczAgPSBtZS5zMTtcbiAgICBtZS5zMSA9IG1lLnMyO1xuICAgIHJldHVybiBtZS5zMiA9IHQgLSAobWUuYyA9IHQgfCAwKTtcbiAgfTtcblxuICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gIG1lLmMgPSAxO1xuICBtZS5zMCA9IG1hc2goJyAnKTtcbiAgbWUuczEgPSBtYXNoKCcgJyk7XG4gIG1lLnMyID0gbWFzaCgnICcpO1xuICBtZS5zMCAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczAgPCAwKSB7IG1lLnMwICs9IDE7IH1cbiAgbWUuczEgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMxIDwgMCkgeyBtZS5zMSArPSAxOyB9XG4gIG1lLnMyIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMiA8IDApIHsgbWUuczIgKz0gMTsgfVxuICBtYXNoID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYyA9IGYuYztcbiAgdC5zMCA9IGYuczA7XG4gIHQuczEgPSBmLnMxO1xuICB0LnMyID0gZi5zMjtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgQWxlYShzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IHhnLm5leHQ7XG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgKiAweDEwMDAwMDAwMCkgfCAwOyB9XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBybmcoKSArIChwcm5nKCkgKiAweDIwMDAwMCB8IDApICogMS4xMTAyMjMwMjQ2MjUxNTY1ZS0xNjsgLy8gMl4tNTNcbiAgfTtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmZ1bmN0aW9uIE1hc2goKSB7XG4gIHZhciBuID0gMHhlZmM4MjQ5ZDtcblxuICB2YXIgbWFzaCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9O1xuXG4gIHJldHVybiBtYXNoO1xufVxuXG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMuYWxlYSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiY2xhc3MgQmFzZUVudGl0eVxuICBuYW1lOiAnQmFzZSdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAaXNfbW92ZWFibGUgPSB0cnVlXG4gICAgQGlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIEBjb2xvciA9IFswLCAwLCAwLCAyNTVdXG5cbiAgaW5pdDogKG1hcCwgaW5kZXgpIC0+XG4gICAgQG1hcCA9IG1hcFxuICAgIEBtYXBfaW5kZXggPSBpbmRleFxuICAgIFtAbWFwX3gsIEBtYXBfeV0gPSBAbWFwLl9pbmRleFRvUG9pbnQoaW5kZXgpXG4gICAgQHNldENvbG9yIEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIEBjb2xvclszXVxuICAgIHRydWVcblxuICBtb3ZlZDogKG5ld19pbmRleCkgLT5cbiAgICBAbWFwX2luZGV4ID0gbmV3X2luZGV4XG4gICAgW0BtYXBfeCwgQG1hcF95XSA9IEBtYXAuX2luZGV4VG9Qb2ludChuZXdfaW5kZXgpXG4gICAgQHNldENvbG9yIEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIEBjb2xvclszXVxuICAgIHRydWVcblxuICBzZXRDb2xvcjogKHIsIGcsIGIsIGEpIC0+XG4gICAgdW5sZXNzIEBpc19kZWxldGVkXG4gICAgICBAY29sb3IgPSBbciwgZywgYiwgYV1cbiAgICAgIGltYWdlX2luZGV4ID0gQG1hcF9pbmRleCAqIDQ7XG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleF0gPSByXG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleCArIDFdID0gZ1xuICAgICAgQG1hcC5faW1hZ2VbaW1hZ2VfaW5kZXggKyAyXSA9IGJcbiAgICAgIEBtYXAuX2ltYWdlW2ltYWdlX2luZGV4ICsgM10gPSBhXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICB0aWNrOiAtPlxuICAgIG5vdCBAaXNfZGVsZXRlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFbnRpdHkiLCJGbG93aW5nRW50aXR5ID0gcmVxdWlyZSAnLi9GbG93aW5nRW50aXR5J1xuXG5jbGFzcyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdDb21wbGV4TWF0ZXJpYWwnXG5cbiAgY29uc3RydWN0b3I6IChAdHlwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSozKSktPlxuICAgIHN1cGVyXG4gICAgQGlzX21vdmVhYmxlID0gZmFsc2VcbiAgICBzd2l0Y2ggQHR5cGVcbiAgICAgIHdoZW4gMFxuICAgICAgICBAY29sb3IgPSBbMjU1LCAwLCAwLCAyNTVdXG4gICAgICB3aGVuIDFcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgNTAsIDUwLCAyNTVdXG4gICAgICB3aGVuIDJcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgMTAwLCAxMDAsIDI1NV1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBsZXhNYXRlcmlhbEVudGl0eSIsIkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5cbmRpcmVjdGlvbnMgPSBbJ3JpZ2h0JywgJ2Rvd24nLCAnbGVmdCcsICd1cCddXG5cbmNsYXNzIEVkZ2VFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdFZGdlJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgQGNvbG9yID0gWzUwLCA1MCwgNTAsIDI1NV1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGdlRW50aXR5IiwiQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcblxubWluQnJpZ2h0bmVzcyA9IDBcbm1heEJyaWdodG5lc3MgPSAyMFxuXG5jbGFzcyBFbXB0eUVudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgbmFtZTogJ0VtcHR5J1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKClcbiAgICBAY29sb3IgPSBbMCwgMCwgMCwgMjU1XVxuXG4gIHRpY2s6IC0+XG4gICAgc3VwZXIoKSBhbmQgKFxuICAgICAgZmFsc2VcbiMgICAgICBjb2xvcnMgPSBAY29sb3IuY29uY2F0KClcbiMgICAgICBpbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKTtcbiMgICAgICBjdXJyZW50X2NvbG9yID0gY29sb3JzW2luZF07XG4jICAgICAgaW5jcmVtZW50ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpIC0gMSkgKiAzXG4jICAgICAgY29sb3JzW2luZF0gPSBNYXRoLm1pbihtYXhCcmlnaHRuZXNzLCBNYXRoLm1heChtaW5CcmlnaHRuZXNzLCBjdXJyZW50X2NvbG9yICsgaW5jcmVtZW50KSlcbiMgICAgICBAc2V0Q29sb3IoY29sb3JzWzBdLCBjb2xvcnNbMV0sIGNvbG9yc1syXSwgY29sb3JzWzNdKVxuICAgIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtcHR5RW50aXR5IiwiQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgRmxvd2luZ0VudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgbmFtZTogJ0Zsb3dpbmcnXG4gIGNvbnN0cnVjdG9yOiAtPiBzdXBlclxuXG4gIHRpY2s6IC0+XG4gICAgaWYgc3VwZXIoKVxuICAgICAgZGlyZWN0aW9uID0gaWYgTWF0aC5yYW5kb20oKSA+IC41IHRoZW4gZGlyZWN0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV0gZWxzZSBAbWFwLmZsb3coQG1hcF9pbmRleClcblxuICAgICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBkaXJlY3Rpb24pXG5cbiAgICAgIGlmIGVudGl0eSBhbmQgZW50aXR5LmlzX21vdmVhYmxlXG4gICAgICAgIEBtYXAuc3dhcEVudGl0aWVzKEBtYXBfaW5kZXgsIGVudGl0eS5tYXBfaW5kZXgpXG4gICAgICBlbHNlXG5cblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gRmxvd2luZ0VudGl0eSIsIkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5FbXB0eUVudGl0eSA9IHJlcXVpcmUgJy4vRW1wdHlFbnRpdHknXG5cbmNsYXNzIExpdmluZ0VudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAbWF4X2hlYWx0aCA9IDQwMFxuXG4gIGRpZWQ6IC0+XG5cbiAgdGljazogLT5cbiAgICBzdXBlcigpIGFuZCAoXG4gICAgICBpZiBAaGVhbHRoIDw9IDBcbiAgICAgICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KEBtYXBfaW5kZXgsIG5ldyBFbXB0eUVudGl0eSgpLCB0cnVlKVxuICAgICAgICBAZGllZCgpXG4gICAgICAgIGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXRDb2xvcihAY29sb3JbMF0sIEBjb2xvclsxXSwgQGNvbG9yWzJdLCBNYXRoLm1pbigyNTUsIDIwICsgTWF0aC5yb3VuZCgoQGhlYWx0aCAvIEBtYXhfaGVhbHRoKSoyMzUpKSlcbiAgICAgICAgdHJ1ZVxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSBMaXZpbmdFbnRpdHkiLCJMaXZpbmdFbnRpdHkgPSByZXF1aXJlICcuL0xpdmluZ0VudGl0eSdcbkVtcHR5RW50aXR5ID0gcmVxdWlyZSAnLi9FbXB0eUVudGl0eSdcbkNvbXBsZXhNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vQ29tcGxleE1hdGVyaWFsRW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZUhvbGRlciA9IHJlcXVpcmUoJy4uL2xpYi92YXJpYWJsZUhvbGRlcicpLlByb2R1Y2VyRW50aXR5XG5cbmZpeG1vZCA9IChtLCBuKSAtPiAoKG0lbikrbiklblxuXG5jbGFzcyBQcm9kdWNlckVudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUHJvZHVjZXInXG5cbiAgY29uc3RydWN0b3I6IChAd2FudHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMykpLT5cbiAgICBzdXBlclxuICAgIEBtYWtlcyA9IGZpeG1vZChAd2FudHMgKyAxLCAzKVxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgQGNvbG9yID0gWzAsIDI1NSwgMCwgMjU1XVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZUhvbGRlci5zdGFydGluZ19saWZlXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZUhvbGRlci5tYXhfbGlmZVxuICAgIEBsYXN0X2F0ZSA9IDBcbiAgICBAYWdlID0gMFxuXG4gIGdldFNpZGVzOiAtPlxuICAgIChAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpIGZvciBzaWRlIGluIHNodWZmbGUgWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXSlcblxuICBlYXQ6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAbGFzdF9hdGUgPSAwXG4gICAgICBAYWdlID0gMFxuICAgICAgQGhlYWx0aCArPSB2YXJpYWJsZUhvbGRlci5saWZlX2dhaW5fcGVyX2Zvb2RcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgRW1wdHlFbnRpdHkoKSwgdHJ1ZSlcbiAgICApIGZvciBlbnRpdHkgaW4gZW50aXRpZXMgd2hlbiBAaGVhbHRoIDwgQG1heF9oZWFsdGhcblxuICB0cmFuc2ZlckhlYWx0aDogKGVudGl0aWVzKSAtPlxuICAgIGZvciBlbnRpdHkgaW4gZW50aXRpZXNcbiAgICAgIG5lZWRzID0gKFxuICAgICAgICBpZiAoQGhlYWx0aCA8IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyIGFuZCBlbnRpdHkuaGVhbHRoID4gdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIpXG4gICAgICAgICAgTWF0aC5mbG9vcihAaGVhbHRoICogLjkpXG4gICAgICAgIGVsc2UgaWYgKChAaGVhbHRoIDwgdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIgYW5kIGVudGl0eS5oZWFsdGggPCB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2Zlcikgb3IgKEBoZWFsdGggPiB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2ZlciBhbmQgZW50aXR5LmhlYWx0aCA+IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyKSkgYW5kIEBoZWFsdGggPiBlbnRpdHkuaGVhbHRoXG4gICAgICAgICAgTWF0aC5taW4oTWF0aC5jZWlsKChAaGVhbHRoIC0gZW50aXR5LmhlYWx0aCkgLyAyKSwgdmFyaWFibGVIb2xkZXIubWF4X2xpZmVfdHJhbnNmZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAwXG4gICAgICApXG5cbiAgICAgIGlmIG5lZWRzID4gMFxuICAgICAgICBAaGVhbHRoIC09IG5lZWRzXG4gICAgICAgIGVudGl0eS5oZWFsdGggKz0gbmVlZHNcblxuICAgIHRydWVcblxuICByZXByb2R1Y2U6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAaGVhbHRoIC09IHZhcmlhYmxlSG9sZGVyLmxpZmVfbG9zc190b19yZXByb2R1Y2VcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgUHJvZHVjZXJFbnRpdHkoQHdhbnRzKSwgdHJ1ZSlcbiAgICAgIEBhZ2UgPSAwXG4gICAgKSBmb3IgZW50aXR5IGluIGVudGl0aWVzIHdoZW4gQGhlYWx0aCA+PSB2YXJpYWJsZUhvbGRlci5saWZlX3RvX3JlcHJvZHVjZVxuXG4gIGRpZWQ6IC0+XG4gICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KEBtYXBfaW5kZXgsIG5ldyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkoQG1ha2VzKSwgdHJ1ZSlcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIEBsYXN0X2F0ZSsrXG4gICAgICBAYWdlKytcblxuICAgICAgc2lkZXMgPSAoZW50aXR5IGZvciBlbnRpdHkgaW4gQGdldFNpZGVzKCkgd2hlbiBlbnRpdHkpXG5cbiAgICAgIHBsYWNlYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiRW1wdHlcIilcbiAgICAgIGZyaWVuZGx5X2VudGl0aWVzID0gKGVudGl0eSBmb3IgZW50aXR5IGluIHNpZGVzIHdoZW4gZW50aXR5Lm5hbWUgaXMgXCJQcm9kdWNlclwiIGFuZCBlbnRpdHkud2FudHMgaXMgQHdhbnRzIGFuZCBlbnRpdHkubWFrZXMgaXMgQG1ha2VzKVxuICAgICAgY29uc3VtYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiUmF3TWF0ZXJpYWxcIiBhbmQgZW50aXR5LnR5cGUgaXMgQHdhbnRzKVxuXG4gICAgICBAdHJhbnNmZXJIZWFsdGgoZnJpZW5kbHlfZW50aXRpZXMpXG5cbiAgICAgIGlmIEBhZ2UgPiB2YXJpYWJsZUhvbGRlci5hZ2VfdG9fcmVwcm9kdWNlIGFuZCBNYXRoLnBvdyhmcmllbmRseV9lbnRpdGllcy5sZW5ndGgrMSwgMikvMTYgPiBNYXRoLnJhbmRvbSgpXG4gICAgICAgIEByZXByb2R1Y2UocGxhY2VhYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBAbGFzdF9hdGUgPiB2YXJpYWJsZUhvbGRlci5lYXRpbmdfY29vbGRvd25cbiAgICAgICAgQGVhdChjb25zdW1hYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBmcmllbmRseV9lbnRpdGllcy5sZW5ndGggaXMgNFxuICAgICAgICBAYWdlID0gMFxuICAgICAgICBAY29sb3JbMV0gPSAyNTVcbiAgICAgICAgQGhlYWx0aCAtPSAxXG4gICAgICBlbHNlXG4gICAgICAgIEBoZWFsdGggLT0gMlxuICAgICAgICBAY29sb3JbMV0gPSAyMDBcblxuICAgICAgaWYgQGFnZSAvIHZhcmlhYmxlSG9sZGVyLm9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllciA+IE1hdGgucmFuZG9tKClcbiAgICAgICAgQGRpZWQoKVxuXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZHVjZXJFbnRpdHkiLCJGbG93aW5nRW50aXR5ID0gcmVxdWlyZSAnLi9GbG93aW5nRW50aXR5J1xuXG5jbGFzcyBSYXdNYXRlcmlhbEVudGl0eSBleHRlbmRzIEZsb3dpbmdFbnRpdHlcbiAgbmFtZTogJ1Jhd01hdGVyaWFsJ1xuXG4gIGNvbnN0cnVjdG9yOiAoQHR5cGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMykpIC0+XG4gICAgc3VwZXJcbiAgICBzd2l0Y2ggQHR5cGVcbiAgICAgIHdoZW4gMFxuICAgICAgICBAY29sb3IgPSBbMCwgMCwgMjU1LCAyNTVdXG4gICAgICB3aGVuIDFcbiAgICAgICAgQGNvbG9yID0gWzUwLCA1MCwgMjU1LCAyNTVdXG4gICAgICB3aGVuIDJcbiAgICAgICAgQGNvbG9yID0gWzEwMCwgMTAwLCAyNTUsIDI1NV1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXdNYXRlcmlhbEVudGl0eSIsIkxpdmluZ0VudGl0eSA9IHJlcXVpcmUgJy4vTGl2aW5nRW50aXR5J1xuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuL0VtcHR5RW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG5SYXdNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vUmF3TWF0ZXJpYWxFbnRpdHknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuLi9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlJykuUm9hbWluZ0VudGl0eVxuXG5zZWFyY2hfcmFkaXVzID0gMTBcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgUm9hbWluZ0VudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUm9hbWluZydcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBzdXBlcigpXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZXMubWF4X2xpZmVcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZXMuc3RhcnRpbmdfaGVhbHRoX2ZyZXNoXG4gICAgQGNvbG9yID0gWzI1NSwgMjU1LCAwLCAyNTVdXG4gICAgQHN0dWNrX2NvdW50ID0gMFxuICAgIEBzdHVja19jb29sZG93biA9IDBcblxuICBjaG9vc2VEaXJlY3Rpb246IC0+XG4gICAgQHdhbnRlZF9kaXJlY3Rpb24gPSBkaXJlY3Rpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXVxuXG4gIGRvTW92ZW1lbnQ6IC0+XG4gICAgc2VsZiA9IEBcblxuICAgIGlmIEBzdHVja19jb3VudCA+IHZhcmlhYmxlcy5zdHVja190aWNrc1xuICAgICAgQGNob29zZURpcmVjdGlvbigpXG4gICAgICBAc3R1Y2tfY29vbGRvd24gPSB2YXJpYWJsZXMuc3R1Y2tfY29vbGRvd25cblxuICAgIGlmIEBzdHVja19jb29sZG93biA+IDBcbiAgICAgIEBzdHVja19jb29sZG93bi0tXG4gICAgICBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZGlyZWN0aW9uID0gKFxuICAgICAgaWYgQHN0dWNrX2Nvb2xkb3duID4gMFxuICAgICAgICBAc3R1Y2tfY29vbGRvd24tLVxuICAgICAgICBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICB4X25lZyA9IE1hdGgubWF4KEBtYXBfeCAtIHNlYXJjaF9yYWRpdXMsIDApXG4gICAgICAgIHlfbmVnID0gTWF0aC5tYXgoQG1hcF95IC0gc2VhcmNoX3JhZGl1cywgMClcbiAgICAgICAgeF9wb3MgPSBNYXRoLm1pbihAbWFwX3ggKyBzZWFyY2hfcmFkaXVzLCBAbWFwLndpZHRoKVxuICAgICAgICB5X3BvcyA9IE1hdGgubWluKEBtYXBfeSArIHNlYXJjaF9yYWRpdXMsIEBtYXAuaGVpZ2h0KVxuXG4gICAgICAgIGFsbF9lbnRpdGllcyA9IFtdXG5cbiAgICAgICAgZm9yIHkgaW4gW3lfbmVnIC4uIHlfcG9zXVxuICAgICAgICAgIGFsbF9lbnRpdGllcyA9IGFsbF9lbnRpdGllcy5jb25jYXQoc2VsZi5tYXAuZ2V0RW50aXRpZXNJblJhbmdlKHNlbGYubWFwLl9wb2ludFRvSW5kZXgoeF9uZWcsIHkpLCBzZWxmLm1hcC5fcG9pbnRUb0luZGV4KHhfcG9zLCB5KSkpXG5cbiAgICAgICAgZmlsdGVyZWRfZW50aXRpZXMgPSBhbGxfZW50aXRpZXMuZmlsdGVyIChlbnRpdHkpIC0+XG4gICAgICAgICAgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcblxuICAgICAgICBmaWx0ZXJlZF9lbnRpdGllcy5zb3J0IChlbnRfYSwgZW50X2IpIC0+XG4gICAgICAgICAgYV9kaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlbnRfYS5tYXBfeCAtIHNlbGYubWFwX3gsIDIpICsgTWF0aC5wb3coZW50X2EubWFwX3kgLSBzZWxmLm1hcF95LCAyKSlcbiAgICAgICAgICBiX2Rpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KGVudF9iLm1hcF94IC0gc2VsZi5tYXBfeCwgMikgKyBNYXRoLnBvdyhlbnRfYi5tYXBfeSAtIHNlbGYubWFwX3ksIDIpKVxuXG4gICAgICAgICAgaWYgYV9kaXN0YW5jZSA8IGJfZGlzdGFuY2UgdGhlbiAtMVxuICAgICAgICAgIGVsc2UgaWYgYV9kaXN0YW5jZSA+IGJfZGlzdGFuY2UgdGhlbiAxXG4gICAgICAgICAgZWxzZSAwXG5cbiAgICAgICAgaWYgZmlsdGVyZWRfZW50aXRpZXMubGVuZ3RoXG4gICAgICAgICAgdGFyZ2V0X2VudGl0eSA9IGZpbHRlcmVkX2VudGl0aWVzWzBdXG4gICAgICAgICAgZHggPSB0YXJnZXRfZW50aXR5Lm1hcF94IC0gc2VsZi5tYXBfeFxuICAgICAgICAgIGR5ID0gdGFyZ2V0X2VudGl0eS5tYXBfeSAtIHNlbGYubWFwX3lcblxuICAgICAgICAgIGlmIE1hdGguYWJzKGR4KSA+IE1hdGguYWJzKGR5KVxuICAgICAgICAgICAgaWYgZHggPiAwIHRoZW4gJ3JpZ2h0JyBlbHNlICdsZWZ0J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGR5ID4gMCB0aGVuICdkb3duJyBlbHNlICd1cCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG4gICAgKVxuXG4gICAgdW5sZXNzIGRpcmVjdGlvblxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA+IC45IHRoZW4gQGNob29zZURpcmVjdGlvbigpXG4gICAgICBkaXJlY3Rpb24gPSBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBkaXJlY3Rpb24pO1xuXG4gICAgaWYgZW50aXR5IGFuZCBlbnRpdHkubmFtZSBpc250ICdFZGdlJ1xuICAgICAgQG1hcC5zd2FwRW50aXRpZXMgQG1hcF9pbmRleCwgZW50aXR5Lm1hcF9pbmRleFxuICAgICAgQHN0dWNrX2NvdW50ID0gMFxuICAgIGVsc2VcbiAgICAgIEBzdHVja19jb3VudCsrXG5cbiAgY29uc3VtZU1hdGVyaWFsOiAtPlxuICAgIChcbiAgICAgIGVudGl0eSA9IEBtYXAuZ2V0RW50aXR5QXREaXJlY3Rpb24oQG1hcF9pbmRleCwgc2lkZSlcblxuICAgICAgaWYgZW50aXR5XG4gICAgICAgIGlmIGVudGl0eS5uYW1lIGlzICdDb21wbGV4TWF0ZXJpYWwnXG4gICAgICAgICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KGVudGl0eS5tYXBfaW5kZXgsIG5ldyBSYXdNYXRlcmlhbEVudGl0eShlbnRpdHkudHlwZSksIHRydWUpXG4gICAgICAgICAgQGhlYWx0aCArPSB2YXJpYWJsZXMubGlmZV9nYWluX3Blcl9mb29kXG4gICAgKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J11cblxuICByZXByb2R1Y2U6IC0+XG4gICAgaWYgQGhlYWx0aCA+IHZhcmlhYmxlcy5saWZlX3RvX3JlcHJvZHVjZVxuICAgICAgKFxuICAgICAgICBlbnRpdHkgPSBAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpXG5cbiAgICAgICAgaWYgZW50aXR5IGFuZCBlbnRpdHkubmFtZSBpcyAnRW1wdHknXG4gICAgICAgICAgICBjaGlsZCA9IG5ldyBSb2FtaW5nRW50aXR5KClcbiAgICAgICAgICAgIGNoaWxkLmhlYWx0aCA9IHZhcmlhYmxlcy5zdGFydGluZ19oZWFsdGhfY2xvbmVcbiAgICAgICAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBjaGlsZCAsIHRydWUpXG4gICAgICAgICAgICBAaGVhbHRoIC09IHZhcmlhYmxlcy5saWZlX2xvc3NfdG9fcmVwcm9kdWNlXG4gICAgICAgICAgICBicmVha1xuICAgICAgKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J11cblxuICAgIHRydWVcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIEBjb25zdW1lTWF0ZXJpYWwoKVxuICAgICAgQGRvTW92ZW1lbnQoKVxuICAgICAgQHJlcHJvZHVjZSgpXG4gICAgICBAaGVhbHRoLS1cbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvYW1pbmdFbnRpdHlcbiIsIiMgUmV0cmlldmVkIGZyb20gaHR0cDovL3d3dy5taWNoYWVsYnJvbWxleS5jby51ay9hcGkvOTAvc2ltcGxlLTFkLW5vaXNlLWluLWphdmFzY3JpcHRcblxuU2ltcGxlMUROb2lzZSA9IC0+XG4gIE1BWF9WRVJUSUNFUyA9IDI1NlxuICBNQVhfVkVSVElDRVNfTUFTSyA9IE1BWF9WRVJUSUNFUyAtIDFcbiAgYW1wbGl0dWRlID0gMVxuICBzY2FsZSA9IC4wMTVcbiAgciA9IFtdXG4gIGkgPSAwXG4gIHdoaWxlIGkgPCBNQVhfVkVSVElDRVNcbiAgICByLnB1c2ggTWF0aC5yYW5kb20oKVxuICAgICsraVxuXG4gIGdldFZhbCA9ICh4KSAtPlxuICAgIHNjYWxlZFggPSB4ICogc2NhbGVcbiAgICB4Rmxvb3IgPSBNYXRoLmZsb29yKHNjYWxlZFgpXG4gICAgdCA9IHNjYWxlZFggLSB4Rmxvb3JcbiAgICB0UmVtYXBTbW9vdGhzdGVwID0gdCAqIHQgKiAoMyAtICgyICogdCkpXG4gICAgIy8gTW9kdWxvIHVzaW5nICZcbiAgICB4TWluID0geEZsb29yICYgTUFYX1ZFUlRJQ0VTX01BU0tcbiAgICB4TWF4ID0geE1pbiArIDEgJiBNQVhfVkVSVElDRVNfTUFTS1xuICAgIHkgPSBsZXJwKHJbeE1pbl0sIHJbeE1heF0sIHRSZW1hcFNtb290aHN0ZXApXG4gICAgeSAqIGFtcGxpdHVkZVxuXG4gICMjIypcbiAgKiBMaW5lYXIgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbi5cbiAgKiBAcGFyYW0gYSBUaGUgbG93ZXIgaW50ZWdlciB2YWx1ZVxuICAqIEBwYXJhbSBiIFRoZSB1cHBlciBpbnRlZ2VyIHZhbHVlXG4gICogQHBhcmFtIHQgVGhlIHZhbHVlIGJldHdlZW4gdGhlIHR3b1xuICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICMjI1xuXG4gIGxlcnAgPSAoYSwgYiwgdCkgLT5cbiAgICBhICogKDEgLSB0KSArIGIgKiB0XG5cbiAgIyByZXR1cm4gdGhlIEFQSVxuICB7XG4gICAgZ2V0VmFsOiBnZXRWYWxcbiAgICBzZXRBbXBsaXR1ZGU6IChuZXdBbXBsaXR1ZGUpIC0+XG4gICAgICBhbXBsaXR1ZGUgPSBuZXdBbXBsaXR1ZGVcbiAgICAgIHJldHVyblxuICAgIHNldFNjYWxlOiAobmV3U2NhbGUpIC0+XG4gICAgICBzY2FsZSA9IG5ld1NjYWxlXG4gICAgICByZXR1cm5cblxuICB9XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlMUROb2lzZSIsIk51bWJlci5wcm90b3R5cGUubW9kID0gKG4pIC0+ICgodGhpcyVuKStuKSVuXG5cblxubW9kdWxlLmV4cG9ydHMuZHVhbF9zcGlyYWxzID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgeiA9IDFcblxuICAoaW5kZXgpIC0+XG5cbiAgICB4ID0gaW5kZXggJSB3aWR0aFxuICAgIHkgPSBNYXRoLmZsb29yIGluZGV4IC8gd2lkdGhcblxuICAgIGR4ID0geCAtIGNlbnRlcl94XG4gICAgZHkgPSB5IC0gY2VudGVyX3lcblxuICAgIG14ID0gTWF0aC5hYnMoZHgpXG5cbiAgICBxID0gKFxuICAgICAgaWYgZHkgPiAwXG4gICAgICAgIGlmIG14IDwgY2VudGVyX3ggLyAyIHRoZW4gMCBlbHNlIDFcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbXggPiBjZW50ZXJfeCAvIDIgdGhlbiAyIGVsc2UgM1xuICAgIClcblxuICAgIHJhbmQgPSBNYXRoLnJhbmRvbSgpID49IC41XG5cbiAgICBpZiBkeCA+IDBcbiAgICAgIHN3aXRjaCBxXG4gICAgICAgIHdoZW4gMFxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAnZG93bidcbiAgICAgICAgd2hlbiAyXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdyaWdodCdcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdyaWdodCcgZWxzZSAndXAnXG4gICAgZWxzZVxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICd1cCcgZWxzZSAncmlnaHQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAncmlnaHQnIGVsc2UgJ2Rvd24nXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnZG93bicgZWxzZSAnbGVmdCdcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICd1cCdcblxuXG5tb2R1bGUuZXhwb3J0cy5vcHBvc2l0ZV9zcGlyYWxzID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgeiA9IDFcblxuICAoaW5kZXgpIC0+XG5cbiAgICB4ID0gaW5kZXggJSB3aWR0aFxuICAgIHkgPSBNYXRoLmZsb29yIGluZGV4IC8gd2lkdGhcblxuICAgIGR4ID0geCAtIGNlbnRlcl94XG4gICAgZHkgPSB5IC0gY2VudGVyX3lcblxuICAgIG14ID0gTWF0aC5hYnMoZHgpXG5cbiAgICBxID0gKFxuICAgICAgaWYgZHkgPiAwXG4gICAgICAgIGlmIG14IDwgY2VudGVyX3ggLyAyLjUgdGhlbiAwIGVsc2UgMVxuICAgICAgZWxzZVxuICAgICAgICBpZiBteCA+IGNlbnRlcl94IC8gMi41IHRoZW4gMiBlbHNlIDNcbiAgICApXG5cbiAgICByYW5kID0gTWF0aC5yYW5kb20oKSA+PSAuNDlcblxuICAgIGlmIGR4ID4gMFxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICd1cCdcbiAgICAgICAgd2hlbiAxXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdsZWZ0J1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3VwJyBlbHNlICdyaWdodCdcbiAgICBlbHNlXG4gICAgICBzd2l0Y2ggcVxuICAgICAgICB3aGVuIDBcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAndXAnXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMudGlnaHRfc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgKGluZGV4KSAtPlxuXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9IHggLSBjZW50ZXJfeFxuICAgIGR5ID0geSAtIGNlbnRlcl95XG5cbiAgICBpZiBkeCA+IDAgYW5kIGR5ID49IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAndXAnXG4gICAgICBlbHNlXG4gICAgICAgICdyaWdodCdcbiAgICBlbHNlIGlmIGR4ID49IDAgYW5kIGR5IDwgMFxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA8IE1hdGguYWJzKGR5KSAvIGNlbnRlcl95XG4gICAgICAgICdsZWZ0J1xuICAgICAgZWxzZVxuICAgICAgICAndXAnXG4gICAgZWxzZSBpZiBkeCA8IDAgYW5kIGR5IDw9IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAnZG93bidcbiAgICAgIGVsc2VcbiAgICAgICAgJ2xlZnQnXG4gICAgZWxzZSBpZiBkeCA8PSAwIGFuZCBkeSA+IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeSkgLyBjZW50ZXJfeVxuICAgICAgICAncmlnaHQnXG4gICAgICBlbHNlXG4gICAgICAgICdkb3duJ1xuICAgIGVsc2UgWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV1cblxubW9kdWxlLmV4cG9ydHMuc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQpIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIGRpdmlzaW9uX2FuZ2xlID0gTWF0aC5mbG9vciAzNjAvNFxuICBtYXhEaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh3aWR0aC1jZW50ZXJfeCwgMikgKyBNYXRoLnBvdyhoZWlnaHQtY2VudGVyX3ksIDIpKVxuICBteCA9IDFcbiAgbXkgPSAxXG5cbiAgaWYgd2lkdGggPiBoZWlnaHRcbiAgICBteCA9IGhlaWdodC93aWR0aFxuICBlbHNlXG4gICAgbXkgPSB3aWR0aC9oZWlnaHRcblxuICBkaXJlY3Rpb25zID0gWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVxuXG4gIHBvaW50Q2FjaGUgPSBbXVxuXG4gIGZvciBpbmRleCBpbiBbMCAuLiB3aWR0aCAqIGhlaWdodCAtIDFdXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9ICgoeCAtIGNlbnRlcl94KSAqIG14KVxuICAgIGR5ID0gKCh5IC0gY2VudGVyX3kgKyAxKSAqIG15KVxuXG4gICAgZGlzdGFuY2UgPSBNYXRoLnNpbigoTWF0aC5zcXJ0KE1hdGgucG93KGR4LCAyKSArIE1hdGgucG93KGR5LCAyKSkgLyBtYXhEaXN0YW5jZSkgKiAxMClcbiAgICBhbmdsZSA9IE1hdGguZmxvb3IoKCgoKE1hdGguYXRhbjIoZHksIGR4KSoxODApL01hdGguUEkpK2Rpc3RhbmNlKS5tb2QoMzYwKS9kaXZpc2lvbl9hbmdsZSkqMTAwKS8xMDBcblxuICAgIHBvaW50Q2FjaGVbaW5kZXhdID0gYW5nbGVcblxuICAoaW5kZXgpIC0+XG4gICAgYW5nbGUgPSBwb2ludENhY2hlW2luZGV4XVxuXG4gICAgaW50cCA9IE1hdGguZmxvb3IoYW5nbGUpXG4gICAgZGVjID0gTWF0aC5mbG9vcigoYW5nbGUtaW50cCkqMTAwKVxuXG4gICAgZGlyZWN0aW9uID0gIGlmIE1hdGgucmFuZG9tKCkqOTAgPiBkZWMgdGhlbiAoaW50cCsxKS5tb2QoNCkgZWxzZSAoaW50cCsyKS5tb2QoNClcblxuICAgIGRpcmVjdGlvbnNbZGlyZWN0aW9uXSIsIm1vZHVsZS5leHBvcnRzID0gLT5cbiAgZmlsdGVyX3N0cmVuZ3RoID0gMjBcbiAgZnJhbWVfdGltZSA9IDBcbiAgbGFzdF9sb29wID0gbmV3IERhdGUoKVxuICB7XG4gICAgdGljayA6IC0+XG4gICAgICB0aGlzX2xvb3AgPSBuZXcgRGF0ZVxuICAgICAgdGhpc190aW1lID0gdGhpc19sb29wIC0gbGFzdF9sb29wXG4gICAgICBmcmFtZV90aW1lICs9ICh0aGlzX3RpbWUgLSBmcmFtZV90aW1lKSAvIGZpbHRlcl9zdHJlbmd0aFxuICAgICAgbGFzdF9sb29wID0gdGhpc19sb29wXG4gICAgZ2V0RnBzIDogLT5cbiAgICAgIDEwMDAgLyBmcmFtZV90aW1lXG4gIH1cblxuXG4iLCJFbXB0eUVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL0VtcHR5RW50aXR5J1xuUm9hbWluZ0VudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL1JvYW1pbmdFbnRpdHknXG5SYXdNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL1Jhd01hdGVyaWFsRW50aXR5J1xuQ29tcGxleE1hdGVyaWFsRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvQ29tcGxleE1hdGVyaWFsRW50aXR5J1xuUHJvZHVjZXJFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9Qcm9kdWNlckVudGl0eSdcbkVkZ2VFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9FZGdlRW50aXR5J1xuZmxvdyA9IHJlcXVpcmUgJy4vZmxvdydcbnNodWZmbGUgPSByZXF1aXJlICcuL3NodWZmbGVBcnJheSdcbnZhcmlhYmxlcyA9IHJlcXVpcmUoJy4vdmFyaWFibGVIb2xkZXInKS5NYXBcblNpbXBsZTFETm9pc2UgPSByZXF1aXJlICcuL1NpbXBsZTFETm9pc2UnXG5cbmNsYXNzIE1hcFxuICAjIFByaXZhdGVzXG4gIF9tYXA6IFtdXG5cbiAgX3RpY2s6IDBcblxuICBfaW1hZ2U6IG51bGxcbiAgX2NvdW50czoge0Jhc2U6MCwgRW1wdHk6MCwgUmF3TWF0ZXJpYWw6MCwgUm9hbWluZzowLCBDb21wbGV4TWF0ZXJpYWw6MCwgUHJvZHVjZXI6MH1cblxuICAjcHVibGljc1xuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgZmxvd190eXBlKSAtPlxuICAgIEBmbG93ID0gZmxvd1tmbG93X3R5cGVdKEB3aWR0aCwgQGhlaWdodCwgQClcbiAgICBAX2ltYWdlID0gbmV3IFVpbnQ4QXJyYXkoQHdpZHRoICogQGhlaWdodCAqIDQpXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoaSwgbmV3IEVtcHR5RW50aXR5KCksIHRydWUpIGZvciBpIGluIFswIC4uIEB3aWR0aCpAaGVpZ2h0IC0gMV1cbiAgICBAbWFrZUJvcmRlcigpXG5cbiAgICBAX2FkZFByb2R1Y2VyKCkgZm9yIFswIC4uIDhdXG5cbiAgbWFrZUJvcmRlcjogLT5cbiAgICB4X211bHRpcGxpZXIgPSBNYXRoLnJvdW5kKEB3aWR0aCAqIC4wMylcbiAgICB5X211bHRpcGxpZXIgPSBNYXRoLnJvdW5kKEBoZWlnaHQgKiAuMDMpXG4gICAgbm9pc2UgPSBTaW1wbGUxRE5vaXNlKCk7XG4gICAgbm9pc2Uuc2V0U2NhbGUoLjA5KVxuICAgIGkgPSAwXG5cbiAgICBmb3IgeCBpbiBbMCAuLi4gQHdpZHRoXVxuICAgICAgb3V0ID0gTWF0aC5jZWlsKG5vaXNlLmdldFZhbCh4KSAqIHlfbXVsdGlwbGllcilcbiAgICAgIGZvciBpIGluIFswIC4uLiBvdXRdXG4gICAgICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KEBfcG9pbnRUb0luZGV4KHgsIGktMSksIG5ldyBFZGdlRW50aXR5KCksIHRydWUpXG5cbiAgICBmb3IgeSBpbiBbMCAuLi4gQGhlaWdodF1cbiAgICAgIG91dCA9IE1hdGguY2VpbChub2lzZS5nZXRWYWwoeSkgKiB4X211bHRpcGxpZXIpXG4gICAgICBmb3IgaSBpbiBbMCAuLi4gb3V0XVxuICAgICAgICBAYXNzaWduRW50aXR5VG9JbmRleChAX3BvaW50VG9JbmRleChpLTEsIHkpLCBuZXcgRWRnZUVudGl0eSgpLCB0cnVlKVxuXG4gICAgZm9yIHggaW4gWzAgLi4uIEB3aWR0aF1cbiAgICAgIG91dCA9IE1hdGguY2VpbChub2lzZS5nZXRWYWwoeCkgKiB5X211bHRpcGxpZXIpXG4gICAgICBmb3IgaSBpbiBbQGhlaWdodCAuLi4gQGhlaWdodCAtIG91dF1cbiAgICAgICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoQF9wb2ludFRvSW5kZXgoeCwgaS0xKSwgbmV3IEVkZ2VFbnRpdHkoKSwgdHJ1ZSlcblxuICAgIGZvciB5IGluIFswIC4uLiBAaGVpZ2h0XVxuICAgICAgb3V0ID0gTWF0aC5jZWlsKG5vaXNlLmdldFZhbCh5KSAqIHhfbXVsdGlwbGllcilcbiAgICAgIGZvciBpIGluIFtAd2lkdGggLi4uIEB3aWR0aCAtIG91dF1cbiAgICAgICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoQF9wb2ludFRvSW5kZXgoaS0xLCB5KSwgbmV3IEVkZ2VFbnRpdHkoKSwgdHJ1ZSlcblxuXG5cbiAgc2V0Rmxvd1R5cGU6ICh0eXBlKSAtPlxuICAgIEBmbG93ID0gZmxvd1t0eXBlXShAd2lkdGgsIEBoZWlnaHQpXG5cbiAgdGljazogLT5cbiAgICBuZWVkZWRfbWF0ZXJpYWwgPSBAX2dldE5lZWRlZE1hdGVyaWFsQ291bnQoKVxuICAgIGlmIG5lZWRlZF9tYXRlcmlhbCA+IDBcbiAgICAgIEBfYWRkTWF0ZXJpYWwoKSBmb3IgWzAgLi4gbmVlZGVkX21hdGVyaWFsXVxuICAgIGlmIE1hdGgucmFuZG9tKCkqMTAwMDAgPCB2YXJpYWJsZXMuY2hhbmNlX3JvYW1lcl9zcGF3blxuICAgICAgQF9hZGRSb2FtZXIoKVxuICAgIGlmIE1hdGgucmFuZG9tKCkqMTAwMDAgPCB2YXJpYWJsZXMuY2hhbmNlX3Byb2R1Y2VyX3NwYXduXG4gICAgICBAX2FkZFByb2R1Y2VyKClcbiAgICBlbnRpdHkudGljaygpIGZvciBlbnRpdHkgaW4gc2h1ZmZsZShAX21hcC5zbGljZSgpKVxuICAgIEBfdGljaysrXG5cbiAgZ2V0UmVuZGVyOiAtPlxuICAgIEBfaW1hZ2VcblxuICBnZXRFbnRpdHlBdFhZOiAoeCwgeSkgLT5cbiAgICBAZ2V0RW50aXR5QXRJbmRleChAX3BvaW50VG9JbmRleCh4LCB5KSlcblxuICBnZXRFbnRpdHlBdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgaWYgQF9tYXBbaW5kZXhdPyB0aGVuIEBfbWFwW2luZGV4XSBlbHNlIGZhbHNlXG5cbiAgZ2V0RW50aXRpZXNJblJhbmdlOiAoaW5kZXhfbWluLCBpbmRleF9tYXgpIC0+XG4gICAgQF9tYXAuc2xpY2UoaW5kZXhfbWluLCBpbmRleF9tYXgrMSlcblxuICBzd2FwRW50aXRpZXM6IChpbmRleDEsIGluZGV4MikgLT5cbiAgICBlbnQxID0gQGdldEVudGl0eUF0SW5kZXggaW5kZXgxXG4gICAgZW50MiA9IEBnZXRFbnRpdHlBdEluZGV4IGluZGV4MlxuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4IGluZGV4MSwgZW50MlxuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4IGluZGV4MiwgZW50MVxuICAgIGVudDEuaXNfZGVsZXRlZCA9IGZhbHNlXG4gICAgZW50Mi5pc19kZWxldGVkID0gZmFsc2VcbiAgICB0cnVlXG5cbiAgZ2V0RW50aXR5QXREaXJlY3Rpb246IChpbmRleCwgZGlyZWN0aW9uKSAtPlxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3VwJ1xuICAgICAgICBpZiBpbmRleCA+IEB3aWR0aCAtIDFcbiAgICAgICAgICBAZ2V0RW50aXR5QXRJbmRleChpbmRleCAtIEB3aWR0aClcbiAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgd2hlbiAnZG93bidcbiAgICAgICAgaWYgaW5kZXggPCBAX21hcC5sZW5ndGggLSAxXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggKyBAd2lkdGgpXG4gICAgICAgIGVsc2UgZmFsc2VcbiAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgIGlmIGluZGV4ICUgQHdpZHRoID4gMFxuICAgICAgICAgIEBnZXRFbnRpdHlBdEluZGV4KGluZGV4IC0gMSlcbiAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgIGlmIGluZGV4ICUgQHdpZHRoIDwgQHdpZHRoIC0gMVxuICAgICAgICAgIEBnZXRFbnRpdHlBdEluZGV4KGluZGV4ICsgMSlcbiAgICAgICAgZWxzZSBmYWxzZVxuXG4gIGFzc2lnbkVudGl0eVRvSW5kZXg6IChpbmRleCwgZW50aXR5LCBpc19uZXcgPSBmYWxzZSkgLT5cbiAgICBjdXJyZW50X2VudGl0eSA9IEBnZXRFbnRpdHlBdEluZGV4KGluZGV4KVxuICAgIGlmIGN1cnJlbnRfZW50aXR5XG4gICAgICBjdXJyZW50X2VudGl0eS5pc19kZWxldGVkID0gdHJ1ZVxuICAgICAgQF9jb3VudHNbY3VycmVudF9lbnRpdHkubmFtZV0tLVxuXG4gICAgQF9jb3VudHNbZW50aXR5Lm5hbWVdKytcblxuICAgIEBfbWFwW2luZGV4XSA9IGVudGl0eVxuICAgIGVudGl0eS5pc19kZWxldGVkID0gZmFsc2VcbiAgICBpZiBpc19uZXdcbiAgICAgIGVudGl0eS5pbml0IEAsIGluZGV4XG4gICAgZWxzZVxuICAgICAgZW50aXR5Lm1vdmVkKGluZGV4KVxuICAgIHRydWVcblxuICAjcHJpdmF0ZXNcbiAgX3BvaW50VG9JbmRleDogKHgsIHkpIC0+IHggKyBAd2lkdGggKiB5XG4gIF9pbmRleFRvUG9pbnQ6IChpbmRleCkgLT4gW2luZGV4ICUgQHdpZHRoLCBNYXRoLmZsb29yKGluZGV4IC8gQHdpZHRoKV1cbiAgX2FkZEVudGl0eVRvRW1wdHk6ICh0eXBlKSAtPlxuICAgIGxvb3BcbiAgICAgIGkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoQF9tYXAubGVuZ3RoLTEpKVxuICAgICAgYnJlYWsgaWYgQGdldEVudGl0eUF0SW5kZXgoaSk/Lm5hbWUgaXMgJ0VtcHR5J1xuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KGksIG5ldyB0eXBlKCksIHRydWUpXG5cbiAgX2dldE5lZWRlZE1hdGVyaWFsQ291bnQ6IC0+XG4gICAgTWF0aC5mbG9vcihAX21hcC5sZW5ndGggKiB2YXJpYWJsZXMuZW1wdHlfcmF0aW8pIC0gQF9jb3VudHMuQ29tcGxleE1hdGVyaWFsIC0gQF9jb3VudHMuUmF3TWF0ZXJpYWwgLSBAX2NvdW50cy5Qcm9kdWNlclxuXG4gIF9hZGRNYXRlcmlhbDogLT5cbiAgICBAX2FkZEVudGl0eVRvRW1wdHkoUmF3TWF0ZXJpYWxFbnRpdHkpXG5cbiAgX2FkZENvbXBsZXhNYXRlcmlhbDogLT5cbiAgICBAX2FkZEVudGl0eVRvRW1wdHkoQ29tcGxleE1hdGVyaWFsRW50aXR5KVxuXG4gIF9hZGRSb2FtZXI6IC0+XG4gICAgQF9hZGRFbnRpdHlUb0VtcHR5KFJvYW1pbmdFbnRpdHkpXG5cbiAgX2FkZFByb2R1Y2VyOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShQcm9kdWNlckVudGl0eSlcblxuICAjZGVidWdzXG4gICQkZHVtcE1hcDogLT5cbiAgICBjb25zb2xlLmRlYnVnIEBfbWFwXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSAoYXJyYXkpIC0+XG4gIGNvdW50ZXIgPSBhcnJheS5sZW5ndGhcbiAgIyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG4gIHdoaWxlIGNvdW50ZXIgPiAwXG4jIFBpY2sgYSByYW5kb20gaW5kZXhcbiAgICBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvdW50ZXIpXG4gICAgIyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcbiAgICBjb3VudGVyLS1cbiAgICAjIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuICAgIHRlbXAgPSBhcnJheVtjb3VudGVyXVxuICAgIGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdXG4gICAgYXJyYXlbaW5kZXhdID0gdGVtcFxuICBhcnJheSIsIlxudmFyaWFibGVzID1cbiAgTWFwOlxuICAgIGVtcHR5X3JhdGlvOiAuMVxuICAgIGNoYW5jZV9wcm9kdWNlcl9zcGF3bjogMTAwXG4gICAgY2hhbmNlX3JvYW1lcl9zcGF3bjogMTAwXG4gIFByb2R1Y2VyRW50aXR5OlxuICAgIHN0YXJ0aW5nX2xpZmU6IDIwMFxuICAgIGxpZmVfZ2Fpbl9wZXJfZm9vZDogMTIwMFxuICAgIGxpZmVfdG9fcmVwcm9kdWNlOiA2MDBcbiAgICBsaWZlX2xvc3NfdG9fcmVwcm9kdWNlOiA0MDBcbiAgICBtYXhfbGlmZTogNjAwXG4gICAgbWluX2xpZmVfdG9fdHJhbnNmZXI6IDUwXG4gICAgbWF4X2xpZmVfdHJhbnNmZXI6IDUwXG4gICAgZWF0aW5nX2Nvb2xkb3duOiAxMFxuICAgIGFnZV90b19yZXByb2R1Y2U6IDgwXG4gICAgb2xkX2FnZV9kZWF0aF9tdWx0aXBsaWVyOiAxMDAwMDAwMFxuICBSb2FtaW5nRW50aXR5OlxuICAgIHN0dWNrX3RpY2tzOiAyMFxuICAgIHN0dWNrX2Nvb2xkb3duOiAyMFxuICAgIHN0YXJ0aW5nX2hlYWx0aF9mcmVzaDogMTAwXG4gICAgc3RhcnRpbmdfaGVhbHRoX2Nsb25lOiAyMFxuICAgIG1heF9saWZlOiAyMDBcbiAgICBsaWZlX2dhaW5fcGVyX2Zvb2Q6IDUwXG4gICAgbGlmZV90b19yZXByb2R1Y2U6IDIwMFxuICAgIGxpZmVfbG9zc190b19yZXByb2R1Y2U6IDUwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHZhcmlhYmxlc1xuIiwiTWFwID0gcmVxdWlyZSAnLi9saWIvbWFwJ1xuRlBTID0gcmVxdWlyZSgnLi9saWIvZnBzJylcbnZhcmlhYmxlcyA9IHJlcXVpcmUgJy4vbGliL3ZhcmlhYmxlSG9sZGVyJ1xuXG50YXJnZXRfdHBzID0gNDBcblxubWFwID0gbnVsbFxucnVubmluZyA9IGZhbHNlXG5tYXBfdGlja19pbnQgPSAtMTtcbmZwcyA9IEZQUygpXG5cbnRpY2sgPSAtPlxuICBtYXAudGljaygpXG4gIGZwcy50aWNrKClcbiAgbnVsbFxuXG5pbml0ID0gKHdpZHRoLCBoZWlnaHQsIHNlZWQsIGZsb3cpIC0+XG4gIE1hdGgucmFuZG9tID0gcmVxdWlyZSgnc2VlZHJhbmRvbS9saWIvYWxlYScpKHNlZWQpXG4gIG1hcCA9IG5ldyBNYXAgd2lkdGgsIGhlaWdodCwgZmxvd1xuICBzZWxmLnBvc3RNZXNzYWdlIFsnaW5pdGlhbGl6ZWQnXVxuXG5zdGFydCA9ICgpIC0+XG4gIHJ1bm5pbmcgPSB0cnVlXG4gIGZwcyA9IEZQUygpXG4gIHNlbGYucG9zdE1lc3NhZ2UgWydzdGFydGVkJ11cbiAgY2xlYXJJbnRlcnZhbCBtYXBfdGlja19pbnRcbiAgbWFwX3RpY2tfaW50ID0gc2V0SW50ZXJ2YWwgdGljaywgMTAwMC90YXJnZXRfdHBzXG5cbnN0b3AgPSAtPlxuICBydW5uaW5nID0gZmFsc2VcbiAgY2xlYXJJbnRlcnZhbCBtYXBfdGlja19pbnRcbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ3N0b3BwZWQnXVxuXG5zZW5kSW1hZ2VEYXRhID0gLT5cbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ2ltYWdlRGF0YScsIG1hcC5nZXRSZW5kZXIoKV1cblxuc2VuZFRQUyA9IC0+XG4gIHNlbGYucG9zdE1lc3NhZ2UgWyd0cG0nLCBmcHMuZ2V0RnBzKCldXG5cbnVwZGF0ZVZhcmlhYmxlID0gKHR5cGUsIHZhcmlhYmxlLCB2YWx1ZSkgLT5cbiAgY29uc29sZS5kZWJ1ZyBcIlVwZGF0aW5nICN7dHlwZX0uI3t2YXJpYWJsZX0gdG8gI3t2YWx1ZX1cIlxuICB2YXJpYWJsZXNbdHlwZV1bdmFyaWFibGVdID0gdmFsdWVcblxuZ2V0VmFyaWFibGVzID0gLT5cbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ3ZhcmlhYmxlcycsIHZhcmlhYmxlc11cblxuc2V0Rmxvd1R5cGUgPSAodHlwZSkgLT5cbiAgbWFwLnNldEZsb3dUeXBlKHR5cGUpXG5cblxuc2VsZi5vbm1lc3NhZ2UgPSAoZSkgLT5cbiAgc3dpdGNoIGUuZGF0YVswXVxuICAgIHdoZW4gJ2luaXQnICAgICAgICAgICB0aGVuIGluaXQoZS5kYXRhWzFdLCBlLmRhdGFbMl0sIGUuZGF0YVszXSwgZS5kYXRhWzRdKVxuICAgIHdoZW4gJ3N0YXJ0JyAgICAgICAgICB0aGVuIHN0YXJ0KClcbiAgICB3aGVuICdzdG9wJyAgICAgICAgICAgdGhlbiBzdG9wKClcbiAgICB3aGVuICdzZW5kSW1hZ2VEYXRhJyAgdGhlbiBzZW5kSW1hZ2VEYXRhKClcbiAgICB3aGVuICdzZW5kVFBTJyAgICAgICAgdGhlbiBzZW5kVFBTKClcbiAgICB3aGVuICd1cGRhdGVWYXJpYWJsZScgdGhlbiB1cGRhdGVWYXJpYWJsZShlLmRhdGFbMV0sIGUuZGF0YVsyXSwgZS5kYXRhWzNdKVxuICAgIHdoZW4gJ2dldFZhcmlhYmxlcycgICB0aGVuIGdldFZhcmlhYmxlcygpXG4gICAgd2hlbiAnc2V0Rmxvd1R5cGUnICAgIHRoZW4gc2V0Rmxvd1R5cGUoZS5kYXRhWzFdKVxuICAgIGVsc2UgY29uc29sZS5lcnJvciBcIlVua25vd24gQ29tbWFuZCAje2UuZGF0YVswXX1cIlxuXG4iXX0=
