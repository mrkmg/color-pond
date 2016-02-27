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

  BaseEntity.prototype.tick = function() {};

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

  function EdgeEntity() {
    EdgeEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    this.color = [50, 50, 50, 255];
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
    return LivingEntity.__super__.tick.call(this) && (this.health <= 0 ? (this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true), this.died(), false) : (this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, 20 + Math.round((this.health / this.max_health) * 235))), true));
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
    direction = Math.random() * 90 > dec ? (intp + 1).mod(4) : (intp + 2).mod(4);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsInNyYy9lbnRpdGllcy9CYXNlRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9Db21wbGV4TWF0ZXJpYWxFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VkZ2VFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL0VtcHR5RW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9GbG93aW5nRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9MaXZpbmdFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL1Byb2R1Y2VyRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9SYXdNYXRlcmlhbEVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvUm9hbWluZ0VudGl0eS5jb2ZmZWUiLCJzcmMvbGliL1NpbXBsZTFETm9pc2UuY29mZmVlIiwic3JjL2xpYi9mbG93LmNvZmZlZSIsInNyYy9saWIvZnBzLmNvZmZlZSIsInNyYy9saWIvbWFwLmNvZmZlZSIsInNyYy9saWIvc2h1ZmZsZUFycmF5LmNvZmZlZSIsInNyYy9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlIiwic3JjL3Byb2Nlc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RDdCLFNBRU8sT0FGUDthQUU2QixLQUFBLENBQUE7QUFGN0IsU0FHTyxNQUhQO2FBRzZCLElBQUEsQ0FBQTtBQUg3QixTQUlPLGVBSlA7YUFJNkIsYUFBQSxDQUFBO0FBSjdCLFNBS08sU0FMUDthQUs2QixPQUFBLENBQUE7QUFMN0IsU0FNTyxnQkFOUDthQU02QixjQUFBLENBQWUsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXRCLEVBQTBCLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFqQyxFQUFxQyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBNUM7QUFON0IsU0FPTyxjQVBQO2FBTzZCLFlBQUEsQ0FBQTtBQVA3QixTQVFPLGFBUlA7YUFRNkIsV0FBQSxDQUFZLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFuQjtBQVI3QjthQVNPLE9BQU8sQ0FBQyxLQUFSLENBQWMsa0JBQUEsR0FBbUIsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXhDO0FBVFA7QUFEZSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy8gXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vLyBcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gQWxlYShzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIG1hc2ggPSBNYXNoKCk7XG5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gMjA5MTYzOSAqIG1lLnMwICsgbWUuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgbWUuczAgPSBtZS5zMTtcbiAgICBtZS5zMSA9IG1lLnMyO1xuICAgIHJldHVybiBtZS5zMiA9IHQgLSAobWUuYyA9IHQgfCAwKTtcbiAgfTtcblxuICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gIG1lLmMgPSAxO1xuICBtZS5zMCA9IG1hc2goJyAnKTtcbiAgbWUuczEgPSBtYXNoKCcgJyk7XG4gIG1lLnMyID0gbWFzaCgnICcpO1xuICBtZS5zMCAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczAgPCAwKSB7IG1lLnMwICs9IDE7IH1cbiAgbWUuczEgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMxIDwgMCkgeyBtZS5zMSArPSAxOyB9XG4gIG1lLnMyIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMiA8IDApIHsgbWUuczIgKz0gMTsgfVxuICBtYXNoID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYyA9IGYuYztcbiAgdC5zMCA9IGYuczA7XG4gIHQuczEgPSBmLnMxO1xuICB0LnMyID0gZi5zMjtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgQWxlYShzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IHhnLm5leHQ7XG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgKiAweDEwMDAwMDAwMCkgfCAwOyB9XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBybmcoKSArIChwcm5nKCkgKiAweDIwMDAwMCB8IDApICogMS4xMTAyMjMwMjQ2MjUxNTY1ZS0xNjsgLy8gMl4tNTNcbiAgfTtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmZ1bmN0aW9uIE1hc2goKSB7XG4gIHZhciBuID0gMHhlZmM4MjQ5ZDtcblxuICB2YXIgbWFzaCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9O1xuXG4gIHJldHVybiBtYXNoO1xufVxuXG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMuYWxlYSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIEJhc2VFbnRpdHkgaXMgdGhlIHJvb3QgY2xhc3MgdGhhdCBhbGwgRW50aXRpZXMgd2lsbCBldmVudHVhbGx5IGV4dGVudCBmcm9tLlxuICBJdCBpbXBsZW1lbnRzIGFsbCB0aGUgcmVxdWlyZWQgcHVibGljIGZ1bmN0aW9ucyBmb3IgYW4gZW50aXR5IHRvIGV4aXN0XG4jIyNcblxuY2xhc3MgQmFzZUVudGl0eVxuICBuYW1lOiAnQmFzZSdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAaXNfbW92ZWFibGUgPSB0cnVlXG4gICAgQGlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIEBjb2xvciA9IFswLCAwLCAwLCAyNTVdXG5cbiAgaW5pdDogKG1hcCwgaW5kZXgpIC0+XG4gICAgQG1hcCA9IG1hcFxuICAgIEBtb3ZlZChpbmRleClcbiAgICBAc2V0Q29sb3IgQGNvbG9yWzBdLCBAY29sb3JbMV0sIEBjb2xvclsyXSwgQGNvbG9yWzNdXG4gICAgdHJ1ZVxuXG4gICMgV2hlbiBhbiBlbnRpdHkgaXMgbW92ZWQgb24gdGhlIG1hcCwgd2UgdXBkYXRlIHRoZSByZWZlcmVuY2UgdG8gdGhlIGluZGV4LCBjYWxjdWxhdGVcbiAgIyB0aGUgeHkgcG9pbnQsIGFuZCBzZXQgdGhlIGNvbG9yLlxuICBtb3ZlZDogKG5ld19pbmRleCkgLT5cbiAgICBAbWFwX2luZGV4ID0gbmV3X2luZGV4XG4gICAgW0BtYXBfeCwgQG1hcF95XSA9IEBtYXAuX2luZGV4VG9Qb2ludChuZXdfaW5kZXgpXG4gICAgQHNldENvbG9yIEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIEBjb2xvclszXVxuICAgIHRydWVcblxuICBzZXRDb2xvcjogKHIsIGcsIGIsIGEpIC0+XG4gICAgdW5sZXNzIEBpc19kZWxldGVkXG4gICAgICBAY29sb3IgPSBbciwgZywgYiwgYV1cbiAgICAgIGltYWdlX2luZGV4ID0gQG1hcF9pbmRleCAqIDQ7XG5cbiAgICAgICMgQ3VycmVudGx5IHdyaXRlcyBjb2xvciBkaXJlY3RseSB0byBtYXAuIE1heSBjaGFuZ2UgdGhpcyBhdCBzb21lIHBvaW50LlxuICAgICAgIyBUaGlzIGRyYW1hdGljYWxseSByZWR1Y2VzIHRoZSBudW1iZXIgb2YgYWx0ZXJhdGlvbnMgdG8gdGhlIG1hcCBpbWFnZSBvYmplY3QuXG4gICAgICAjIE1heSBhZGQgYSBwdWJsaWMgbWV0aG9kIHRvIHRoZSBtYXAgdG8gZG8gdGhpcy5cbiAgICAgIEBtYXAuX2ltYWdlW2ltYWdlX2luZGV4XSA9IHJcbiAgICAgIEBtYXAuX2ltYWdlW2ltYWdlX2luZGV4ICsgMV0gPSBnXG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleCArIDJdID0gYlxuICAgICAgQG1hcC5faW1hZ2VbaW1hZ2VfaW5kZXggKyAzXSA9IGFcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIHRpY2s6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUVudGl0eSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBUaGUgQ29tcGxleE1hdGVyaWFsRW50aXR5IGlzIGp1c3QgYSByZWQgZmxvd2luZyBlbnRpdHlcbiMjI1xuXG5GbG93aW5nRW50aXR5ID0gcmVxdWlyZSAnLi9GbG93aW5nRW50aXR5J1xuXG5jbGFzcyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdDb21wbGV4TWF0ZXJpYWwnXG5cbiAgY29uc3RydWN0b3I6IChAdHlwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSozKSktPlxuICAgIHN1cGVyXG4gICAgQGlzX21vdmVhYmxlID0gZmFsc2VcbiAgICBzd2l0Y2ggQHR5cGVcbiAgICAgIHdoZW4gMFxuICAgICAgICBAY29sb3IgPSBbMjU1LCAwLCAwLCAyNTVdXG4gICAgICB3aGVuIDFcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgNTAsIDUwLCAyNTVdXG4gICAgICB3aGVuIDJcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgMTAwLCAxMDAsIDI1NV1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBsZXhNYXRlcmlhbEVudGl0eSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBUaGUgRWRnZUVudGl0eSBpcyBmb3IgdGhlIGVkZ2VzIG9mIHRoZSBtYXBcbiMjI1xuXG5CYXNlRW50aXR5ID0gcmVxdWlyZSAnLi9CYXNlRW50aXR5J1xuXG5kaXJlY3Rpb25zID0gWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVxuXG5jbGFzcyBFZGdlRW50aXR5IGV4dGVuZHMgQmFzZUVudGl0eVxuICBuYW1lOiAnRWRnZSdcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBjb2xvciA9IFs1MCwgNTAsIDUwLCAyNTVdXG5cbm1vZHVsZS5leHBvcnRzID0gRWRnZUVudGl0eSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBUaGUgRW1wdHlFbnRpdHkgaXMgdGhlIHBsYWNlaG9sZGVyIGZvciBlbXB0eSBzcG90c1xuIyMjXG5cbkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5cbm1pbkJyaWdodG5lc3MgPSAwXG5tYXhCcmlnaHRuZXNzID0gMjBcblxuY2xhc3MgRW1wdHlFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdFbXB0eSdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigpXG4gICAgQGNvbG9yID0gWzAsIDAsIDAsIDI1NV1cblxuICB0aWNrOiAtPlxuICAgIHN1cGVyKCkgYW5kIChcbiAgICAgIGZhbHNlXG4jICAgICAgY29sb3JzID0gQGNvbG9yLmNvbmNhdCgpXG4jICAgICAgaW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMyk7XG4jICAgICAgY3VycmVudF9jb2xvciA9IGNvbG9yc1tpbmRdO1xuIyAgICAgIGluY3JlbWVudCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSAtIDEpICogM1xuIyAgICAgIGNvbG9yc1tpbmRdID0gTWF0aC5taW4obWF4QnJpZ2h0bmVzcywgTWF0aC5tYXgobWluQnJpZ2h0bmVzcywgY3VycmVudF9jb2xvciArIGluY3JlbWVudCkpXG4jICAgICAgQHNldENvbG9yKGNvbG9yc1swXSwgY29sb3JzWzFdLCBjb2xvcnNbMl0sIGNvbG9yc1szXSlcbiAgICApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFbXB0eUVudGl0eSIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBUaGUgRmxvd2luZ0VudGl0eSBpcyBhIGJhc2UgZW50aXR5IHRvIGdpdmUgYW4gZW50aXR5IHRoZSBhYmlsaXR5IHRvIGZsb3cgd2l0aCB0aGUgbWFwJ3MgY3VycmVudFxuIyMjXG5cbkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5cbmRpcmVjdGlvbnMgPSBbJ3JpZ2h0JywgJ2Rvd24nLCAnbGVmdCcsICd1cCddXG5cbmNsYXNzIEZsb3dpbmdFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdGbG93aW5nJ1xuICBjb25zdHJ1Y3RvcjogLT4gc3VwZXJcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIGRpcmVjdGlvbiA9IGlmIE1hdGgucmFuZG9tKCkgPiAuNSB0aGVuIGRpcmVjdGlvbnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldIGVsc2UgQG1hcC5mbG93KEBtYXBfaW5kZXgpXG5cbiAgICAgIGVudGl0eSA9IEBtYXAuZ2V0RW50aXR5QXREaXJlY3Rpb24oQG1hcF9pbmRleCwgZGlyZWN0aW9uKVxuXG4gICAgICBpZiBlbnRpdHkgYW5kIGVudGl0eS5pc19tb3ZlYWJsZVxuICAgICAgICBAbWFwLnN3YXBFbnRpdGllcyhAbWFwX2luZGV4LCBlbnRpdHkubWFwX2luZGV4KVxuICAgICAgZWxzZVxuXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb3dpbmdFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIExpdmluZ0VudGl0eSBpcyBhIGJhc2UgZW50aXR5IHdoaWNoIGtpbGxzIGFuIGVudGl0eSBhbmQgYWRqdXN0cyB0aGUgdHJhbnNwYXJlbmN5IGJhc2VkIG9uIGhlYWx0aFxuIyMjXG5cbkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5FbXB0eUVudGl0eSA9IHJlcXVpcmUgJy4vRW1wdHlFbnRpdHknXG5cbmNsYXNzIExpdmluZ0VudGl0eSBleHRlbmRzIEJhc2VFbnRpdHlcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAbWF4X2hlYWx0aCA9IDQwMFxuXG4gIGRpZWQ6IC0+XG5cbiAgdGljazogLT5cbiAgICBzdXBlcigpIGFuZCAoXG4gICAgICBpZiBAaGVhbHRoIDw9IDBcbiAgICAgICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KEBtYXBfaW5kZXgsIG5ldyBFbXB0eUVudGl0eSgpLCB0cnVlKVxuICAgICAgICBAZGllZCgpXG4gICAgICAgIGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXRDb2xvcihAY29sb3JbMF0sIEBjb2xvclsxXSwgQGNvbG9yWzJdLCBNYXRoLm1pbigyNTUsIDIwICsgTWF0aC5yb3VuZCgoQGhlYWx0aCAvIEBtYXhfaGVhbHRoKSoyMzUpKSlcbiAgICAgICAgdHJ1ZVxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSBMaXZpbmdFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFByb2R1Y2VyRW50aXR5IGlzIGFuIGVudGl0eSB3aGljaCBjb25zdW1lcyBSYXdNYXRlcmlhbCwgc2hhcmVzIGhlYWx0aCB3aXRoIG90aGVyIGZyaWVuZGx5XG4gIFByb2R1Y2VycywgYW5kIHdoZW4gZGllcyB0dXJuIGludG8gYSBDb21wbGV4TWF0ZXJpYWxcbiMjI1xuXG5MaXZpbmdFbnRpdHkgPSByZXF1aXJlICcuL0xpdmluZ0VudGl0eSdcbkVtcHR5RW50aXR5ID0gcmVxdWlyZSAnLi9FbXB0eUVudGl0eSdcbkNvbXBsZXhNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vQ29tcGxleE1hdGVyaWFsRW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZUhvbGRlciA9IHJlcXVpcmUoJy4uL2xpYi92YXJpYWJsZUhvbGRlcicpLlByb2R1Y2VyRW50aXR5XG5cbmZpeG1vZCA9IChtLCBuKSAtPiAoKG0lbikrbiklblxuXG5jbGFzcyBQcm9kdWNlckVudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUHJvZHVjZXInXG5cbiAgY29uc3RydWN0b3I6IChAd2FudHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMykpLT5cbiAgICBzdXBlclxuICAgIEBtYWtlcyA9IGZpeG1vZChAd2FudHMgKyAxLCAzKVxuICAgIEBpc19tb3ZlYWJsZSA9IGZhbHNlXG4gICAgQGNvbG9yID0gWzAsIDI1NSwgMCwgMjU1XVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZUhvbGRlci5zdGFydGluZ19saWZlXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZUhvbGRlci5tYXhfbGlmZVxuICAgIEBsYXN0X2F0ZSA9IDBcbiAgICBAYWdlID0gMFxuXG4gIGdldFNpZGVzOiAtPlxuICAgIChAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpIGZvciBzaWRlIGluIHNodWZmbGUgWyd1cCcsICdkb3duJywgJ2xlZnQnLCAncmlnaHQnXSlcblxuICBlYXQ6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAbGFzdF9hdGUgPSAwXG4gICAgICBAYWdlID0gMFxuICAgICAgQGhlYWx0aCArPSB2YXJpYWJsZUhvbGRlci5saWZlX2dhaW5fcGVyX2Zvb2RcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgRW1wdHlFbnRpdHkoKSwgdHJ1ZSlcbiAgICApIGZvciBlbnRpdHkgaW4gZW50aXRpZXMgd2hlbiBAaGVhbHRoIDwgQG1heF9oZWFsdGhcblxuICB0cmFuc2ZlckhlYWx0aDogKGVudGl0aWVzKSAtPlxuICAgIGZvciBlbnRpdHkgaW4gZW50aXRpZXNcbiAgICAgIG5lZWRzID0gKFxuICAgICAgICBpZiAoQGhlYWx0aCA8IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyIGFuZCBlbnRpdHkuaGVhbHRoID4gdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIpXG4gICAgICAgICAgTWF0aC5mbG9vcihAaGVhbHRoICogLjkpXG4gICAgICAgIGVsc2UgaWYgKChAaGVhbHRoIDwgdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIgYW5kIGVudGl0eS5oZWFsdGggPCB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2Zlcikgb3IgKEBoZWFsdGggPiB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2ZlciBhbmQgZW50aXR5LmhlYWx0aCA+IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyKSkgYW5kIEBoZWFsdGggPiBlbnRpdHkuaGVhbHRoXG4gICAgICAgICAgTWF0aC5taW4oTWF0aC5jZWlsKChAaGVhbHRoIC0gZW50aXR5LmhlYWx0aCkgLyAyKSwgdmFyaWFibGVIb2xkZXIubWF4X2xpZmVfdHJhbnNmZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAwXG4gICAgICApXG5cbiAgICAgIGlmIG5lZWRzID4gMFxuICAgICAgICBAaGVhbHRoIC09IG5lZWRzXG4gICAgICAgIGVudGl0eS5oZWFsdGggKz0gbmVlZHNcblxuICAgIHRydWVcblxuICByZXByb2R1Y2U6IChlbnRpdGllcykgLT5cbiAgICAoXG4gICAgICBAaGVhbHRoIC09IHZhcmlhYmxlSG9sZGVyLmxpZmVfbG9zc190b19yZXByb2R1Y2VcbiAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBuZXcgUHJvZHVjZXJFbnRpdHkoQHdhbnRzKSwgdHJ1ZSlcbiAgICAgIEBhZ2UgPSAwXG4gICAgKSBmb3IgZW50aXR5IGluIGVudGl0aWVzIHdoZW4gQGhlYWx0aCA+PSB2YXJpYWJsZUhvbGRlci5saWZlX3RvX3JlcHJvZHVjZVxuXG4gIGRpZWQ6IC0+XG4gICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KEBtYXBfaW5kZXgsIG5ldyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkoQG1ha2VzKSwgdHJ1ZSlcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIEBsYXN0X2F0ZSsrXG4gICAgICBAYWdlKytcblxuICAgICAgc2lkZXMgPSAoZW50aXR5IGZvciBlbnRpdHkgaW4gQGdldFNpZGVzKCkgd2hlbiBlbnRpdHkpXG5cbiAgICAgIHBsYWNlYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiRW1wdHlcIilcbiAgICAgIGZyaWVuZGx5X2VudGl0aWVzID0gKGVudGl0eSBmb3IgZW50aXR5IGluIHNpZGVzIHdoZW4gZW50aXR5Lm5hbWUgaXMgXCJQcm9kdWNlclwiIGFuZCBlbnRpdHkud2FudHMgaXMgQHdhbnRzIGFuZCBlbnRpdHkubWFrZXMgaXMgQG1ha2VzKVxuICAgICAgY29uc3VtYWJsZV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiUmF3TWF0ZXJpYWxcIiBhbmQgZW50aXR5LnR5cGUgaXMgQHdhbnRzKVxuXG4gICAgICBAdHJhbnNmZXJIZWFsdGgoZnJpZW5kbHlfZW50aXRpZXMpXG5cbiAgICAgIGlmIEBhZ2UgPiB2YXJpYWJsZUhvbGRlci5hZ2VfdG9fcmVwcm9kdWNlIGFuZCBNYXRoLnBvdyhmcmllbmRseV9lbnRpdGllcy5sZW5ndGgrMSwgMikvMTYgPiBNYXRoLnJhbmRvbSgpXG4gICAgICAgIEByZXByb2R1Y2UocGxhY2VhYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBAbGFzdF9hdGUgPiB2YXJpYWJsZUhvbGRlci5lYXRpbmdfY29vbGRvd25cbiAgICAgICAgQGVhdChjb25zdW1hYmxlX2VudGl0aWVzKVxuXG4gICAgICBpZiBmcmllbmRseV9lbnRpdGllcy5sZW5ndGggaXMgNFxuICAgICAgICBAYWdlID0gMFxuICAgICAgICBAY29sb3JbMV0gPSAyNTVcbiAgICAgICAgQGhlYWx0aCAtPSAxXG4gICAgICBlbHNlXG4gICAgICAgIEBoZWFsdGggLT0gMlxuICAgICAgICBAY29sb3JbMV0gPSAyMDBcblxuICAgICAgaWYgQGFnZSAvIHZhcmlhYmxlSG9sZGVyLm9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllciA+IE1hdGgucmFuZG9tKClcbiAgICAgICAgQGRpZWQoKVxuXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZHVjZXJFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFJhd01hdGVyaWFsRW50aXR5IGlzIGp1c3QgYSBibHVlIGZsb3dpbmcgZW50aXR5XG4jIyNcblxuRmxvd2luZ0VudGl0eSA9IHJlcXVpcmUgJy4vRmxvd2luZ0VudGl0eSdcblxuY2xhc3MgUmF3TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdSYXdNYXRlcmlhbCdcblxuICBjb25zdHJ1Y3RvcjogKEB0eXBlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjMpKSAtPlxuICAgIHN1cGVyXG4gICAgc3dpdGNoIEB0eXBlXG4gICAgICB3aGVuIDBcbiAgICAgICAgQGNvbG9yID0gWzAsIDAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAxXG4gICAgICAgIEBjb2xvciA9IFs1MCwgNTAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAyXG4gICAgICAgIEBjb2xvciA9IFsxMDAsIDEwMCwgMjU1LCAyNTVdXG5cbm1vZHVsZS5leHBvcnRzID0gUmF3TWF0ZXJpYWxFbnRpdHkiLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIFJvYW1pbmdFbnRpdHkgaXMgYW4gZW50aXR5IHdoaWNoIHdpbGwgaHVudCBvdXQgQ29tcGxleE1hdGVyaWFsIGFuZCB0dXJuIGl0IGJhY2sgaW50byBSYXdNYXRlcmlhbFxuIyMjXG5cbkxpdmluZ0VudGl0eSA9IHJlcXVpcmUgJy4vTGl2aW5nRW50aXR5J1xuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuL0VtcHR5RW50aXR5J1xuc2h1ZmZsZSA9IHJlcXVpcmUgJy4uL2xpYi9zaHVmZmxlQXJyYXknXG5SYXdNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4vUmF3TWF0ZXJpYWxFbnRpdHknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuLi9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlJykuUm9hbWluZ0VudGl0eVxuXG5zZWFyY2hfcmFkaXVzID0gMTBcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgUm9hbWluZ0VudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUm9hbWluZydcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBzdXBlcigpXG4gICAgQG1heF9oZWFsdGggPSB2YXJpYWJsZXMubWF4X2xpZmVcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBoZWFsdGggPSB2YXJpYWJsZXMuc3RhcnRpbmdfaGVhbHRoX2ZyZXNoXG4gICAgQGNvbG9yID0gWzI1NSwgMjU1LCAwLCAyNTVdXG4gICAgQHN0dWNrX2NvdW50ID0gMFxuICAgIEBzdHVja19jb29sZG93biA9IDBcblxuICBjaG9vc2VEaXJlY3Rpb246IC0+XG4gICAgQHdhbnRlZF9kaXJlY3Rpb24gPSBkaXJlY3Rpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXVxuXG4gIGRvTW92ZW1lbnQ6IC0+XG4gICAgc2VsZiA9IEBcblxuICAgIGlmIEBzdHVja19jb3VudCA+IHZhcmlhYmxlcy5zdHVja190aWNrc1xuICAgICAgQGNob29zZURpcmVjdGlvbigpXG4gICAgICBAc3R1Y2tfY29vbGRvd24gPSB2YXJpYWJsZXMuc3R1Y2tfY29vbGRvd25cblxuICAgIGlmIEBzdHVja19jb29sZG93biA+IDBcbiAgICAgIEBzdHVja19jb29sZG93bi0tXG4gICAgICBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZGlyZWN0aW9uID0gKFxuICAgICAgaWYgQHN0dWNrX2Nvb2xkb3duID4gMFxuICAgICAgICBAc3R1Y2tfY29vbGRvd24tLVxuICAgICAgICBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICB4X25lZyA9IE1hdGgubWF4KEBtYXBfeCAtIHNlYXJjaF9yYWRpdXMsIDApXG4gICAgICAgIHlfbmVnID0gTWF0aC5tYXgoQG1hcF95IC0gc2VhcmNoX3JhZGl1cywgMClcbiAgICAgICAgeF9wb3MgPSBNYXRoLm1pbihAbWFwX3ggKyBzZWFyY2hfcmFkaXVzLCBAbWFwLndpZHRoKVxuICAgICAgICB5X3BvcyA9IE1hdGgubWluKEBtYXBfeSArIHNlYXJjaF9yYWRpdXMsIEBtYXAuaGVpZ2h0KVxuXG4gICAgICAgIGFsbF9lbnRpdGllcyA9IFtdXG5cbiAgICAgICAgZm9yIHkgaW4gW3lfbmVnIC4uIHlfcG9zXVxuICAgICAgICAgIGFsbF9lbnRpdGllcyA9IGFsbF9lbnRpdGllcy5jb25jYXQoc2VsZi5tYXAuZ2V0RW50aXRpZXNJblJhbmdlKHNlbGYubWFwLl9wb2ludFRvSW5kZXgoeF9uZWcsIHkpLCBzZWxmLm1hcC5fcG9pbnRUb0luZGV4KHhfcG9zLCB5KSkpXG5cbiAgICAgICAgZmlsdGVyZWRfZW50aXRpZXMgPSBhbGxfZW50aXRpZXMuZmlsdGVyIChlbnRpdHkpIC0+XG4gICAgICAgICAgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcblxuICAgICAgICBmaWx0ZXJlZF9lbnRpdGllcy5zb3J0IChlbnRfYSwgZW50X2IpIC0+XG4gICAgICAgICAgYV9kaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlbnRfYS5tYXBfeCAtIHNlbGYubWFwX3gsIDIpICsgTWF0aC5wb3coZW50X2EubWFwX3kgLSBzZWxmLm1hcF95LCAyKSlcbiAgICAgICAgICBiX2Rpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KGVudF9iLm1hcF94IC0gc2VsZi5tYXBfeCwgMikgKyBNYXRoLnBvdyhlbnRfYi5tYXBfeSAtIHNlbGYubWFwX3ksIDIpKVxuXG4gICAgICAgICAgaWYgYV9kaXN0YW5jZSA8IGJfZGlzdGFuY2UgdGhlbiAtMVxuICAgICAgICAgIGVsc2UgaWYgYV9kaXN0YW5jZSA+IGJfZGlzdGFuY2UgdGhlbiAxXG4gICAgICAgICAgZWxzZSAwXG5cbiAgICAgICAgaWYgZmlsdGVyZWRfZW50aXRpZXMubGVuZ3RoXG4gICAgICAgICAgdGFyZ2V0X2VudGl0eSA9IGZpbHRlcmVkX2VudGl0aWVzWzBdXG4gICAgICAgICAgZHggPSB0YXJnZXRfZW50aXR5Lm1hcF94IC0gc2VsZi5tYXBfeFxuICAgICAgICAgIGR5ID0gdGFyZ2V0X2VudGl0eS5tYXBfeSAtIHNlbGYubWFwX3lcblxuICAgICAgICAgIGlmIE1hdGguYWJzKGR4KSA+IE1hdGguYWJzKGR5KVxuICAgICAgICAgICAgaWYgZHggPiAwIHRoZW4gJ3JpZ2h0JyBlbHNlICdsZWZ0J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGR5ID4gMCB0aGVuICdkb3duJyBlbHNlICd1cCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG4gICAgKVxuXG4gICAgdW5sZXNzIGRpcmVjdGlvblxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA+IC45IHRoZW4gQGNob29zZURpcmVjdGlvbigpXG4gICAgICBkaXJlY3Rpb24gPSBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBkaXJlY3Rpb24pO1xuXG4gICAgaWYgZW50aXR5IGFuZCBlbnRpdHkubmFtZSBpc250ICdFZGdlJ1xuICAgICAgQG1hcC5zd2FwRW50aXRpZXMgQG1hcF9pbmRleCwgZW50aXR5Lm1hcF9pbmRleFxuICAgICAgQHN0dWNrX2NvdW50ID0gMFxuICAgIGVsc2VcbiAgICAgIEBzdHVja19jb3VudCsrXG5cbiAgY29uc3VtZU1hdGVyaWFsOiAtPlxuICAgIChcbiAgICAgIGVudGl0eSA9IEBtYXAuZ2V0RW50aXR5QXREaXJlY3Rpb24oQG1hcF9pbmRleCwgc2lkZSlcblxuICAgICAgaWYgZW50aXR5XG4gICAgICAgIGlmIGVudGl0eS5uYW1lIGlzICdDb21wbGV4TWF0ZXJpYWwnXG4gICAgICAgICAgQG1hcC5hc3NpZ25FbnRpdHlUb0luZGV4KGVudGl0eS5tYXBfaW5kZXgsIG5ldyBSYXdNYXRlcmlhbEVudGl0eShlbnRpdHkudHlwZSksIHRydWUpXG4gICAgICAgICAgQGhlYWx0aCArPSB2YXJpYWJsZXMubGlmZV9nYWluX3Blcl9mb29kXG4gICAgKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J11cblxuICByZXByb2R1Y2U6IC0+XG4gICAgaWYgQGhlYWx0aCA+IHZhcmlhYmxlcy5saWZlX3RvX3JlcHJvZHVjZVxuICAgICAgKFxuICAgICAgICBlbnRpdHkgPSBAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpXG5cbiAgICAgICAgaWYgZW50aXR5IGFuZCBlbnRpdHkubmFtZSBpcyAnRW1wdHknXG4gICAgICAgICAgICBjaGlsZCA9IG5ldyBSb2FtaW5nRW50aXR5KClcbiAgICAgICAgICAgIGNoaWxkLmhlYWx0aCA9IHZhcmlhYmxlcy5zdGFydGluZ19oZWFsdGhfY2xvbmVcbiAgICAgICAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChlbnRpdHkubWFwX2luZGV4LCBjaGlsZCAsIHRydWUpXG4gICAgICAgICAgICBAaGVhbHRoIC09IHZhcmlhYmxlcy5saWZlX2xvc3NfdG9fcmVwcm9kdWNlXG4gICAgICAgICAgICBicmVha1xuICAgICAgKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J11cblxuICAgIHRydWVcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIEBjb25zdW1lTWF0ZXJpYWwoKVxuICAgICAgQGRvTW92ZW1lbnQoKVxuICAgICAgQHJlcHJvZHVjZSgpXG4gICAgICBAaGVhbHRoLS1cbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvYW1pbmdFbnRpdHlcbiIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBQcmVkaWN0YWJsZSAxZCBub2lzZSBtYWtlclxuXG4gIFJldHJpZXZlZCBmcm9tIGh0dHA6Ly93d3cubWljaGFlbGJyb21sZXkuY28udWsvYXBpLzkwL3NpbXBsZS0xZC1ub2lzZS1pbi1qYXZhc2NyaXB0XG4jIyNcblxuXG5TaW1wbGUxRE5vaXNlID0gLT5cbiAgTUFYX1ZFUlRJQ0VTID0gMjU2XG4gIE1BWF9WRVJUSUNFU19NQVNLID0gTUFYX1ZFUlRJQ0VTIC0gMVxuICBhbXBsaXR1ZGUgPSAxXG4gIHNjYWxlID0gLjAxNVxuICByID0gW11cbiAgaSA9IDBcbiAgd2hpbGUgaSA8IE1BWF9WRVJUSUNFU1xuICAgIHIucHVzaCBNYXRoLnJhbmRvbSgpXG4gICAgKytpXG5cbiAgZ2V0VmFsID0gKHgpIC0+XG4gICAgc2NhbGVkWCA9IHggKiBzY2FsZVxuICAgIHhGbG9vciA9IE1hdGguZmxvb3Ioc2NhbGVkWClcbiAgICB0ID0gc2NhbGVkWCAtIHhGbG9vclxuICAgIHRSZW1hcFNtb290aHN0ZXAgPSB0ICogdCAqICgzIC0gKDIgKiB0KSlcbiAgICAjLyBNb2R1bG8gdXNpbmcgJlxuICAgIHhNaW4gPSB4Rmxvb3IgJiBNQVhfVkVSVElDRVNfTUFTS1xuICAgIHhNYXggPSB4TWluICsgMSAmIE1BWF9WRVJUSUNFU19NQVNLXG4gICAgeSA9IGxlcnAoclt4TWluXSwgclt4TWF4XSwgdFJlbWFwU21vb3Roc3RlcClcbiAgICB5ICogYW1wbGl0dWRlXG5cbiAgIyMjKlxuICAqIExpbmVhciBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uLlxuICAqIEBwYXJhbSBhIFRoZSBsb3dlciBpbnRlZ2VyIHZhbHVlXG4gICogQHBhcmFtIGIgVGhlIHVwcGVyIGludGVnZXIgdmFsdWVcbiAgKiBAcGFyYW0gdCBUaGUgdmFsdWUgYmV0d2VlbiB0aGUgdHdvXG4gICogQHJldHVybnMge251bWJlcn1cbiAgIyMjXG5cbiAgbGVycCA9IChhLCBiLCB0KSAtPlxuICAgIGEgKiAoMSAtIHQpICsgYiAqIHRcblxuICAjIHJldHVybiB0aGUgQVBJXG4gIHtcbiAgICBnZXRWYWw6IGdldFZhbFxuICAgIHNldEFtcGxpdHVkZTogKG5ld0FtcGxpdHVkZSkgLT5cbiAgICAgIGFtcGxpdHVkZSA9IG5ld0FtcGxpdHVkZVxuICAgICAgcmV0dXJuXG4gICAgc2V0U2NhbGU6IChuZXdTY2FsZSkgLT5cbiAgICAgIHNjYWxlID0gbmV3U2NhbGVcbiAgICAgIHJldHVyblxuXG4gIH1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGUxRE5vaXNlIiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIENvbnRhaW5zIGEgc2V0IG9mIGRpZmZlcmVudCBmbG93IGNhbGN1bGF0b3JzLlxuIyMjXG5cbk51bWJlci5wcm90b3R5cGUubW9kID0gKG4pIC0+ICgodGhpcyVuKStuKSVuXG5cbm1vZHVsZS5leHBvcnRzLmR1YWxfc3BpcmFscyA9ICh3aWR0aCwgaGVpZ2h0LCBtYXApIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIHogPSAxXG5cbiAgKGluZGV4KSAtPlxuXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9IHggLSBjZW50ZXJfeFxuICAgIGR5ID0geSAtIGNlbnRlcl95XG5cbiAgICBteCA9IE1hdGguYWJzKGR4KVxuXG4gICAgcSA9IChcbiAgICAgIGlmIGR5ID4gMFxuICAgICAgICBpZiBteCA8IGNlbnRlcl94IC8gMiB0aGVuIDAgZWxzZSAxXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG14ID4gY2VudGVyX3ggLyAyIHRoZW4gMiBlbHNlIDNcbiAgICApXG5cbiAgICByYW5kID0gTWF0aC5yYW5kb20oKSA+PSAuNVxuXG4gICAgaWYgZHggPiAwXG4gICAgICBzd2l0Y2ggcVxuICAgICAgICB3aGVuIDBcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3VwJyBlbHNlICdsZWZ0J1xuICAgICAgICB3aGVuIDFcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2xlZnQnIGVsc2UgJ2Rvd24nXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnZG93bicgZWxzZSAncmlnaHQnXG4gICAgICAgIHdoZW4gM1xuICAgICAgICAgIGlmIHJhbmQgdGhlbiAncmlnaHQnIGVsc2UgJ3VwJ1xuICAgIGVsc2VcbiAgICAgIHN3aXRjaCBxXG4gICAgICAgIHdoZW4gMFxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDFcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gM1xuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAndXAnXG5cblxubW9kdWxlLmV4cG9ydHMub3Bwb3NpdGVfc3BpcmFscyA9ICh3aWR0aCwgaGVpZ2h0LCBtYXApIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIHogPSAxXG5cbiAgKGluZGV4KSAtPlxuXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9IHggLSBjZW50ZXJfeFxuICAgIGR5ID0geSAtIGNlbnRlcl95XG5cbiAgICBteCA9IE1hdGguYWJzKGR4KVxuXG4gICAgcSA9IChcbiAgICAgIGlmIGR5ID4gMFxuICAgICAgICBpZiBteCA8IGNlbnRlcl94IC8gMi41IHRoZW4gMCBlbHNlIDFcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbXggPiBjZW50ZXJfeCAvIDIuNSB0aGVuIDIgZWxzZSAzXG4gICAgKVxuXG4gICAgcmFuZCA9IE1hdGgucmFuZG9tKCkgPj0gLjQ5XG5cbiAgICBpZiBkeCA+IDBcbiAgICAgIHN3aXRjaCBxXG4gICAgICAgIHdoZW4gMFxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAndXAnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnZG93bicgZWxzZSAnbGVmdCdcbiAgICAgICAgd2hlbiAyXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdyaWdodCcgZWxzZSAnZG93bidcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICd1cCcgZWxzZSAncmlnaHQnXG4gICAgZWxzZVxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdsZWZ0J1xuICAgICAgICB3aGVuIDFcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2xlZnQnIGVsc2UgJ3VwJ1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3VwJyBlbHNlICdyaWdodCdcbiAgICAgICAgd2hlbiAzXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdyaWdodCcgZWxzZSAnZG93bidcblxuXG5cbm1vZHVsZS5leHBvcnRzLnRpZ2h0X3NwaXJhbCA9ICh3aWR0aCwgaGVpZ2h0LCBtYXApIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIChpbmRleCkgLT5cblxuICAgIHggPSBpbmRleCAlIHdpZHRoXG4gICAgeSA9IE1hdGguZmxvb3IgaW5kZXggLyB3aWR0aFxuXG4gICAgZHggPSB4IC0gY2VudGVyX3hcbiAgICBkeSA9IHkgLSBjZW50ZXJfeVxuXG4gICAgaWYgZHggPiAwIGFuZCBkeSA+PSAwXG4gICAgICBpZiBNYXRoLnJhbmRvbSgpIDwgTWF0aC5hYnMoZHgpIC8gY2VudGVyX3hcbiAgICAgICAgJ3VwJ1xuICAgICAgZWxzZVxuICAgICAgICAncmlnaHQnXG4gICAgZWxzZSBpZiBkeCA+PSAwIGFuZCBkeSA8IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeSkgLyBjZW50ZXJfeVxuICAgICAgICAnbGVmdCdcbiAgICAgIGVsc2VcbiAgICAgICAgJ3VwJ1xuICAgIGVsc2UgaWYgZHggPCAwIGFuZCBkeSA8PSAwXG4gICAgICBpZiBNYXRoLnJhbmRvbSgpIDwgTWF0aC5hYnMoZHgpIC8gY2VudGVyX3hcbiAgICAgICAgJ2Rvd24nXG4gICAgICBlbHNlXG4gICAgICAgICdsZWZ0J1xuICAgIGVsc2UgaWYgZHggPD0gMCBhbmQgZHkgPiAwXG4gICAgICBpZiBNYXRoLnJhbmRvbSgpIDwgTWF0aC5hYnMoZHkpIC8gY2VudGVyX3lcbiAgICAgICAgJ3JpZ2h0J1xuICAgICAgZWxzZVxuICAgICAgICAnZG93bidcbiAgICBlbHNlIFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldXG5cbm1vZHVsZS5leHBvcnRzLnNwaXJhbCA9ICh3aWR0aCwgaGVpZ2h0KSAtPlxuICBjZW50ZXJfeCA9IE1hdGguZmxvb3Igd2lkdGgvMlxuICBjZW50ZXJfeSA9IE1hdGguZmxvb3IgaGVpZ2h0LzJcblxuICBkaXZpc2lvbl9hbmdsZSA9IE1hdGguZmxvb3IgMzYwLzRcbiAgbWF4RGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3cod2lkdGgtY2VudGVyX3gsIDIpICsgTWF0aC5wb3coaGVpZ2h0LWNlbnRlcl95LCAyKSlcbiAgbXggPSAxXG4gIG15ID0gMVxuXG4gIGlmIHdpZHRoID4gaGVpZ2h0XG4gICAgbXggPSBoZWlnaHQvd2lkdGhcbiAgZWxzZVxuICAgIG15ID0gd2lkdGgvaGVpZ2h0XG5cbiAgZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuICBwb2ludENhY2hlID0gW11cblxuICBmb3IgaW5kZXggaW4gWzAgLi4gd2lkdGggKiBoZWlnaHQgLSAxXVxuICAgIHggPSBpbmRleCAlIHdpZHRoXG4gICAgeSA9IE1hdGguZmxvb3IgaW5kZXggLyB3aWR0aFxuXG4gICAgZHggPSAoKHggLSBjZW50ZXJfeCkgKiBteClcbiAgICBkeSA9ICgoeSAtIGNlbnRlcl95ICsgMSkgKiBteSlcblxuICAgIGRpc3RhbmNlID0gTWF0aC5zaW4oKE1hdGguc3FydChNYXRoLnBvdyhkeCwgMikgKyBNYXRoLnBvdyhkeSwgMikpIC8gbWF4RGlzdGFuY2UpICogMTApXG4gICAgYW5nbGUgPSBNYXRoLmZsb29yKCgoKChNYXRoLmF0YW4yKGR5LCBkeCkqMTgwKS9NYXRoLlBJKStkaXN0YW5jZSkubW9kKDM2MCkvZGl2aXNpb25fYW5nbGUpKjEwMCkvMTAwXG5cbiAgICBwb2ludENhY2hlW2luZGV4XSA9IGFuZ2xlXG5cbiAgKGluZGV4KSAtPlxuICAgIGFuZ2xlID0gcG9pbnRDYWNoZVtpbmRleF1cblxuICAgIGludHAgPSBNYXRoLmZsb29yKGFuZ2xlKVxuICAgIGRlYyA9IE1hdGguZmxvb3IoKGFuZ2xlLWludHApKjEwMClcblxuICAgIGRpcmVjdGlvbiA9ICBpZiBNYXRoLnJhbmRvbSgpKjkwID4gZGVjIHRoZW4gKGludHArMSkubW9kKDQpIGVsc2UgKGludHArMikubW9kKDQpXG5cbiAgICBkaXJlY3Rpb25zW2RpcmVjdGlvbl0iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgU2ltcGxlIG9iamVjdCB0byBrZWVwIHRyYWNrIG9mIEZQU1xuIyMjXG5cbm1vZHVsZS5leHBvcnRzID0gLT5cbiAgZmlsdGVyX3N0cmVuZ3RoID0gMjBcbiAgZnJhbWVfdGltZSA9IDBcbiAgbGFzdF9sb29wID0gbmV3IERhdGUoKVxuICB7XG4gICAgdGljayA6IC0+XG4gICAgICB0aGlzX2xvb3AgPSBuZXcgRGF0ZVxuICAgICAgdGhpc190aW1lID0gdGhpc19sb29wIC0gbGFzdF9sb29wXG4gICAgICBmcmFtZV90aW1lICs9ICh0aGlzX3RpbWUgLSBmcmFtZV90aW1lKSAvIGZpbHRlcl9zdHJlbmd0aFxuICAgICAgbGFzdF9sb29wID0gdGhpc19sb29wXG4gICAgZ2V0RnBzIDogLT5cbiAgICAgIDEwMDAgLyBmcmFtZV90aW1lXG4gIH1cblxuXG4iLCIjIyNcbiAgY29sb3ItcG9uZFxuICBLZXZpbiBHcmF2aWVyIDIwMTZcbiAgR1BMLTMuMCBMaWNlbnNlXG5cbiAgVGhlIE1hcCBpcyB0aGUgaGVhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLCBhbmQgaG9sZCBhbGwgdGhlIGVudGl0aWVzIGluIHRoZSBtYXAgYW5kIGhhbmRsZXMgaXNzdWluZyB0aGUgdGlja3NcbiAgdG8gZWFjaCBlbnRpdHkuIEl0IGFsc28gaG9sZCB0aGUgaW1hZ2UgZGF0YSBmb3IgdGhlIG1hcCBhbmQga2VlcHMgdGhlIGdvYWwgcmF0aW9zIHVwIHRvIGRhdGUuXG4jIyNcblxuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9FbXB0eUVudGl0eSdcblJvYW1pbmdFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9Sb2FtaW5nRW50aXR5J1xuUmF3TWF0ZXJpYWxFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9SYXdNYXRlcmlhbEVudGl0eSdcbkNvbXBsZXhNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL0NvbXBsZXhNYXRlcmlhbEVudGl0eSdcblByb2R1Y2VyRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvUHJvZHVjZXJFbnRpdHknXG5FZGdlRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvRWRnZUVudGl0eSdcbmZsb3cgPSByZXF1aXJlICcuL2Zsb3cnXG5zaHVmZmxlID0gcmVxdWlyZSAnLi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuL3ZhcmlhYmxlSG9sZGVyJykuTWFwXG5TaW1wbGUxRE5vaXNlID0gcmVxdWlyZSAnLi9TaW1wbGUxRE5vaXNlJ1xuXG5jbGFzcyBNYXBcbiAgIyBQcml2YXRlc1xuICBfbWFwOiBbXVxuXG4gIF90aWNrOiAwXG5cbiAgX2ltYWdlOiBudWxsXG4gIF9jb3VudHM6IHtCYXNlOjAsIEVtcHR5OjAsIFJhd01hdGVyaWFsOjAsIFJvYW1pbmc6MCwgQ29tcGxleE1hdGVyaWFsOjAsIFByb2R1Y2VyOjB9XG5cbiAgI3B1YmxpY3NcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIGZsb3dfdHlwZSkgLT5cbiAgICBAZmxvdyA9IGZsb3dbZmxvd190eXBlXShAd2lkdGgsIEBoZWlnaHQsIEApXG4gICAgQF9pbWFnZSA9IG5ldyBVaW50OEFycmF5KEB3aWR0aCAqIEBoZWlnaHQgKiA0KVxuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KGksIG5ldyBFbXB0eUVudGl0eSgpLCB0cnVlKSBmb3IgaSBpbiBbMCAuLiBAd2lkdGgqQGhlaWdodCAtIDFdXG4gICAgQG1ha2VCb3JkZXIoKVxuXG4gICAgQF9hZGRQcm9kdWNlcigpIGZvciBbMCAuLiA4XVxuXG4gIG1ha2VCb3JkZXI6IC0+XG4gICAgeF9tdWx0aXBsaWVyID0gTWF0aC5yb3VuZChAd2lkdGggKiAuMDMpXG4gICAgeV9tdWx0aXBsaWVyID0gTWF0aC5yb3VuZChAaGVpZ2h0ICogLjAzKVxuICAgIG5vaXNlID0gU2ltcGxlMUROb2lzZSgpO1xuICAgIG5vaXNlLnNldFNjYWxlKC4wOSlcbiAgICBpID0gMFxuXG4gICAgZm9yIHggaW4gWzAgLi4uIEB3aWR0aF1cbiAgICAgIG91dCA9IE1hdGguY2VpbChub2lzZS5nZXRWYWwoeCkgKiB5X211bHRpcGxpZXIpXG4gICAgICBmb3IgaSBpbiBbMCAuLi4gb3V0XVxuICAgICAgICBAYXNzaWduRW50aXR5VG9JbmRleChAX3BvaW50VG9JbmRleCh4LCBpLTEpLCBuZXcgRWRnZUVudGl0eSgpLCB0cnVlKVxuXG4gICAgZm9yIHkgaW4gWzAgLi4uIEBoZWlnaHRdXG4gICAgICBvdXQgPSBNYXRoLmNlaWwobm9pc2UuZ2V0VmFsKHkpICogeF9tdWx0aXBsaWVyKVxuICAgICAgZm9yIGkgaW4gWzAgLi4uIG91dF1cbiAgICAgICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoQF9wb2ludFRvSW5kZXgoaS0xLCB5KSwgbmV3IEVkZ2VFbnRpdHkoKSwgdHJ1ZSlcblxuICAgIGZvciB4IGluIFswIC4uLiBAd2lkdGhdXG4gICAgICBvdXQgPSBNYXRoLmNlaWwobm9pc2UuZ2V0VmFsKHgpICogeV9tdWx0aXBsaWVyKVxuICAgICAgZm9yIGkgaW4gW0BoZWlnaHQgLi4uIEBoZWlnaHQgLSBvdXRdXG4gICAgICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KEBfcG9pbnRUb0luZGV4KHgsIGktMSksIG5ldyBFZGdlRW50aXR5KCksIHRydWUpXG5cbiAgICBmb3IgeSBpbiBbMCAuLi4gQGhlaWdodF1cbiAgICAgIG91dCA9IE1hdGguY2VpbChub2lzZS5nZXRWYWwoeSkgKiB4X211bHRpcGxpZXIpXG4gICAgICBmb3IgaSBpbiBbQHdpZHRoIC4uLiBAd2lkdGggLSBvdXRdXG4gICAgICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KEBfcG9pbnRUb0luZGV4KGktMSwgeSksIG5ldyBFZGdlRW50aXR5KCksIHRydWUpXG5cblxuXG4gIHNldEZsb3dUeXBlOiAodHlwZSkgLT5cbiAgICBAZmxvdyA9IGZsb3dbdHlwZV0oQHdpZHRoLCBAaGVpZ2h0KVxuXG4gIHRpY2s6IC0+XG4gICAgbmVlZGVkX21hdGVyaWFsID0gQF9nZXROZWVkZWRNYXRlcmlhbENvdW50KClcbiAgICBpZiBuZWVkZWRfbWF0ZXJpYWwgPiAwXG4gICAgICBAX2FkZE1hdGVyaWFsKCkgZm9yIFswIC4uIG5lZWRlZF9tYXRlcmlhbF1cbiAgICBpZiBNYXRoLnJhbmRvbSgpKjEwMDAwIDwgdmFyaWFibGVzLmNoYW5jZV9yb2FtZXJfc3Bhd25cbiAgICAgIEBfYWRkUm9hbWVyKClcbiAgICBpZiBNYXRoLnJhbmRvbSgpKjEwMDAwIDwgdmFyaWFibGVzLmNoYW5jZV9wcm9kdWNlcl9zcGF3blxuICAgICAgQF9hZGRQcm9kdWNlcigpXG4gICAgZW50aXR5LnRpY2soKSBmb3IgZW50aXR5IGluIHNodWZmbGUoQF9tYXAuc2xpY2UoKSlcbiAgICBAX3RpY2srK1xuXG4gIGdldFJlbmRlcjogLT5cbiAgICBAX2ltYWdlXG5cbiAgZ2V0RW50aXR5QXRYWTogKHgsIHkpIC0+XG4gICAgQGdldEVudGl0eUF0SW5kZXgoQF9wb2ludFRvSW5kZXgoeCwgeSkpXG5cbiAgZ2V0RW50aXR5QXRJbmRleDogKGluZGV4KSAtPlxuICAgIGlmIEBfbWFwW2luZGV4XT8gdGhlbiBAX21hcFtpbmRleF0gZWxzZSBmYWxzZVxuXG4gIGdldEVudGl0aWVzSW5SYW5nZTogKGluZGV4X21pbiwgaW5kZXhfbWF4KSAtPlxuICAgIEBfbWFwLnNsaWNlKGluZGV4X21pbiwgaW5kZXhfbWF4KzEpXG5cbiAgc3dhcEVudGl0aWVzOiAoaW5kZXgxLCBpbmRleDIpIC0+XG4gICAgZW50MSA9IEBnZXRFbnRpdHlBdEluZGV4IGluZGV4MVxuICAgIGVudDIgPSBAZ2V0RW50aXR5QXRJbmRleCBpbmRleDJcbiAgICBAYXNzaWduRW50aXR5VG9JbmRleCBpbmRleDEsIGVudDJcbiAgICBAYXNzaWduRW50aXR5VG9JbmRleCBpbmRleDIsIGVudDFcbiAgICBlbnQxLmlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIGVudDIuaXNfZGVsZXRlZCA9IGZhbHNlXG4gICAgdHJ1ZVxuXG4gIGdldEVudGl0eUF0RGlyZWN0aW9uOiAoaW5kZXgsIGRpcmVjdGlvbikgLT5cbiAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICB3aGVuICd1cCdcbiAgICAgICAgaWYgaW5kZXggPiBAd2lkdGggLSAxXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggLSBAd2lkdGgpXG4gICAgICAgIGVsc2UgZmFsc2VcbiAgICAgIHdoZW4gJ2Rvd24nXG4gICAgICAgIGlmIGluZGV4IDwgQF9tYXAubGVuZ3RoIC0gMVxuICAgICAgICAgIEBnZXRFbnRpdHlBdEluZGV4KGluZGV4ICsgQHdpZHRoKVxuICAgICAgICBlbHNlIGZhbHNlXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpZiBpbmRleCAlIEB3aWR0aCA+IDBcbiAgICAgICAgICBAZ2V0RW50aXR5QXRJbmRleChpbmRleCAtIDEpXG4gICAgICAgIGVsc2UgZmFsc2VcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpZiBpbmRleCAlIEB3aWR0aCA8IEB3aWR0aCAtIDFcbiAgICAgICAgICBAZ2V0RW50aXR5QXRJbmRleChpbmRleCArIDEpXG4gICAgICAgIGVsc2UgZmFsc2VcblxuICBhc3NpZ25FbnRpdHlUb0luZGV4OiAoaW5kZXgsIGVudGl0eSwgaXNfbmV3ID0gZmFsc2UpIC0+XG4gICAgY3VycmVudF9lbnRpdHkgPSBAZ2V0RW50aXR5QXRJbmRleChpbmRleClcbiAgICBpZiBjdXJyZW50X2VudGl0eVxuICAgICAgY3VycmVudF9lbnRpdHkuaXNfZGVsZXRlZCA9IHRydWVcbiAgICAgIEBfY291bnRzW2N1cnJlbnRfZW50aXR5Lm5hbWVdLS1cblxuICAgIEBfY291bnRzW2VudGl0eS5uYW1lXSsrXG5cbiAgICBAX21hcFtpbmRleF0gPSBlbnRpdHlcbiAgICBlbnRpdHkuaXNfZGVsZXRlZCA9IGZhbHNlXG4gICAgaWYgaXNfbmV3XG4gICAgICBlbnRpdHkuaW5pdCBALCBpbmRleFxuICAgIGVsc2VcbiAgICAgIGVudGl0eS5tb3ZlZChpbmRleClcbiAgICB0cnVlXG5cbiAgI3ByaXZhdGVzXG4gIF9wb2ludFRvSW5kZXg6ICh4LCB5KSAtPiB4ICsgQHdpZHRoICogeVxuICBfaW5kZXhUb1BvaW50OiAoaW5kZXgpIC0+IFtpbmRleCAlIEB3aWR0aCwgTWF0aC5mbG9vcihpbmRleCAvIEB3aWR0aCldXG4gIF9hZGRFbnRpdHlUb0VtcHR5OiAodHlwZSkgLT5cbiAgICBsb29wXG4gICAgICBpID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKEBfbWFwLmxlbmd0aC0xKSlcbiAgICAgIGJyZWFrIGlmIEBnZXRFbnRpdHlBdEluZGV4KGkpPy5uYW1lIGlzICdFbXB0eSdcbiAgICBAYXNzaWduRW50aXR5VG9JbmRleChpLCBuZXcgdHlwZSgpLCB0cnVlKVxuXG4gIF9nZXROZWVkZWRNYXRlcmlhbENvdW50OiAtPlxuICAgIE1hdGguZmxvb3IoQF9tYXAubGVuZ3RoICogdmFyaWFibGVzLmVtcHR5X3JhdGlvKSAtIEBfY291bnRzLkNvbXBsZXhNYXRlcmlhbCAtIEBfY291bnRzLlJhd01hdGVyaWFsIC0gQF9jb3VudHMuUHJvZHVjZXJcblxuICBfYWRkTWF0ZXJpYWw6IC0+XG4gICAgQF9hZGRFbnRpdHlUb0VtcHR5KFJhd01hdGVyaWFsRW50aXR5KVxuXG4gIF9hZGRDb21wbGV4TWF0ZXJpYWw6IC0+XG4gICAgQF9hZGRFbnRpdHlUb0VtcHR5KENvbXBsZXhNYXRlcmlhbEVudGl0eSlcblxuICBfYWRkUm9hbWVyOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShSb2FtaW5nRW50aXR5KVxuXG4gIF9hZGRQcm9kdWNlcjogLT5cbiAgICBAX2FkZEVudGl0eVRvRW1wdHkoUHJvZHVjZXJFbnRpdHkpXG5cbiAgI2RlYnVnc1xuICAkJGR1bXBNYXA6IC0+XG4gICAgY29uc29sZS5kZWJ1ZyBAX21hcFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFxuXG5cbiIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBTaW1wbGUgd2F5IHRvIHNodWZmbGUgYXJyYXlcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9IChhcnJheSkgLT5cbiAgY291bnRlciA9IGFycmF5Lmxlbmd0aFxuICAjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcbiAgd2hpbGUgY291bnRlciA+IDBcbiMgUGljayBhIHJhbmRvbSBpbmRleFxuICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRlcilcbiAgICAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgIGNvdW50ZXItLVxuICAgICMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG4gICAgdGVtcCA9IGFycmF5W2NvdW50ZXJdXG4gICAgYXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cbiAgICBhcnJheVtpbmRleF0gPSB0ZW1wXG4gIGFycmF5IiwiIyMjXG4gIGNvbG9yLXBvbmRcbiAgS2V2aW4gR3JhdmllciAyMDE2XG4gIEdQTC0zLjAgTGljZW5zZVxuXG4gIEhvbGRlciBmb3IgdmFyaWFibGVzLlxuIyMjXG5cbnZhcmlhYmxlcyA9XG4gIE1hcDpcbiAgICBlbXB0eV9yYXRpbzogLjFcbiAgICBjaGFuY2VfcHJvZHVjZXJfc3Bhd246IDEwMFxuICAgIGNoYW5jZV9yb2FtZXJfc3Bhd246IDEwMFxuICBQcm9kdWNlckVudGl0eTpcbiAgICBzdGFydGluZ19saWZlOiAyMDBcbiAgICBsaWZlX2dhaW5fcGVyX2Zvb2Q6IDEyMDBcbiAgICBsaWZlX3RvX3JlcHJvZHVjZTogNjAwXG4gICAgbGlmZV9sb3NzX3RvX3JlcHJvZHVjZTogNDAwXG4gICAgbWF4X2xpZmU6IDYwMFxuICAgIG1pbl9saWZlX3RvX3RyYW5zZmVyOiA1MFxuICAgIG1heF9saWZlX3RyYW5zZmVyOiA1MFxuICAgIGVhdGluZ19jb29sZG93bjogMTBcbiAgICBhZ2VfdG9fcmVwcm9kdWNlOiA4MFxuICAgIG9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllcjogMTAwMDAwMDBcbiAgUm9hbWluZ0VudGl0eTpcbiAgICBzdHVja190aWNrczogMjBcbiAgICBzdHVja19jb29sZG93bjogMjBcbiAgICBzdGFydGluZ19oZWFsdGhfZnJlc2g6IDEwMFxuICAgIHN0YXJ0aW5nX2hlYWx0aF9jbG9uZTogMjBcbiAgICBtYXhfbGlmZTogMjAwXG4gICAgbGlmZV9nYWluX3Blcl9mb29kOiA1MFxuICAgIGxpZmVfdG9fcmVwcm9kdWNlOiAyMDBcbiAgICBsaWZlX2xvc3NfdG9fcmVwcm9kdWNlOiA1MFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB2YXJpYWJsZXNcbiIsIiMjI1xuICBjb2xvci1wb25kXG4gIEtldmluIEdyYXZpZXIgMjAxNlxuICBHUEwtMy4wIExpY2Vuc2VcblxuICBIYW5kbGVzIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGUgbWFwIGFuZCB0aGUgbWFpbiB0aHJlYWQuIEFsc28gaW5zdHJ1Y3RzIHRoZVxuICBtYXAgd2hlbiB0byB0aWNrLlxuIyMjXG5cbk1hcCA9IHJlcXVpcmUgJy4vbGliL21hcCdcbkZQUyA9IHJlcXVpcmUoJy4vbGliL2ZwcycpXG52YXJpYWJsZXMgPSByZXF1aXJlICcuL2xpYi92YXJpYWJsZUhvbGRlcidcblxudGFyZ2V0X3RwcyA9IDQwXG5cbm1hcCA9IG51bGxcbnJ1bm5pbmcgPSBmYWxzZVxubWFwX3RpY2tfaW50ID0gLTE7XG5mcHMgPSBGUFMoKVxuXG50aWNrID0gLT5cbiAgbWFwLnRpY2soKVxuICBmcHMudGljaygpXG4gIG51bGxcblxuaW5pdCA9ICh3aWR0aCwgaGVpZ2h0LCBzZWVkLCBmbG93KSAtPlxuICBNYXRoLnJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20vbGliL2FsZWEnKShzZWVkKVxuICBtYXAgPSBuZXcgTWFwIHdpZHRoLCBoZWlnaHQsIGZsb3dcbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ2luaXRpYWxpemVkJ11cblxuc3RhcnQgPSAoKSAtPlxuICBydW5uaW5nID0gdHJ1ZVxuICBmcHMgPSBGUFMoKVxuICBzZWxmLnBvc3RNZXNzYWdlIFsnc3RhcnRlZCddXG4gIGNsZWFySW50ZXJ2YWwgbWFwX3RpY2tfaW50XG4gIG1hcF90aWNrX2ludCA9IHNldEludGVydmFsIHRpY2ssIDEwMDAvdGFyZ2V0X3Rwc1xuXG5zdG9wID0gLT5cbiAgcnVubmluZyA9IGZhbHNlXG4gIGNsZWFySW50ZXJ2YWwgbWFwX3RpY2tfaW50XG4gIHNlbGYucG9zdE1lc3NhZ2UgWydzdG9wcGVkJ11cblxuc2VuZEltYWdlRGF0YSA9IC0+XG4gIHNlbGYucG9zdE1lc3NhZ2UgWydpbWFnZURhdGEnLCBtYXAuZ2V0UmVuZGVyKCldXG5cbnNlbmRUUFMgPSAtPlxuICBzZWxmLnBvc3RNZXNzYWdlIFsndHBtJywgZnBzLmdldEZwcygpXVxuXG51cGRhdGVWYXJpYWJsZSA9ICh0eXBlLCB2YXJpYWJsZSwgdmFsdWUpIC0+XG4gIGNvbnNvbGUuZGVidWcgXCJVcGRhdGluZyAje3R5cGV9LiN7dmFyaWFibGV9IHRvICN7dmFsdWV9XCJcbiAgdmFyaWFibGVzW3R5cGVdW3ZhcmlhYmxlXSA9IHZhbHVlXG5cbmdldFZhcmlhYmxlcyA9IC0+XG4gIHNlbGYucG9zdE1lc3NhZ2UgWyd2YXJpYWJsZXMnLCB2YXJpYWJsZXNdXG5cbnNldEZsb3dUeXBlID0gKHR5cGUpIC0+XG4gIG1hcC5zZXRGbG93VHlwZSh0eXBlKVxuXG5cbnNlbGYub25tZXNzYWdlID0gKGUpIC0+XG4gIHN3aXRjaCBlLmRhdGFbMF1cbiAgICB3aGVuICdpbml0JyAgICAgICAgICAgdGhlbiBpbml0KGUuZGF0YVsxXSwgZS5kYXRhWzJdLCBlLmRhdGFbM10sIGUuZGF0YVs0XSlcbiAgICB3aGVuICdzdGFydCcgICAgICAgICAgdGhlbiBzdGFydCgpXG4gICAgd2hlbiAnc3RvcCcgICAgICAgICAgIHRoZW4gc3RvcCgpXG4gICAgd2hlbiAnc2VuZEltYWdlRGF0YScgIHRoZW4gc2VuZEltYWdlRGF0YSgpXG4gICAgd2hlbiAnc2VuZFRQUycgICAgICAgIHRoZW4gc2VuZFRQUygpXG4gICAgd2hlbiAndXBkYXRlVmFyaWFibGUnIHRoZW4gdXBkYXRlVmFyaWFibGUoZS5kYXRhWzFdLCBlLmRhdGFbMl0sIGUuZGF0YVszXSlcbiAgICB3aGVuICdnZXRWYXJpYWJsZXMnICAgdGhlbiBnZXRWYXJpYWJsZXMoKVxuICAgIHdoZW4gJ3NldEZsb3dUeXBlJyAgICB0aGVuIHNldEZsb3dUeXBlKGUuZGF0YVsxXSlcbiAgICBlbHNlIGNvbnNvbGUuZXJyb3IgXCJVbmtub3duIENvbW1hbmQgI3tlLmRhdGFbMF19XCJcblxuIl19
