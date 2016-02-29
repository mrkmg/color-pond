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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  BaseEntity is the root class that all Entities will eventually extent from.
  It implements all the required public functions for an entity to exist
 */
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
    this.moved(index);
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
    return true;
  };

  return BaseEntity;

})();

module.exports = BaseEntity;


},{}],3:[function(require,module,exports){

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The ComplexMaterialEntity is just a red flowing entity
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The EdgeEntity is for the edges of the map
 */
var BaseEntity, EdgeEntity, directions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseEntity = require('./BaseEntity');

directions = ['right', 'down', 'left', 'up'];

EdgeEntity = (function(superClass) {
  extend(EdgeEntity, superClass);

  EdgeEntity.prototype.name = 'Edge';

  function EdgeEntity(type) {
    EdgeEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    this.color = type ? [38, 22, 7, 255] : [100, 146, 1, 255];
  }

  return EdgeEntity;

})(BaseEntity);

module.exports = EdgeEntity;


},{"./BaseEntity":2}],5:[function(require,module,exports){

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The EmptyEntity is the placeholder for empty spots
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The FlowingEntity is a base entity to give an entity the ability to flow with the map's current
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The LivingEntity is a base entity which kills an entity and adjusts the transparency based on health
 */
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
    if (LivingEntity.__super__.tick.call(this)) {
      if (this.health <= 0) {
        this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true);
        this.died();
        return false;
      } else {
        this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, 20 + Math.round((this.health / this.max_health) * 235)));
        return true;
      }
    } else {
      return false;
    }
  };

  return LivingEntity;

})(BaseEntity);

module.exports = LivingEntity;


},{"./BaseEntity":2,"./EmptyEntity":5}],8:[function(require,module,exports){

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The ProducerEntity is an entity which consumes RawMaterial, shares health with other friendly
  Producers, and when dies turn into a ComplexMaterial
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The RawMaterialEntity is just a blue flowing entity
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The RoamingEntity is an entity which will hunt out ComplexMaterial and turn it back into RawMaterial
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Predictable 1d noise maker

  Retrieved from http://www.michaelbromley.co.uk/api/90/simple-1d-noise-in-javascript
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Contains a set of different flow calculators.
 */
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
    direction = Math.random() * 100 > dec ? (intp + 1).mod(4) : (intp + 2).mod(4);
    return directions[direction];
  };
};


},{}],13:[function(require,module,exports){

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


},{}],14:[function(require,module,exports){

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  The Map is the heart of the application, and hold all the entities in the map and handles issuing the ticks
  to each entity. It also hold the image data for the map and keeps the goal ratios up to date.
 */
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
    var i, index, j, k, l, m, n, noise, o, out, p, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, results, type, x, x_center, x_multiplier, y, y_center, y_multiplier;
    x_multiplier = Math.round(this.width * .03);
    y_multiplier = Math.round(this.height * .03);
    x_center = Math.round(this.width / 2);
    y_center = Math.round(this.height / 2);
    noise = Simple1DNoise();
    noise.setScale(.08);
    noise.setAmplitude(2);
    i = 0;
    for (x = j = 0, ref = this.width; 0 <= ref ? j < ref : j > ref; x = 0 <= ref ? ++j : --j) {
      out = Math.ceil(noise.getVal(x) * y_multiplier);
      out += (Math.abs(x_center - x) / x_center) * (y_center / 8);
      for (i = k = 0, ref1 = out; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        type = out - i < 5;
        index = this._pointToIndex(x, i - 1);
        if (type && this.getEntityAtIndex(index).name === 'Edge') {
          continue;
        }
        this.assignEntityToIndex(index, new EdgeEntity(type), true);
      }
    }
    for (y = l = 0, ref2 = this.height; 0 <= ref2 ? l < ref2 : l > ref2; y = 0 <= ref2 ? ++l : --l) {
      out = Math.ceil(noise.getVal(y) * x_multiplier);
      out += (Math.abs(y_center - y) / y_center) * (x_center / 8);
      for (i = m = 0, ref3 = out; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        type = out - i < 5;
        index = this._pointToIndex(i - 1, y);
        if (type && this.getEntityAtIndex(index).name === 'Edge') {
          continue;
        }
        this.assignEntityToIndex(index, new EdgeEntity(type), true);
      }
    }
    for (x = n = 0, ref4 = this.width; 0 <= ref4 ? n < ref4 : n > ref4; x = 0 <= ref4 ? ++n : --n) {
      out = Math.ceil(noise.getVal(x) * y_multiplier);
      out += (Math.abs(x_center - x) / x_center) * (y_center / 8);
      for (i = o = ref5 = this.height, ref6 = this.height - out; ref5 <= ref6 ? o < ref6 : o > ref6; i = ref5 <= ref6 ? ++o : --o) {
        type = i - this.height + out < 5;
        index = this._pointToIndex(x, i - 1);
        if (type && this.getEntityAtIndex(index).name === 'Edge') {
          continue;
        }
        this.assignEntityToIndex(index, new EdgeEntity(type), true);
      }
    }
    results = [];
    for (y = p = 0, ref7 = this.height; 0 <= ref7 ? p < ref7 : p > ref7; y = 0 <= ref7 ? ++p : --p) {
      out = Math.ceil(noise.getVal(y) * x_multiplier);
      out += (Math.abs(y_center - y) / y_center) * (x_center / 8);
      results.push((function() {
        var q, ref8, ref9, results1;
        results1 = [];
        for (i = q = ref8 = this.width, ref9 = this.width - out; ref8 <= ref9 ? q < ref9 : q > ref9; i = ref8 <= ref9 ? ++q : --q) {
          type = i - this.width + out < 5;
          index = this._pointToIndex(i - 1, y);
          if (type && this.getEntityAtIndex(index).name === 'Edge') {
            continue;
          }
          results1.push(this.assignEntityToIndex(index, new EdgeEntity(type), true));
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Simple way to shuffle array
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Holder for variables.
 */
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

/*
  color-pond
  Kevin Gravier 2016
  GPL-3.0 License

  Handles communication between the map and the main thread. Also instructs the
  map when to tick.
 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsInNyYy9lbnRpdGllcy9CYXNlRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9Db21wbGV4TWF0ZXJpYWxFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VkZ2VFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VtcHR5RW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9GbG93aW5nRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9MaXZpbmdFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL1Byb2R1Y2VyRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9SYXdNYXRlcmlhbEVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvUm9hbWluZ0VudGl0eS5jb2ZmZWUiLCJzcmMvbGliL1NpbXBsZTFETm9pc2UuY29mZmVlIiwic3JjL2xpYi9mbG93LmNvZmZlZSIsInNyYy9saWIvZnBzLmNvZmZlZSIsInNyYy9saWIvbWFwLmNvZmZlZSIsInNyYy9saWIvc2h1ZmZsZUFycmF5LmNvZmZlZSIsInNyYy9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlIiwic3JjL3Byb2Nlc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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U0FDYixJQUFJLENBQUMsV0FBTCxDQUFpQixDQUFDLFdBQUQsRUFBYyxTQUFkLENBQWpCO0FBRGE7O0FBR2YsV0FBQSxHQUFjLFNBQUMsSUFBRDtTQUNaLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCO0FBRFk7O0FBSWQsSUFBSSxDQUFDLFNBQUwsR0FBaUIsU0FBQyxDQUFEO0FBQ2YsVUFBTyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBZDtBQUFBLFNBQ08sTUFEUDthQUM2QixJQUFBLENBQUssQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQVosRUFBZ0IsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXZCLEVBQTJCLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBN0M7QUFEN0IsU0FFTyxPQUZQO2FBRTZCLEtBQUEsQ0FBQTtBQUY3QixTQUdPLE1BSFA7YUFHNkIsSUFBQSxDQUFBO0FBSDdCLFNBSU8sZUFKUDthQUk2QixhQUFBLENBQUE7QUFKN0IsU0FLTyxTQUxQO2FBSzZCLE9BQUEsQ0FBQTtBQUw3QixTQU1PLGdCQU5QO2FBTTZCLGNBQUEsQ0FBZSxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBdEIsRUFBMEIsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQWpDLEVBQXFDLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUE1QztBQU43QixTQU9PLGNBUFA7YUFPNkIsWUFBQSxDQUFBO0FBUDdCLFNBUU8sYUFSUDthQVE2QixXQUFBLENBQVksQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQW5CO0FBUjdCO2FBU08sT0FBTyxDQUFDLEtBQVIsQ0FBYyxrQkFBQSxHQUFtQixDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBeEM7QUFUUDtBQURlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vLyBcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vIFxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cblxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBBbGVhKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgbWFzaCA9IE1hc2goKTtcblxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAyMDkxNjM5ICogbWUuczAgKyBtZS5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICBtZS5zMCA9IG1lLnMxO1xuICAgIG1lLnMxID0gbWUuczI7XG4gICAgcmV0dXJuIG1lLnMyID0gdCAtIChtZS5jID0gdCB8IDApO1xuICB9O1xuXG4gIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgbWUuYyA9IDE7XG4gIG1lLnMwID0gbWFzaCgnICcpO1xuICBtZS5zMSA9IG1hc2goJyAnKTtcbiAgbWUuczIgPSBtYXNoKCcgJyk7XG4gIG1lLnMwIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMCA8IDApIHsgbWUuczAgKz0gMTsgfVxuICBtZS5zMSAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczEgPCAwKSB7IG1lLnMxICs9IDE7IH1cbiAgbWUuczIgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMyIDwgMCkgeyBtZS5zMiArPSAxOyB9XG4gIG1hc2ggPSBudWxsO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5jID0gZi5jO1xuICB0LnMwID0gZi5zMDtcbiAgdC5zMSA9IGYuczE7XG4gIHQuczIgPSBmLnMyO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBBbGVhKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0geGcubmV4dDtcbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSAqIDB4MTAwMDAwMDAwKSB8IDA7IH1cbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcHJuZygpICsgKHBybmcoKSAqIDB4MjAwMDAwIHwgMCkgKiAxLjExMDIyMzAyNDYyNTE1NjVlLTE2OyAvLyAyXi01M1xuICB9O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuZnVuY3Rpb24gTWFzaCgpIHtcbiAgdmFyIG4gPSAweGVmYzgyNDlkO1xuXG4gIHZhciBtYXNoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH07XG5cbiAgcmV0dXJuIG1hc2g7XG59XG5cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5hbGVhID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgQmFzZUVudGl0eSBpcyB0aGUgcm9vdCBjbGFzcyB0aGF0IGFsbCBFbnRpdGllcyB3aWxsIGV2ZW50dWFsbHkgZXh0ZW50IGZyb20uXG4gIEl0IGltcGxlbWVudHMgYWxsIHRoZSByZXF1aXJlZCBwdWJsaWMgZnVuY3Rpb25zIGZvciBhbiBlbnRpdHkgdG8gZXhpc3RcbiMjI1xuXG5jbGFzcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdCYXNlJ1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBpc19tb3ZlYWJsZSA9IHRydWVcbiAgICBAaXNfZGVsZXRlZCA9IGZhbHNlXG4gICAgQGNvbG9yID0gWzAsIDAsIDAsIDI1NV1cblxuICBpbml0OiAobWFwLCBpbmRleCkgLT5cbiAgICBAbWFwID0gbWFwXG4gICAgQG1vdmVkKGluZGV4KVxuICAgIEBzZXRDb2xvciBAY29sb3JbMF0sIEBjb2xvclsxXSwgQGNvbG9yWzJdLCBAY29sb3JbM11cbiAgICB0cnVlXG5cbiAgIyBXaGVuIGFuIGVudGl0eSBpcyBtb3ZlZCBvbiB0aGUgbWFwLCB3ZSB1cGRhdGUgdGhlIHJlZmVyZW5jZSB0byB0aGUgaW5kZXgsIGNhbGN1bGF0ZVxuICAjIHRoZSB4eSBwb2ludCwgYW5kIHNldCB0aGUgY29sb3IuXG4gIG1vdmVkOiAobmV3X2luZGV4KSAtPlxuICAgIEBtYXBfaW5kZXggPSBuZXdfaW5kZXhcbiAgICBbQG1hcF94LCBAbWFwX3ldID0gQG1hcC5faW5kZXhUb1BvaW50KG5ld19pbmRleClcbiAgICBAc2V0Q29sb3IgQGNvbG9yWzBdLCBAY29sb3JbMV0sIEBjb2xvclsyXSwgQGNvbG9yWzNdXG4gICAgdHJ1ZVxuXG4gIHNldENvbG9yOiAociwgZywgYiwgYSkgLT5cbiAgICB1bmxlc3MgQGlzX2RlbGV0ZWRcbiAgICAgIEBjb2xvciA9IFtyLCBnLCBiLCBhXVxuICAgICAgaW1hZ2VfaW5kZXggPSBAbWFwX2luZGV4ICogNDtcblxuICAgICAgIyBDdXJyZW50bHkgd3JpdGVzIGNvbG9yIGRpcmVjdGx5IHRvIG1hcC4gTWF5IGNoYW5nZSB0aGlzIGF0IHNvbWUgcG9pbnQuXG4gICAgICAjIFRoaXMgZHJhbWF0aWNhbGx5IHJlZHVjZXMgdGhlIG51bWJlciBvZiBhbHRlcmF0aW9ucyB0byB0aGUgbWFwIGltYWdlIG9iamVjdC5cbiAgICAgICMgTWF5IGFkZCBhIHB1YmxpYyBtZXRob2QgdG8gdGhlIG1hcCB0byBkbyB0aGlzLlxuICAgICAgQG1hcC5faW1hZ2VbaW1hZ2VfaW5kZXhdID0gclxuICAgICAgQG1hcC5faW1hZ2VbaW1hZ2VfaW5kZXggKyAxXSA9IGdcbiAgICAgIEBtYXAuX2ltYWdlW2ltYWdlX2luZGV4ICsgMl0gPSBiXG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleCArIDNdID0gYVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgdGljazogLT4gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIENvbXBsZXhNYXRlcmlhbEVudGl0eSBpcyBqdXN0IGEgcmVkIGZsb3dpbmcgZW50aXR5XG4jIyNcblxuRmxvd2luZ0VudGl0eSA9IHJlcXVpcmUgJy4vRmxvd2luZ0VudGl0eSdcblxuY2xhc3MgQ29tcGxleE1hdGVyaWFsRW50aXR5IGV4dGVuZHMgRmxvd2luZ0VudGl0eVxuICBuYW1lOiAnQ29tcGxleE1hdGVyaWFsJ1xuXG4gIGNvbnN0cnVjdG9yOiAoQHR5cGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMykpLT5cbiAgICBzdXBlclxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgc3dpdGNoIEB0eXBlXG4gICAgICB3aGVuIDBcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgMCwgMCwgMjU1XVxuICAgICAgd2hlbiAxXG4gICAgICAgIEBjb2xvciA9IFsyNTUsIDUwLCA1MCwgMjU1XVxuICAgICAgd2hlbiAyXG4gICAgICAgIEBjb2xvciA9IFsyNTUsIDEwMCwgMTAwLCAyNTVdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wbGV4TWF0ZXJpYWxFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIEVkZ2VFbnRpdHkgaXMgZm9yIHRoZSBlZGdlcyBvZiB0aGUgbWFwXG4jIyNcblxuQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgRWRnZUVudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgbmFtZTogJ0VkZ2UnXG4gIGNvbnN0cnVjdG9yOiAodHlwZSkgLT5cbiAgICBzdXBlclxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgQGNvbG9yID0gaWYgdHlwZSB0aGVuIFszOCwgMjIsIDcsIDI1NV0gZWxzZSBbMTAwLCAxNDYsIDEsIDI1NV1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGdlRW50aXR5IiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIFRoZSBFbXB0eUVudGl0eSBpcyB0aGUgcGxhY2Vob2xkZXIgZm9yIGVtcHR5IHNwb3RzXG4jIyNcblxuQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcblxubWluQnJpZ2h0bmVzcyA9IDBcbm1heEJyaWdodG5lc3MgPSAyMFxuXG5jbGFzcyBFbXB0eUVudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgbmFtZTogJ0VtcHR5J1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKClcbiAgICBAY29sb3IgPSBbMCwgMCwgMCwgMjU1XVxuXG4gIHRpY2s6IC0+XG4gICAgc3VwZXIoKSBhbmQgKFxuICAgICAgZmFsc2VcbiMgICAgICBjb2xvcnMgPSBAY29sb3IuY29uY2F0KClcbiMgICAgICBpbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKTtcbiMgICAgICBjdXJyZW50X2NvbG9yID0gY29sb3JzW2luZF07XG4jICAgICAgaW5jcmVtZW50ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpIC0gMSkgKiAzXG4jICAgICAgY29sb3JzW2luZF0gPSBNYXRoLm1pbihtYXhCcmlnaHRuZXNzLCBNYXRoLm1heChtaW5CcmlnaHRuZXNzLCBjdXJyZW50X2NvbG9yICsgaW5jcmVtZW50KSlcbiMgICAgICBAc2V0Q29sb3IoY29sb3JzWzBdLCBjb2xvcnNbMV0sIGNvbG9yc1syXSwgY29sb3JzWzNdKVxuICAgIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtcHR5RW50aXR5IiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIFRoZSBGbG93aW5nRW50aXR5IGlzIGEgYmFzZSBlbnRpdHkgdG8gZ2l2ZSBhbiBlbnRpdHkgdGhlIGFiaWxpdHkgdG8gZmxvdyB3aXRoIHRoZSBtYXAncyBjdXJyZW50XG4jIyNcblxuQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgRmxvd2luZ0VudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgbmFtZTogJ0Zsb3dpbmcnXG4gIGNvbnN0cnVjdG9yOiAtPiBzdXBlclxuXG4gIHRpY2s6IC0+XG4gICAgaWYgc3VwZXIoKVxuICAgICAgZGlyZWN0aW9uID0gaWYgTWF0aC5yYW5kb20oKSA+IC41IHRoZW4gZGlyZWN0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV0gZWxzZSBAbWFwLmZsb3coQG1hcF9pbmRleClcblxuICAgICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBkaXJlY3Rpb24pXG5cbiAgICAgIGlmIGVudGl0eSBhbmQgZW50aXR5LmlzX21vdmVhYmxlXG4gICAgICAgIEBtYXAuc3dhcEVudGl0aWVzKEBtYXBfaW5kZXgsIGVudGl0eS5tYXBfaW5kZXgpXG4gICAgICBlbHNlXG5cblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gRmxvd2luZ0VudGl0eSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBUaGUgTGl2aW5nRW50aXR5IGlzIGEgYmFzZSBlbnRpdHkgd2hpY2gga2lsbHMgYW4gZW50aXR5IGFuZCBhZGp1c3RzIHRoZSB0cmFuc3BhcmVuY3kgYmFzZWQgb24gaGVhbHRoXG4jIyNcblxuQmFzZUVudGl0eSA9IHJlcXVpcmUgJy4vQmFzZUVudGl0eSdcbkVtcHR5RW50aXR5ID0gcmVxdWlyZSAnLi9FbXB0eUVudGl0eSdcblxuY2xhc3MgTGl2aW5nRW50aXR5IGV4dGVuZHMgQmFzZUVudGl0eVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBtYXhfaGVhbHRoID0gNDAwXG5cbiAgZGllZDogLT5cblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIGlmIEBoZWFsdGggPD0gMFxuICAgICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoQG1hcF9pbmRleCwgbmV3IEVtcHR5RW50aXR5KCksIHRydWUpXG4gICAgICAgIEBkaWVkKClcbiAgICAgICAgZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldENvbG9yKEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIE1hdGgubWluKDI1NSwgMjAgKyBNYXRoLnJvdW5kKChAaGVhbHRoIC8gQG1heF9oZWFsdGgpKjIzNSkpKVxuICAgICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBMaXZpbmdFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFByb2R1Y2VyRW50aXR5IGlzIGFuIGVudGl0eSB3aGljaCBjb25zdW1lcyBSYXdNYXRlcmlhbCwgc2hhcmVzIGhlYWx0aCB3aXRoIG90aGVyIGZyaWVuZGx5XG4gIFByb2R1Y2VycywgYW5kIHdoZW4gZGllcyB0dXJuIGludG8gYSBDb21wbGV4TWF0ZXJpYWxcbiMjI1xuXG5MaXZpbmdFbnRpdHkgPSByZXF1aXJlICcuL0xpdmluZ0VudGl0eSdcbkVtcHR5RW50aXR5ID0gcmVxdWlyZSAnLi9FbXB0eUVudGl0eSdcbkNvbXBsZXhNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vQ29tcGxleE1hdGVyaWFsRW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZUhvbGRlciA9IHJlcXVpcmUoJy4uL2xpYi92YXJpYWJsZUhvbGRlcicpLlByb2R1Y2VyRW50aXR5XG5cbmZpeG1vZCA9IChtLCBuKSAtPiAoKG0lbikrbiklblxuXG5jbGFzcyBQcm9kdWNlckVudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUHJvZHVjZXInXG5cbiAgY29uc3RydWN0b3I6IChAd2FudHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMykpLT5cbiAgICBzdXBlclxuICAgIEBtYWtlcyA9IGZpeG1vZChAd2FudHMgKyAxLCAzKVxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgQGNvbG9yID0gWzAsIDI1NSwgMCwgMjU1XVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZUhvbGRlci5zdGFydGluZ19saWZlXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZUhvbGRlci5tYXhfbGlmZVxuICAgIEBsYXN0X2F0ZSA9IDBcbiAgICBAYWdlID0gMFxuXG4gIGdldFNpZGVzOiAtPlxuICAgIChAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpIGZvciBzaWRlIGluIHNodWZmbGUgWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXSlcblxuICBlYXQ6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAbGFzdF9hdGUgPSAwXG4gICAgICBAYWdlID0gMFxuICAgICAgQGhlYWx0aCArPSB2YXJpYWJsZUhvbGRlci5saWZlX2dhaW5fcGVyX2Zvb2RcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgRW1wdHlFbnRpdHkoKSwgdHJ1ZSlcbiAgICApIGZvciBlbnRpdHkgaW4gZW50aXRpZXMgd2hlbiBAaGVhbHRoIDwgQG1heF9oZWFsdGhcblxuICB0cmFuc2ZlckhlYWx0aDogKGVudGl0aWVzKSAtPlxuICAgIGZvciBlbnRpdHkgaW4gZW50aXRpZXNcbiAgICAgIG5lZWRzID0gKFxuICAgICAgICBpZiAoQGhlYWx0aCA8IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyIGFuZCBlbnRpdHkuaGVhbHRoID4gdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIpXG4gICAgICAgICAgTWF0aC5mbG9vcihAaGVhbHRoICogLjkpXG4gICAgICAgIGVsc2UgaWYgKChAaGVhbHRoIDwgdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIgYW5kIGVudGl0eS5oZWFsdGggPCB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2Zlcikgb3IgKEBoZWFsdGggPiB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2ZlciBhbmQgZW50aXR5LmhlYWx0aCA+IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyKSkgYW5kIEBoZWFsdGggPiBlbnRpdHkuaGVhbHRoXG4gICAgICAgICAgTWF0aC5taW4oTWF0aC5jZWlsKChAaGVhbHRoIC0gZW50aXR5LmhlYWx0aCkgLyAyKSwgdmFyaWFibGVIb2xkZXIubWF4X2xpZmVfdHJhbnNmZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAwXG4gICAgICApXG5cbiAgICAgIGlmIG5lZWRzID4gMFxuICAgICAgICBAaGVhbHRoIC09IG5lZWRzXG4gICAgICAgIGVudGl0eS5oZWFsdGggKz0gbmVlZHNcblxuICAgIHRydWVcblxuICByZXByb2R1Y2U6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAaGVhbHRoIC09IHZhcmlhYmxlSG9sZGVyLmxpZmVfbG9zc190b19yZXByb2R1Y2VcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgUHJvZHVjZXJFbnRpdHkoQHdhbnRzKSwgdHJ1ZSlcbiAgICAgIEBhZ2UgPSAwXG4gICAgKSBmb3IgZW50aXR5IGluIGVudGl0aWVzIHdoZW4gQGhlYWx0aCA+PSB2YXJpYWJsZUhvbGRlci5saWZlX3RvX3JlcHJvZHVjZVxuXG4gIGRpZWQ6IC0+XG4gICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KEBtYXBfaW5kZXgsIG5ldyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkoQG1ha2VzKSwgdHJ1ZSlcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIEBsYXN0X2F0ZSsrXG4gICAgICBAYWdlKytcblxuICAgICAgc2lkZXMgPSAoZW50aXR5IGZvciBlbnRpdHkgaW4gQGdldFNpZGVzKCkgd2hlbiBlbnRpdHkpXG5cbiAgICAgIHBsYWNlYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiRW1wdHlcIilcbiAgICAgIGZyaWVuZGx5X2VudGl0aWVzID0gKGVudGl0eSBmb3IgZW50aXR5IGluIHNpZGVzIHdoZW4gZW50aXR5Lm5hbWUgaXMgXCJQcm9kdWNlclwiIGFuZCBlbnRpdHkud2FudHMgaXMgQHdhbnRzIGFuZCBlbnRpdHkubWFrZXMgaXMgQG1ha2VzKVxuICAgICAgY29uc3VtYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiUmF3TWF0ZXJpYWxcIiBhbmQgZW50aXR5LnR5cGUgaXMgQHdhbnRzKVxuXG4gICAgICBAdHJhbnNmZXJIZWFsdGgoZnJpZW5kbHlfZW50aXRpZXMpXG5cbiAgICAgIGlmIEBhZ2UgPiB2YXJpYWJsZUhvbGRlci5hZ2VfdG9fcmVwcm9kdWNlIGFuZCBNYXRoLnBvdyhmcmllbmRseV9lbnRpdGllcy5sZW5ndGgrMSwgMikvMTYgPiBNYXRoLnJhbmRvbSgpXG4gICAgICAgIEByZXByb2R1Y2UocGxhY2VhYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBAbGFzdF9hdGUgPiB2YXJpYWJsZUhvbGRlci5lYXRpbmdfY29vbGRvd25cbiAgICAgICAgQGVhdChjb25zdW1hYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBmcmllbmRseV9lbnRpdGllcy5sZW5ndGggaXMgNFxuICAgICAgICBAYWdlID0gMFxuICAgICAgICBAY29sb3JbMV0gPSAyNTVcbiAgICAgICAgQGhlYWx0aCAtPSAxXG4gICAgICBlbHNlXG4gICAgICAgIEBoZWFsdGggLT0gMlxuICAgICAgICBAY29sb3JbMV0gPSAyMDBcblxuICAgICAgaWYgQGFnZSAvIHZhcmlhYmxlSG9sZGVyLm9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllciA+IE1hdGgucmFuZG9tKClcbiAgICAgICAgQGRpZWQoKVxuXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZHVjZXJFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFJhd01hdGVyaWFsRW50aXR5IGlzIGp1c3QgYSBibHVlIGZsb3dpbmcgZW50aXR5XG4jIyNcblxuRmxvd2luZ0VudGl0eSA9IHJlcXVpcmUgJy4vRmxvd2luZ0VudGl0eSdcblxuY2xhc3MgUmF3TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdSYXdNYXRlcmlhbCdcblxuICBjb25zdHJ1Y3RvcjogKEB0eXBlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjMpKSAtPlxuICAgIHN1cGVyXG4gICAgc3dpdGNoIEB0eXBlXG4gICAgICB3aGVuIDBcbiAgICAgICAgQGNvbG9yID0gWzAsIDAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAxXG4gICAgICAgIEBjb2xvciA9IFs1MCwgNTAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAyXG4gICAgICAgIEBjb2xvciA9IFsxMDAsIDEwMCwgMjU1LCAyNTVdXG5cbm1vZHVsZS5leHBvcnRzID0gUmF3TWF0ZXJpYWxFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFJvYW1pbmdFbnRpdHkgaXMgYW4gZW50aXR5IHdoaWNoIHdpbGwgaHVudCBvdXQgQ29tcGxleE1hdGVyaWFsIGFuZCB0dXJuIGl0IGJhY2sgaW50byBSYXdNYXRlcmlhbFxuIyMjXG5cbkxpdmluZ0VudGl0eSA9IHJlcXVpcmUgJy4vTGl2aW5nRW50aXR5J1xuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuL0VtcHR5RW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG5SYXdNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vUmF3TWF0ZXJpYWxFbnRpdHknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuLi9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlJykuUm9hbWluZ0VudGl0eVxuXG5zZWFyY2hfcmFkaXVzID0gMTBcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgUm9hbWluZ0VudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUm9hbWluZydcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBzdXBlcigpXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZXMubWF4X2xpZmVcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZXMuc3RhcnRpbmdfaGVhbHRoX2ZyZXNoXG4gICAgQGNvbG9yID0gWzI1NSwgMjU1LCAwLCAyNTVdXG4gICAgQHN0dWNrX2NvdW50ID0gMFxuICAgIEBzdHVja19jb29sZG93biA9IDBcblxuICAjIENob29zZSBhIHJhbmRvbSBkaXJlY3Rpb25cbiAgY2hvb3NlRGlyZWN0aW9uOiAtPlxuICAgIEB3YW50ZWRfZGlyZWN0aW9uID0gZGlyZWN0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV1cblxuICBkb01vdmVtZW50OiAtPlxuICAgIHNlbGYgPSBAXG5cbiAgICAjIElmIHN0dWNrLCBjaG9vc2UgYSBkaXJlY3Rpb24gYW5kIHNldCB0aGUgY29vbGRvd25cbiAgICBpZiBAc3R1Y2tfY291bnQgPiB2YXJpYWJsZXMuc3R1Y2tfdGlja3NcbiAgICAgIEBjaG9vc2VEaXJlY3Rpb24oKVxuICAgICAgQHN0dWNrX2Nvb2xkb3duID0gdmFyaWFibGVzLnN0dWNrX2Nvb2xkb3duXG5cbiAgICAjIGlmIHN0dWNrLCByZXR1cm4gdGhlIHdhbnRlZCBkaXJlY3Rpb25cbiAgICBpZiBAc3R1Y2tfY29vbGRvd24gPiAwXG4gICAgICBAc3R1Y2tfY29vbGRvd24tLVxuICAgICAgQHdhbnRlZF9kaXJlY3Rpb25cblxuICAgICMgRmlndXJlIG91dCBhIGRpcmVjdGlvbiBieSBzZWFyY2hpbmcgZm9yIENvbXBsZXhNYXRlcmlhbFxuICAgIGRpcmVjdGlvbiA9IChcbiAgICAgIGlmIEBzdHVja19jb29sZG93biA+IDBcbiAgICAgICAgQHN0dWNrX2Nvb2xkb3duLS1cbiAgICAgICAgZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgIyBGaW5kIHRoZSBtaW4gYW5kIG1heCB4IGFuZCB5IGZyb20gc2VhcmNoIHJhZGl1c1xuICAgICAgICB4X25lZyA9IE1hdGgubWF4KEBtYXBfeCAtIHNlYXJjaF9yYWRpdXMsIDApXG4gICAgICAgIHlfbmVnID0gTWF0aC5tYXgoQG1hcF95IC0gc2VhcmNoX3JhZGl1cywgMClcbiAgICAgICAgeF9wb3MgPSBNYXRoLm1pbihAbWFwX3ggKyBzZWFyY2hfcmFkaXVzLCBAbWFwLndpZHRoKVxuICAgICAgICB5X3BvcyA9IE1hdGgubWluKEBtYXBfeSArIHNlYXJjaF9yYWRpdXMsIEBtYXAuaGVpZ2h0KVxuXG4gICAgICAgIGFsbF9lbnRpdGllcyA9IFtdXG5cbiAgICAgICAgIyBHZXQgYWxsIGVudGl0aWVzIGZyb20gbWFwIGluIHJhZGl1c1xuICAgICAgICBmb3IgeSBpbiBbeV9uZWcgLi4geV9wb3NdXG4gICAgICAgICAgYWxsX2VudGl0aWVzID0gYWxsX2VudGl0aWVzLmNvbmNhdChzZWxmLm1hcC5nZXRFbnRpdGllc0luUmFuZ2Uoc2VsZi5tYXAuX3BvaW50VG9JbmRleCh4X25lZywgeSksIHNlbGYubWFwLl9wb2ludFRvSW5kZXgoeF9wb3MsIHkpKSlcblxuICAgICAgICAjIEZpbHRlciBvdXQgdG8gb25seSBDb21wbGV4TWF0ZXJpYWxcbiAgICAgICAgZmlsdGVyZWRfZW50aXRpZXMgPSBhbGxfZW50aXRpZXMuZmlsdGVyIChlbnRpdHkpIC0+XG4gICAgICAgICAgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcblxuICAgICAgICAjIFNvcnQgdGhlbSBieSBkaXN0YW5jZSBmcm9tIHNlbGZcbiAgICAgICAgZmlsdGVyZWRfZW50aXRpZXMuc29ydCAoZW50X2EsIGVudF9iKSAtPlxuICAgICAgICAgIGFfZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coZW50X2EubWFwX3ggLSBzZWxmLm1hcF94LCAyKSArIE1hdGgucG93KGVudF9hLm1hcF95IC0gc2VsZi5tYXBfeSwgMikpXG4gICAgICAgICAgYl9kaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlbnRfYi5tYXBfeCAtIHNlbGYubWFwX3gsIDIpICsgTWF0aC5wb3coZW50X2IubWFwX3kgLSBzZWxmLm1hcF95LCAyKSlcblxuICAgICAgICAgIGlmIGFfZGlzdGFuY2UgPCBiX2Rpc3RhbmNlIHRoZW4gLTFcbiAgICAgICAgICBlbHNlIGlmIGFfZGlzdGFuY2UgPiBiX2Rpc3RhbmNlIHRoZW4gMVxuICAgICAgICAgIGVsc2UgMFxuXG4gICAgICAgICMgSWYgdGhlcmUgYXJlIGFueSBlbnRpdGllcywgZ2V0IHRoZSBjbG9zZXN0IG9uZSBhbmQgZmlndXJlIG91dCB3aGljaCBkaXJlY3Rpb25cbiAgICAgICAgIyBpcyBuZWVkZWQgdG8gZ2V0IGNsb3NlciB0byB0aGUgZW50aXR5XG4gICAgICAgIGlmIGZpbHRlcmVkX2VudGl0aWVzLmxlbmd0aFxuICAgICAgICAgIHRhcmdldF9lbnRpdHkgPSBmaWx0ZXJlZF9lbnRpdGllc1swXVxuICAgICAgICAgIGR4ID0gdGFyZ2V0X2VudGl0eS5tYXBfeCAtIHNlbGYubWFwX3hcbiAgICAgICAgICBkeSA9IHRhcmdldF9lbnRpdHkubWFwX3kgLSBzZWxmLm1hcF95XG5cbiAgICAgICAgICBpZiBNYXRoLmFicyhkeCkgPiBNYXRoLmFicyhkeSlcbiAgICAgICAgICAgIGlmIGR4ID4gMCB0aGVuICdyaWdodCcgZWxzZSAnbGVmdCdcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBkeSA+IDAgdGhlbiAnZG93bicgZWxzZSAndXAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWxzZVxuICAgIClcblxuICAgICMgaWYgbm8gZGlyZWN0aW9uIGZvdW5kIGNob29zZSBhIHJhbmRvbSBvbmVcbiAgICB1bmxlc3MgZGlyZWN0aW9uXG4gICAgICBpZiBNYXRoLnJhbmRvbSgpID4gLjkgdGhlbiBAY2hvb3NlRGlyZWN0aW9uKClcbiAgICAgIGRpcmVjdGlvbiA9IEB3YW50ZWRfZGlyZWN0aW9uXG5cbiAgICBlbnRpdHkgPSBAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIGRpcmVjdGlvbik7XG5cbiAgICBpZiBlbnRpdHkgYW5kIGVudGl0eS5uYW1lIGlzbnQgJ0VkZ2UnXG4gICAgICBAbWFwLnN3YXBFbnRpdGllcyBAbWFwX2luZGV4LCBlbnRpdHkubWFwX2luZGV4XG4gICAgICBAc3R1Y2tfY291bnQgPSAwXG4gICAgZWxzZVxuICAgICAgQHN0dWNrX2NvdW50KytcblxuICBjb25zdW1lTWF0ZXJpYWw6IC0+XG4gICAgKFxuICAgICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBzaWRlKVxuXG4gICAgICBpZiBlbnRpdHlcbiAgICAgICAgaWYgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcbiAgICAgICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoZW50aXR5Lm1hcF9pbmRleCwgbmV3IFJhd01hdGVyaWFsRW50aXR5KGVudGl0eS50eXBlKSwgdHJ1ZSlcbiAgICAgICAgICBAaGVhbHRoICs9IHZhcmlhYmxlcy5saWZlX2dhaW5fcGVyX2Zvb2RcbiAgICApIGZvciBzaWRlIGluIHNodWZmbGUgWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXVxuXG4gIHJlcHJvZHVjZTogLT5cbiAgICBpZiBAaGVhbHRoID4gdmFyaWFibGVzLmxpZmVfdG9fcmVwcm9kdWNlXG4gICAgICAoXG4gICAgICAgIGVudGl0eSA9IEBtYXAuZ2V0RW50aXR5QXREaXJlY3Rpb24oQG1hcF9pbmRleCwgc2lkZSlcblxuICAgICAgICBpZiBlbnRpdHkgYW5kIGVudGl0eS5uYW1lIGlzICdFbXB0eSdcbiAgICAgICAgICAgIGNoaWxkID0gbmV3IFJvYW1pbmdFbnRpdHkoKVxuICAgICAgICAgICAgY2hpbGQuaGVhbHRoID0gdmFyaWFibGVzLnN0YXJ0aW5nX2hlYWx0aF9jbG9uZVxuICAgICAgICAgICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KGVudGl0eS5tYXBfaW5kZXgsIGNoaWxkICwgdHJ1ZSlcbiAgICAgICAgICAgIEBoZWFsdGggLT0gdmFyaWFibGVzLmxpZmVfbG9zc190b19yZXByb2R1Y2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICApIGZvciBzaWRlIGluIHNodWZmbGUgWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXVxuXG4gICAgdHJ1ZVxuXG4gIHRpY2s6IC0+XG4gICAgaWYgc3VwZXIoKVxuICAgICAgQGNvbnN1bWVNYXRlcmlhbCgpXG4gICAgICBAZG9Nb3ZlbWVudCgpXG4gICAgICBAcmVwcm9kdWNlKClcbiAgICAgIEBoZWFsdGgtLVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gUm9hbWluZ0VudGl0eVxuIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIFByZWRpY3RhYmxlIDFkIG5vaXNlIG1ha2VyXG5cbiAgUmV0cmlldmVkIGZyb20gaHR0cDovL3d3dy5taWNoYWVsYnJvbWxleS5jby51ay9hcGkvOTAvc2ltcGxlLTFkLW5vaXNlLWluLWphdmFzY3JpcHRcbiMjI1xuXG5cblNpbXBsZTFETm9pc2UgPSAtPlxuICBNQVhfVkVSVElDRVMgPSAyNTZcbiAgTUFYX1ZFUlRJQ0VTX01BU0sgPSBNQVhfVkVSVElDRVMgLSAxXG4gIGFtcGxpdHVkZSA9IDFcbiAgc2NhbGUgPSAuMDE1XG4gIHIgPSBbXVxuICBpID0gMFxuICB3aGlsZSBpIDwgTUFYX1ZFUlRJQ0VTXG4gICAgci5wdXNoIE1hdGgucmFuZG9tKClcbiAgICArK2lcblxuICBnZXRWYWwgPSAoeCkgLT5cbiAgICBzY2FsZWRYID0geCAqIHNjYWxlXG4gICAgeEZsb29yID0gTWF0aC5mbG9vcihzY2FsZWRYKVxuICAgIHQgPSBzY2FsZWRYIC0geEZsb29yXG4gICAgdFJlbWFwU21vb3Roc3RlcCA9IHQgKiB0ICogKDMgLSAoMiAqIHQpKVxuICAgICMvIE1vZHVsbyB1c2luZyAmXG4gICAgeE1pbiA9IHhGbG9vciAmIE1BWF9WRVJUSUNFU19NQVNLXG4gICAgeE1heCA9IHhNaW4gKyAxICYgTUFYX1ZFUlRJQ0VTX01BU0tcbiAgICB5ID0gbGVycChyW3hNaW5dLCByW3hNYXhdLCB0UmVtYXBTbW9vdGhzdGVwKVxuICAgIHkgKiBhbXBsaXR1ZGVcblxuICAjIyMqXG4gICogTGluZWFyIGludGVycG9sYXRpb24gZnVuY3Rpb24uXG4gICogQHBhcmFtIGEgVGhlIGxvd2VyIGludGVnZXIgdmFsdWVcbiAgKiBAcGFyYW0gYiBUaGUgdXBwZXIgaW50ZWdlciB2YWx1ZVxuICAqIEBwYXJhbSB0IFRoZSB2YWx1ZSBiZXR3ZWVuIHRoZSB0d29cbiAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAjIyNcblxuICBsZXJwID0gKGEsIGIsIHQpIC0+XG4gICAgYSAqICgxIC0gdCkgKyBiICogdFxuXG4gICMgcmV0dXJuIHRoZSBBUElcbiAge1xuICAgIGdldFZhbDogZ2V0VmFsXG4gICAgc2V0QW1wbGl0dWRlOiAobmV3QW1wbGl0dWRlKSAtPlxuICAgICAgYW1wbGl0dWRlID0gbmV3QW1wbGl0dWRlXG4gICAgICByZXR1cm5cbiAgICBzZXRTY2FsZTogKG5ld1NjYWxlKSAtPlxuICAgICAgc2NhbGUgPSBuZXdTY2FsZVxuICAgICAgcmV0dXJuXG5cbiAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZTFETm9pc2UiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgQ29udGFpbnMgYSBzZXQgb2YgZGlmZmVyZW50IGZsb3cgY2FsY3VsYXRvcnMuXG4jIyNcblxuTnVtYmVyLnByb3RvdHlwZS5tb2QgPSAobikgLT4gKCh0aGlzJW4pK24pJW5cblxubW9kdWxlLmV4cG9ydHMuZHVhbF9zcGlyYWxzID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgeiA9IDFcblxuICAoaW5kZXgpIC0+XG5cbiAgICB4ID0gaW5kZXggJSB3aWR0aFxuICAgIHkgPSBNYXRoLmZsb29yIGluZGV4IC8gd2lkdGhcblxuICAgIGR4ID0geCAtIGNlbnRlcl94XG4gICAgZHkgPSB5IC0gY2VudGVyX3lcblxuICAgIG14ID0gTWF0aC5hYnMoZHgpXG5cbiAgICBxID0gKFxuICAgICAgaWYgZHkgPiAwXG4gICAgICAgIGlmIG14IDwgY2VudGVyX3ggLyAyIHRoZW4gMCBlbHNlIDFcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbXggPiBjZW50ZXJfeCAvIDIgdGhlbiAyIGVsc2UgM1xuICAgIClcblxuICAgIHJhbmQgPSBNYXRoLnJhbmRvbSgpID49IC41XG5cbiAgICBpZiBkeCA+IDBcbiAgICAgIHN3aXRjaCBxXG4gICAgICAgIHdoZW4gMFxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAnZG93bidcbiAgICAgICAgd2hlbiAyXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdyaWdodCdcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdyaWdodCcgZWxzZSAndXAnXG4gICAgZWxzZVxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICd1cCcgZWxzZSAncmlnaHQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAncmlnaHQnIGVsc2UgJ2Rvd24nXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnZG93bicgZWxzZSAnbGVmdCdcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICd1cCdcblxuXG5tb2R1bGUuZXhwb3J0cy5vcHBvc2l0ZV9zcGlyYWxzID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgeiA9IDFcblxuICAoaW5kZXgpIC0+XG5cbiAgICB4ID0gaW5kZXggJSB3aWR0aFxuICAgIHkgPSBNYXRoLmZsb29yIGluZGV4IC8gd2lkdGhcblxuICAgIGR4ID0geCAtIGNlbnRlcl94XG4gICAgZHkgPSB5IC0gY2VudGVyX3lcblxuICAgIG14ID0gTWF0aC5hYnMoZHgpXG5cbiAgICBxID0gKFxuICAgICAgaWYgZHkgPiAwXG4gICAgICAgIGlmIG14IDwgY2VudGVyX3ggLyAyLjUgdGhlbiAwIGVsc2UgMVxuICAgICAgZWxzZVxuICAgICAgICBpZiBteCA+IGNlbnRlcl94IC8gMi41IHRoZW4gMiBlbHNlIDNcbiAgICApXG5cbiAgICByYW5kID0gTWF0aC5yYW5kb20oKSA+PSAuNDlcblxuICAgIGlmIGR4ID4gMFxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICd1cCdcbiAgICAgICAgd2hlbiAxXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdsZWZ0J1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3VwJyBlbHNlICdyaWdodCdcbiAgICBlbHNlXG4gICAgICBzd2l0Y2ggcVxuICAgICAgICB3aGVuIDBcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAndXAnXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMudGlnaHRfc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgKGluZGV4KSAtPlxuXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9IHggLSBjZW50ZXJfeFxuICAgIGR5ID0geSAtIGNlbnRlcl95XG5cbiAgICBpZiBkeCA+IDAgYW5kIGR5ID49IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAndXAnXG4gICAgICBlbHNlXG4gICAgICAgICdyaWdodCdcbiAgICBlbHNlIGlmIGR4ID49IDAgYW5kIGR5IDwgMFxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA8IE1hdGguYWJzKGR5KSAvIGNlbnRlcl95XG4gICAgICAgICdsZWZ0J1xuICAgICAgZWxzZVxuICAgICAgICAndXAnXG4gICAgZWxzZSBpZiBkeCA8IDAgYW5kIGR5IDw9IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAnZG93bidcbiAgICAgIGVsc2VcbiAgICAgICAgJ2xlZnQnXG4gICAgZWxzZSBpZiBkeCA8PSAwIGFuZCBkeSA+IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeSkgLyBjZW50ZXJfeVxuICAgICAgICAncmlnaHQnXG4gICAgICBlbHNlXG4gICAgICAgICdkb3duJ1xuICAgIGVsc2UgWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV1cblxubW9kdWxlLmV4cG9ydHMuc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQpIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIGRpdmlzaW9uX2FuZ2xlID0gTWF0aC5mbG9vciAzNjAvNFxuICBtYXhEaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh3aWR0aC1jZW50ZXJfeCwgMikgKyBNYXRoLnBvdyhoZWlnaHQtY2VudGVyX3ksIDIpKVxuICBteCA9IDFcbiAgbXkgPSAxXG5cbiAgaWYgd2lkdGggPiBoZWlnaHRcbiAgICBteCA9IGhlaWdodC93aWR0aFxuICBlbHNlXG4gICAgbXkgPSB3aWR0aC9oZWlnaHRcblxuICBkaXJlY3Rpb25zID0gWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVxuXG4gIHBvaW50Q2FjaGUgPSBbXVxuXG4gIGZvciBpbmRleCBpbiBbMCAuLiB3aWR0aCAqIGhlaWdodCAtIDFdXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9ICgoeCAtIGNlbnRlcl94KSAqIG14KVxuICAgIGR5ID0gKCh5IC0gY2VudGVyX3kgKyAxKSAqIG15KVxuXG4gICAgZGlzdGFuY2UgPSBNYXRoLnNpbigoTWF0aC5zcXJ0KE1hdGgucG93KGR4LCAyKSArIE1hdGgucG93KGR5LCAyKSkgLyBtYXhEaXN0YW5jZSkgKiAxMClcbiAgICBhbmdsZSA9IE1hdGguZmxvb3IoKCgoKE1hdGguYXRhbjIoZHksIGR4KSoxODApL01hdGguUEkpK2Rpc3RhbmNlKS5tb2QoMzYwKS9kaXZpc2lvbl9hbmdsZSkqMTAwKS8xMDBcblxuICAgIHBvaW50Q2FjaGVbaW5kZXhdID0gYW5nbGVcblxuICAoaW5kZXgpIC0+XG4gICAgYW5nbGUgPSBwb2ludENhY2hlW2luZGV4XVxuXG4gICAgaW50cCA9IE1hdGguZmxvb3IoYW5nbGUpXG4gICAgZGVjID0gTWF0aC5mbG9vcigoYW5nbGUtaW50cCkqMTAwKVxuXG4gICAgZGlyZWN0aW9uID0gIGlmIE1hdGgucmFuZG9tKCkqMTAwID4gZGVjIHRoZW4gKGludHArMSkubW9kKDQpIGVsc2UgKGludHArMikubW9kKDQpXG5cbiAgICBkaXJlY3Rpb25zW2RpcmVjdGlvbl0iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgU2ltcGxlIG9iamVjdCB0byBrZWVwIHRyYWNrIG9mIEZQU1xuIyMjXG5cbm1vZHVsZS5leHBvcnRzID0gLT5cbiAgZmlsdGVyX3N0cmVuZ3RoID0gMjBcbiAgZnJhbWVfdGltZSA9IDBcbiAgbGFzdF9sb29wID0gbmV3IERhdGUoKVxuICB7XG4gICAgdGljayA6IC0+XG4gICAgICB0aGlzX2xvb3AgPSBuZXcgRGF0ZVxuICAgICAgdGhpc190aW1lID0gdGhpc19sb29wIC0gbGFzdF9sb29wXG4gICAgICBmcmFtZV90aW1lICs9ICh0aGlzX3RpbWUgLSBmcmFtZV90aW1lKSAvIGZpbHRlcl9zdHJlbmd0aFxuICAgICAgbGFzdF9sb29wID0gdGhpc19sb29wXG4gICAgZ2V0RnBzIDogLT5cbiAgICAgIDEwMDAgLyBmcmFtZV90aW1lXG4gIH1cblxuXG4iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIE1hcCBpcyB0aGUgaGVhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLCBhbmQgaG9sZCBhbGwgdGhlIGVudGl0aWVzIGluIHRoZSBtYXAgYW5kIGhhbmRsZXMgaXNzdWluZyB0aGUgdGlja3NcbiAgdG8gZWFjaCBlbnRpdHkuIEl0IGFsc28gaG9sZCB0aGUgaW1hZ2UgZGF0YSBmb3IgdGhlIG1hcCBhbmQga2VlcHMgdGhlIGdvYWwgcmF0aW9zIHVwIHRvIGRhdGUuXG4jIyNcblxuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9FbXB0eUVudGl0eSdcblJvYW1pbmdFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9Sb2FtaW5nRW50aXR5J1xuUmF3TWF0ZXJpYWxFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9SYXdNYXRlcmlhbEVudGl0eSdcbkNvbXBsZXhNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL0NvbXBsZXhNYXRlcmlhbEVudGl0eSdcblByb2R1Y2VyRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvUHJvZHVjZXJFbnRpdHknXG5FZGdlRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvRWRnZUVudGl0eSdcbmZsb3cgPSByZXF1aXJlICcuL2Zsb3cnXG5zaHVmZmxlID0gcmVxdWlyZSAnLi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuL3ZhcmlhYmxlSG9sZGVyJykuTWFwXG5TaW1wbGUxRE5vaXNlID0gcmVxdWlyZSAnLi9TaW1wbGUxRE5vaXNlJ1xuXG5jbGFzcyBNYXBcbiAgIyBQcml2YXRlc1xuICBfbWFwOiBbXVxuXG4gIF90aWNrOiAwXG5cbiAgX2ltYWdlOiBudWxsXG4gIF9jb3VudHM6IHtcbiAgICBCYXNlOiAwLFxuICAgIEVtcHR5OiAwLFxuICAgIFJhd01hdGVyaWFsOiAwLFxuICAgIFJvYW1pbmc6IDAsXG4gICAgQ29tcGxleE1hdGVyaWFsOiAwLFxuICAgIFByb2R1Y2VyOiAwXG4gIH1cblxuI3B1YmxpY3NcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIGZsb3dfdHlwZSkgLT5cbiAgICBAZmxvdyA9IGZsb3dbZmxvd190eXBlXShAd2lkdGgsIEBoZWlnaHQsIEApXG4gICAgQF9pbWFnZSA9IG5ldyBVaW50OEFycmF5KEB3aWR0aCAqIEBoZWlnaHQgKiA0KVxuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KGksIG5ldyBFbXB0eUVudGl0eSgpLCB0cnVlKSBmb3IgaSBpbiBbMCAuLiBAd2lkdGggKiBAaGVpZ2h0IC0gMV1cbiAgICBAbWFrZUJvcmRlcigpXG5cbiAgICBAX2FkZFByb2R1Y2VyKCkgZm9yIFswIC4uIDhdXG5cbiAgbWFrZUJvcmRlcjogLT5cbiAgICB4X211bHRpcGxpZXIgPSBNYXRoLnJvdW5kKEB3aWR0aCAqIC4wMylcbiAgICB5X211bHRpcGxpZXIgPSBNYXRoLnJvdW5kKEBoZWlnaHQgKiAuMDMpXG4gICAgeF9jZW50ZXIgPSBNYXRoLnJvdW5kKEB3aWR0aCAvIDIpO1xuICAgIHlfY2VudGVyID0gTWF0aC5yb3VuZChAaGVpZ2h0IC8gMik7XG4gICAgbm9pc2UgPSBTaW1wbGUxRE5vaXNlKCk7XG4gICAgbm9pc2Uuc2V0U2NhbGUoLjA4KVxuICAgIG5vaXNlLnNldEFtcGxpdHVkZSgyKVxuICAgIGkgPSAwXG5cbiAgICBmb3IgeCBpbiBbMCAuLi4gQHdpZHRoXVxuICAgICAgb3V0ID0gTWF0aC5jZWlsKG5vaXNlLmdldFZhbCh4KSAqIHlfbXVsdGlwbGllcilcbiAgICAgIG91dCArPSAoTWF0aC5hYnMoeF9jZW50ZXIgLSB4KSAvIHhfY2VudGVyKSAqICh5X2NlbnRlciAvIDgpXG4gICAgICBmb3IgaSBpbiBbMCAuLi4gb3V0XVxuICAgICAgICB0eXBlID0gb3V0IC0gaSA8IDVcbiAgICAgICAgaW5kZXggPSBAX3BvaW50VG9JbmRleCh4LCBpIC0gMSlcbiAgICAgICAgaWYgdHlwZSBhbmQgQGdldEVudGl0eUF0SW5kZXgoaW5kZXgpLm5hbWUgaXMgJ0VkZ2UnXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoaW5kZXgsIG5ldyBFZGdlRW50aXR5KHR5cGUpLCB0cnVlKVxuXG4gICAgZm9yIHkgaW4gWzAgLi4uIEBoZWlnaHRdXG4gICAgICBvdXQgPSBNYXRoLmNlaWwobm9pc2UuZ2V0VmFsKHkpICogeF9tdWx0aXBsaWVyKVxuICAgICAgb3V0ICs9IChNYXRoLmFicyh5X2NlbnRlciAtIHkpIC8geV9jZW50ZXIpICogKHhfY2VudGVyIC8gOClcbiAgICAgIGZvciBpIGluIFswIC4uLiBvdXRdXG4gICAgICAgIHR5cGUgPSBvdXQgLSBpIDwgNVxuICAgICAgICBpbmRleCA9IEBfcG9pbnRUb0luZGV4KGkgLSAxLCB5KVxuICAgICAgICBpZiB0eXBlIGFuZCBAZ2V0RW50aXR5QXRJbmRleChpbmRleCkubmFtZSBpcyAnRWRnZSdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBAYXNzaWduRW50aXR5VG9JbmRleChpbmRleCwgbmV3IEVkZ2VFbnRpdHkodHlwZSksIHRydWUpXG5cbiAgICBmb3IgeCBpbiBbMCAuLi4gQHdpZHRoXVxuICAgICAgb3V0ID0gTWF0aC5jZWlsKG5vaXNlLmdldFZhbCh4KSAqIHlfbXVsdGlwbGllcilcbiAgICAgIG91dCArPSAoTWF0aC5hYnMoeF9jZW50ZXIgLSB4KSAvIHhfY2VudGVyKSAqICh5X2NlbnRlciAvIDgpXG4gICAgICBmb3IgaSBpbiBbQGhlaWdodCAuLi4gQGhlaWdodCAtIG91dF1cbiAgICAgICAgdHlwZSA9IGkgLSBAaGVpZ2h0ICsgb3V0IDwgNVxuICAgICAgICBpbmRleCA9IEBfcG9pbnRUb0luZGV4KHgsIGkgLSAxKVxuICAgICAgICBpZiB0eXBlIGFuZCBAZ2V0RW50aXR5QXRJbmRleChpbmRleCkubmFtZSBpcyAnRWRnZSdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBAYXNzaWduRW50aXR5VG9JbmRleChpbmRleCwgbmV3IEVkZ2VFbnRpdHkodHlwZSksIHRydWUpXG5cbiAgICBmb3IgeSBpbiBbMCAuLi4gQGhlaWdodF1cbiAgICAgIG91dCA9IE1hdGguY2VpbChub2lzZS5nZXRWYWwoeSkgKiB4X211bHRpcGxpZXIpXG4gICAgICBvdXQgKz0gKE1hdGguYWJzKHlfY2VudGVyIC0geSkgLyB5X2NlbnRlcikgKiAoeF9jZW50ZXIgLyA4KVxuICAgICAgZm9yIGkgaW4gW0B3aWR0aCAuLi4gQHdpZHRoIC0gb3V0XVxuICAgICAgICB0eXBlID0gaSAtIEB3aWR0aCArIG91dCA8IDVcbiAgICAgICAgaW5kZXggPSBAX3BvaW50VG9JbmRleChpIC0gMSwgeSlcbiAgICAgICAgaWYgdHlwZSBhbmQgQGdldEVudGl0eUF0SW5kZXgoaW5kZXgpLm5hbWUgaXMgJ0VkZ2UnXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoaW5kZXgsIG5ldyBFZGdlRW50aXR5KHR5cGUpLCB0cnVlKVxuXG5cblxuICBzZXRGbG93VHlwZTogKHR5cGUpIC0+XG4gICAgQGZsb3cgPSBmbG93W3R5cGVdKEB3aWR0aCwgQGhlaWdodClcblxuICB0aWNrOiAtPlxuICAgIG5lZWRlZF9tYXRlcmlhbCA9IEBfZ2V0TmVlZGVkTWF0ZXJpYWxDb3VudCgpXG4gICAgaWYgbmVlZGVkX21hdGVyaWFsID4gMFxuICAgICAgQF9hZGRNYXRlcmlhbCgpIGZvciBbMCAuLiBuZWVkZWRfbWF0ZXJpYWxdXG4gICAgaWYgTWF0aC5yYW5kb20oKSAqIDEwMDAwIDwgdmFyaWFibGVzLmNoYW5jZV9yb2FtZXJfc3Bhd25cbiAgICAgIEBfYWRkUm9hbWVyKClcbiAgICBpZiBNYXRoLnJhbmRvbSgpICogMTAwMDAgPCB2YXJpYWJsZXMuY2hhbmNlX3Byb2R1Y2VyX3NwYXduXG4gICAgICBAX2FkZFByb2R1Y2VyKClcbiAgICBlbnRpdHkudGljaygpIGZvciBlbnRpdHkgaW4gc2h1ZmZsZShAX21hcC5zbGljZSgpKVxuICAgIEBfdGljaysrXG5cbiAgZ2V0UmVuZGVyOiAtPlxuICAgIEBfaW1hZ2VcblxuICBnZXRFbnRpdHlBdFhZOiAoeCwgeSkgLT5cbiAgICBAZ2V0RW50aXR5QXRJbmRleChAX3BvaW50VG9JbmRleCh4LCB5KSlcblxuICBnZXRFbnRpdHlBdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgaWYgQF9tYXBbaW5kZXhdPyB0aGVuIEBfbWFwW2luZGV4XSBlbHNlIGZhbHNlXG5cbiAgZ2V0RW50aXRpZXNJblJhbmdlOiAoaW5kZXhfbWluLCBpbmRleF9tYXgpIC0+XG4gICAgQF9tYXAuc2xpY2UoaW5kZXhfbWluLCBpbmRleF9tYXggKyAxKVxuXG4gIHN3YXBFbnRpdGllczogKGluZGV4MSwgaW5kZXgyKSAtPlxuICAgIGVudDEgPSBAZ2V0RW50aXR5QXRJbmRleCBpbmRleDFcbiAgICBlbnQyID0gQGdldEVudGl0eUF0SW5kZXggaW5kZXgyXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXggaW5kZXgxLCBlbnQyXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXggaW5kZXgyLCBlbnQxXG4gICAgZW50MS5pc19kZWxldGVkID0gZmFsc2VcbiAgICBlbnQyLmlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIHRydWVcblxuICBnZXRFbnRpdHlBdERpcmVjdGlvbjogKGluZGV4LCBkaXJlY3Rpb24pIC0+XG4gICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnXG4gICAgICAgIGlmIGluZGV4ID4gQHdpZHRoIC0gMVxuICAgICAgICAgIEBnZXRFbnRpdHlBdEluZGV4KGluZGV4IC0gQHdpZHRoKVxuICAgICAgICBlbHNlIGZhbHNlXG4gICAgICB3aGVuICdkb3duJ1xuICAgICAgICBpZiBpbmRleCA8IEBfbWFwLmxlbmd0aCAtIDFcbiAgICAgICAgICBAZ2V0RW50aXR5QXRJbmRleChpbmRleCArIEB3aWR0aClcbiAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgaWYgaW5kZXggJSBAd2lkdGggPiAwXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggLSAxKVxuICAgICAgICBlbHNlIGZhbHNlXG4gICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgaWYgaW5kZXggJSBAd2lkdGggPCBAd2lkdGggLSAxXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggKyAxKVxuICAgICAgICBlbHNlIGZhbHNlXG5cbiAgYXNzaWduRW50aXR5VG9JbmRleDogKGluZGV4LCBlbnRpdHksIGlzX25ldyA9IGZhbHNlKSAtPlxuICAgIGN1cnJlbnRfZW50aXR5ID0gQGdldEVudGl0eUF0SW5kZXgoaW5kZXgpXG4gICAgaWYgY3VycmVudF9lbnRpdHlcbiAgICAgIGN1cnJlbnRfZW50aXR5LmlzX2RlbGV0ZWQgPSB0cnVlXG4gICAgICBAX2NvdW50c1tjdXJyZW50X2VudGl0eS5uYW1lXS0tXG5cbiAgICBAX2NvdW50c1tlbnRpdHkubmFtZV0rK1xuXG4gICAgQF9tYXBbaW5kZXhdID0gZW50aXR5XG4gICAgZW50aXR5LmlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIGlmIGlzX25ld1xuICAgICAgZW50aXR5LmluaXQgQCwgaW5kZXhcbiAgICBlbHNlXG4gICAgICBlbnRpdHkubW92ZWQoaW5kZXgpXG4gICAgdHJ1ZVxuXG4jcHJpdmF0ZXNcbiAgX3BvaW50VG9JbmRleDogKHgsIHkpIC0+IHggKyBAd2lkdGggKiB5XG4gIF9pbmRleFRvUG9pbnQ6IChpbmRleCkgLT4gW2luZGV4ICUgQHdpZHRoLCBNYXRoLmZsb29yKGluZGV4IC8gQHdpZHRoKV1cbiAgX2FkZEVudGl0eVRvRW1wdHk6ICh0eXBlKSAtPlxuICAgIGxvb3BcbiAgICAgIGkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoQF9tYXAubGVuZ3RoIC0gMSkpXG4gICAgICBicmVhayBpZiBAZ2V0RW50aXR5QXRJbmRleChpKT8ubmFtZSBpcyAnRW1wdHknXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoaSwgbmV3IHR5cGUoKSwgdHJ1ZSlcblxuICBfZ2V0TmVlZGVkTWF0ZXJpYWxDb3VudDogLT5cbiAgICBNYXRoLmZsb29yKEBfbWFwLmxlbmd0aCAqIHZhcmlhYmxlcy5lbXB0eV9yYXRpbykgLSBAX2NvdW50cy5Db21wbGV4TWF0ZXJpYWwgLSBAX2NvdW50cy5SYXdNYXRlcmlhbCAtIEBfY291bnRzLlByb2R1Y2VyXG5cbiAgX2FkZE1hdGVyaWFsOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShSYXdNYXRlcmlhbEVudGl0eSlcblxuICBfYWRkQ29tcGxleE1hdGVyaWFsOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShDb21wbGV4TWF0ZXJpYWxFbnRpdHkpXG5cbiAgX2FkZFJvYW1lcjogLT5cbiAgICBAX2FkZEVudGl0eVRvRW1wdHkoUm9hbWluZ0VudGl0eSlcblxuICBfYWRkUHJvZHVjZXI6IC0+XG4gICAgQF9hZGRFbnRpdHlUb0VtcHR5KFByb2R1Y2VyRW50aXR5KVxuXG4jZGVidWdzXG4gICQkZHVtcE1hcDogLT5cbiAgICBjb25zb2xlLmRlYnVnIEBfbWFwXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwXG5cblxuIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIFNpbXBsZSB3YXkgdG8gc2h1ZmZsZSBhcnJheVxuIyMjXG5cbm1vZHVsZS5leHBvcnRzID0gKGFycmF5KSAtPlxuICBjb3VudGVyID0gYXJyYXkubGVuZ3RoXG4gICMgV2hpbGUgdGhlcmUgYXJlIGVsZW1lbnRzIGluIHRoZSBhcnJheVxuICB3aGlsZSBjb3VudGVyID4gMFxuICAgICMgUGljayBhIHJhbmRvbSBpbmRleFxuICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRlcilcbiAgICAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgIGNvdW50ZXItLVxuICAgICMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG4gICAgdGVtcCA9IGFycmF5W2NvdW50ZXJdXG4gICAgYXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cbiAgICBhcnJheVtpbmRleF0gPSB0ZW1wXG4gIGFycmF5IiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIEhvbGRlciBmb3IgdmFyaWFibGVzLlxuIyMjXG5cbnZhcmlhYmxlcyA9XG4gIE1hcDpcbiAgICBlbXB0eV9yYXRpbzogLjFcbiAgICBjaGFuY2VfcHJvZHVjZXJfc3Bhd246IDEwMFxuICAgIGNoYW5jZV9yb2FtZXJfc3Bhd246IDEwMFxuICBQcm9kdWNlckVudGl0eTpcbiAgICBzdGFydGluZ19saWZlOiAyMDBcbiAgICBsaWZlX2dhaW5fcGVyX2Zvb2Q6IDEyMDBcbiAgICBsaWZlX3RvX3JlcHJvZHVjZTogNjAwXG4gICAgbGlmZV9sb3NzX3RvX3JlcHJvZHVjZTogNDAwXG4gICAgbWF4X2xpZmU6IDYwMFxuICAgIG1pbl9saWZlX3RvX3RyYW5zZmVyOiA1MFxuICAgIG1heF9saWZlX3RyYW5zZmVyOiA1MFxuICAgIGVhdGluZ19jb29sZG93bjogMTBcbiAgICBhZ2VfdG9fcmVwcm9kdWNlOiA4MFxuICAgIG9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllcjogMTAwMDAwMDBcbiAgUm9hbWluZ0VudGl0eTpcbiAgICBzdHVja190aWNrczogMjBcbiAgICBzdHVja19jb29sZG93bjogMjBcbiAgICBzdGFydGluZ19oZWFsdGhfZnJlc2g6IDEwMFxuICAgIHN0YXJ0aW5nX2hlYWx0aF9jbG9uZTogMjBcbiAgICBtYXhfbGlmZTogMjAwXG4gICAgbGlmZV9nYWluX3Blcl9mb29kOiA1MFxuICAgIGxpZmVfdG9fcmVwcm9kdWNlOiAyMDBcbiAgICBsaWZlX2xvc3NfdG9fcmVwcm9kdWNlOiA1MFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB2YXJpYWJsZXNcbiIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBIYW5kbGVzIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGUgbWFwIGFuZCB0aGUgbWFpbiB0aHJlYWQuIEFsc28gaW5zdHJ1Y3RzIHRoZVxuICBtYXAgd2hlbiB0byB0aWNrLlxuIyMjXG5cbk1hcCA9IHJlcXVpcmUgJy4vbGliL21hcCdcbkZQUyA9IHJlcXVpcmUoJy4vbGliL2ZwcycpXG52YXJpYWJsZXMgPSByZXF1aXJlICcuL2xpYi92YXJpYWJsZUhvbGRlcidcblxudGFyZ2V0X3RwcyA9IDQwXG5cbm1hcCA9IG51bGxcbnJ1bm5pbmcgPSBmYWxzZVxubWFwX3RpY2tfaW50ID0gLTE7XG5mcHMgPSBGUFMoKVxuXG50aWNrID0gLT5cbiAgbWFwLnRpY2soKVxuICBmcHMudGljaygpXG4gIG51bGxcblxuaW5pdCA9ICh3aWR0aCwgaGVpZ2h0LCBzZWVkLCBmbG93KSAtPlxuICBNYXRoLnJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20vbGliL2FsZWEnKShzZWVkKVxuICBtYXAgPSBuZXcgTWFwIHdpZHRoLCBoZWlnaHQsIGZsb3dcbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ2luaXRpYWxpemVkJ11cblxuc3RhcnQgPSAoKSAtPlxuICBydW5uaW5nID0gdHJ1ZVxuICBmcHMgPSBGUFMoKVxuICBzZWxmLnBvc3RNZXNzYWdlIFsnc3RhcnRlZCddXG4gIGNsZWFySW50ZXJ2YWwgbWFwX3RpY2tfaW50XG4gIG1hcF90aWNrX2ludCA9IHNldEludGVydmFsIHRpY2ssIDEwMDAvdGFyZ2V0X3Rwc1xuXG5zdG9wID0gLT5cbiAgcnVubmluZyA9IGZhbHNlXG4gIGNsZWFySW50ZXJ2YWwgbWFwX3RpY2tfaW50XG4gIHNlbGYucG9zdE1lc3NhZ2UgWydzdG9wcGVkJ11cblxuc2VuZEltYWdlRGF0YSA9IC0+XG4gIHNlbGYucG9zdE1lc3NhZ2UgWydpbWFnZURhdGEnLCBtYXAuZ2V0UmVuZGVyKCldXG5cbnNlbmRUUFMgPSAtPlxuICBzZWxmLnBvc3RNZXNzYWdlIFsndHBtJywgZnBzLmdldEZwcygpXVxuXG51cGRhdGVWYXJpYWJsZSA9ICh0eXBlLCB2YXJpYWJsZSwgdmFsdWUpIC0+XG4gIGNvbnNvbGUuZGVidWcgXCJVcGRhdGluZyAje3R5cGV9LiN7dmFyaWFibGV9IHRvICN7dmFsdWV9XCJcbiAgdmFyaWFibGVzW3R5cGVdW3ZhcmlhYmxlXSA9IHZhbHVlXG5cbmdldFZhcmlhYmxlcyA9IC0+XG4gIHNlbGYucG9zdE1lc3NhZ2UgWyd2YXJpYWJsZXMnLCB2YXJpYWJsZXNdXG5cbnNldEZsb3dUeXBlID0gKHR5cGUpIC0+XG4gIG1hcC5zZXRGbG93VHlwZSh0eXBlKVxuXG5cbnNlbGYub25tZXNzYWdlID0gKGUpIC0+XG4gIHN3aXRjaCBlLmRhdGFbMF1cbiAgICB3aGVuICdpbml0JyAgICAgICAgICAgdGhlbiBpbml0KGUuZGF0YVsxXSwgZS5kYXRhWzJdLCBlLmRhdGFbM10sIGUuZGF0YVs0XSlcbiAgICB3aGVuICdzdGFydCcgICAgICAgICAgdGhlbiBzdGFydCgpXG4gICAgd2hlbiAnc3RvcCcgICAgICAgICAgIHRoZW4gc3RvcCgpXG4gICAgd2hlbiAnc2VuZEltYWdlRGF0YScgIHRoZW4gc2VuZEltYWdlRGF0YSgpXG4gICAgd2hlbiAnc2VuZFRQUycgICAgICAgIHRoZW4gc2VuZFRQUygpXG4gICAgd2hlbiAndXBkYXRlVmFyaWFibGUnIHRoZW4gdXBkYXRlVmFyaWFibGUoZS5kYXRhWzFdLCBlLmRhdGFbMl0sIGUuZGF0YVszXSlcbiAgICB3aGVuICdnZXRWYXJpYWJsZXMnICAgdGhlbiBnZXRWYXJpYWJsZXMoKVxuICAgIHdoZW4gJ3NldEZsb3dUeXBlJyAgICB0aGVuIHNldEZsb3dUeXBlKGUuZGF0YVsxXSlcbiAgICBlbHNlIGNvbnNvbGUuZXJyb3IgXCJVbmtub3duIENvbW1hbmQgI3tlLmRhdGFbMF19XCJcblxuIl19
