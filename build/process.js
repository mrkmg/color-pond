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
    var ref;
    this.map = map;
    this.map_index = index;
    ref = this.map._indexToPoint(index), this.map_x = ref[0], this.map_y = ref[1];
    return this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);
  };

  BaseEntity.prototype.moved = function(new_index) {
    var ref;
    this.map_index = new_index;
    ref = this.map._indexToPoint(new_index), this.map_x = ref[0], this.map_y = ref[1];
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

  function ComplexMaterialEntity(type) {
    this.type = type != null ? type : Math.floor(Math.random() * 3);
    ComplexMaterialEntity.__super__.constructor.apply(this, arguments);
    this.is_moveable = false;
    switch (this.type) {
      case 0:
        this.color = [255, 150, 0, 255];
        break;
      case 1:
        this.color = [255, 100, 0, 255];
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
    return LivingEntity.__super__.tick.call(this) && (this.health--, this.health <= 0 ? (this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true), this.died(), false) : (this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, 20 + Math.round((this.health / this.max_health) * 235))), true));
  };

  return LivingEntity;

})(BaseEntity);

module.exports = LivingEntity;


},{"./BaseEntity":1,"./EmptyEntity":3}],6:[function(require,module,exports){
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

  function ProducerEntity(wants, makes) {
    this.wants = wants != null ? wants : Math.floor(Math.random() * 3);
    this.makes = makes != null ? makes : fixmod(this.wants + (Math.random() > .5 ? 1 : -1), 3);
    ProducerEntity.__super__.constructor.apply(this, arguments);
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
        results.push((this.last_ate = 0, this.age -= 20, this.health += variableHolder.life_gain_per_food, this.map.assignEntityToIndex(entity.map_index, new EmptyEntity(), true)));
      }
    }
    return results;
  };

  ProducerEntity.prototype.transferHealth = function(entities) {
    var entity, i, len, results, to_transfer;
    results = [];
    for (i = 0, len = entities.length; i < len; i++) {
      entity = entities[i];
      results.push((to_transfer = Math.floor((this.health - entity.health) / variableHolder.transfer_divisor), to_transfer > 0 ? (this.health -= to_transfer, entity.health += to_transfer) : void 0));
    }
    return results;
  };

  ProducerEntity.prototype.reproduce = function(entities) {
    var entity, i, len, results;
    results = [];
    for (i = 0, len = entities.length; i < len; i++) {
      entity = entities[i];
      if (this.health >= variableHolder.life_to_reproduce) {
        results.push((this.health -= variableHolder.life_loss_to_reproduce, this.map.assignEntityToIndex(entity.map_index, new ProducerEntity(this.wants, this.makes), true)));
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
      if (this.last_ate > variableHolder.eating_cooldown) {
        this.reproduce(placeable_entities);
      }
      this.eat(consumable_entities);
      if (friendly_entities.length < 4 && this.age > Math.random() * variableHolder.age_death_rate) {
        this.died();
        return true;
      } else {
        if (friendly_entities.length === 4) {
          this.color[1] = 255;
        } else {
          this.color[1] = 128;
        }
        return true;
      }
    } else {
      return false;
    }
  };

  return ProducerEntity;

})(LivingEntity);

module.exports = ProducerEntity;


},{"../lib/shuffleArray":12,"../lib/variableHolder":13,"./ComplexMaterialEntity":2,"./EmptyEntity":3,"./LivingEntity":5}],7:[function(require,module,exports){
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
        this.color = [0, 150, 255, 255];
        break;
      case 1:
        this.color = [0, 100, 255, 255];
        break;
      case 2:
        this.color = [0, 50, 255, 255];
    }
  }

  return RawMaterialEntity;

})(FlowingEntity);

module.exports = RawMaterialEntity;


},{"./FlowingEntity":4}],8:[function(require,module,exports){
var EmptyEntity, LivingEntity, RawMaterialEntity, RoamingEntity, search_radius, shuffle,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LivingEntity = require('./LivingEntity');

EmptyEntity = require('./EmptyEntity');

shuffle = require('../lib/shuffleArray');

RawMaterialEntity = require('./RawMaterialEntity');

search_radius = 10;

RoamingEntity = (function(superClass) {
  extend(RoamingEntity, superClass);

  RoamingEntity.prototype.name = 'Roaming';

  function RoamingEntity(wants) {
    this.wants = wants != null ? wants : Math.floor(Math.random() * 3);
    RoamingEntity.__super__.constructor.call(this);
    this.max_health = 200;
    this.is_moveable = false;
    this.health = 100;
    this.color = [255, 255, 255, 255];
  }

  RoamingEntity.prototype.consumeMaterial = function() {
    var entity, i, len, ref, results, side;
    ref = shuffle(['up', 'down', 'left', 'right']);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push((entity = this.map.getEntityAtDirection(this.map_index, side), entity ? entity.name === 'ComplexMaterial' && entity.type === this.wants ? (this.map.assignEntityToIndex(entity.map_index, new RawMaterialEntity(this.wants), true), this.health += 50) : void 0 : void 0));
    }
    return results;
  };

  RoamingEntity.prototype.doMovement = function() {
    var all_entities, direction, dx, dy, entity, filtered_entities, i, ref, ref1, self, target_entity, x_neg, x_pos, y, y_neg, y_pos;
    self = this;
    x_neg = Math.max(this.map_x - search_radius, 0);
    y_neg = Math.max(this.map_y - search_radius, 0);
    x_pos = Math.min(this.map_x + search_radius, this.map.width);
    y_pos = Math.min(this.map_y + search_radius, this.map.height);
    all_entities = [];
    for (y = i = ref = y_neg, ref1 = y_pos; ref <= ref1 ? i <= ref1 : i >= ref1; y = ref <= ref1 ? ++i : --i) {
      all_entities = all_entities.concat(self.map.getEntitiesInRange(self.map._pointToIndex(x_neg, y), self.map._pointToIndex(x_pos, y)));
    }
    filtered_entities = all_entities.filter(function(entity) {
      return entity.name === 'ComplexMaterial' && entity.type === self.wants;
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
    direction = (filtered_entities.length ? (target_entity = filtered_entities[0], dx = target_entity.map_x - self.map_x, dy = target_entity.map_y - self.map_y, Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up') : ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]);
    entity = this.map.getEntityAtDirection(this.map_index, direction);
    if (entity && entity.is_moveable) {
      return this.map.swapEntities(this.map_index, entity.map_index);
    }
  };

  RoamingEntity.prototype.reproduce = function() {
    var child, entity, i, len, ref, side;
    if (this.health > 200) {
      ref = shuffle(['up', 'down', 'left', 'right']);
      for (i = 0, len = ref.length; i < len; i++) {
        side = ref[i];
        entity = this.map.getEntityAtDirection(this.map_index, side);
        if (entity && entity.name === 'Empty') {
          child = new RoamingEntity(this.wants);
          child.health = 20;
          this.map.assignEntityToIndex(entity.map_index, child, true);
          this.health -= 50;
          break;
        }
      }
    }
    return true;
  };

  RoamingEntity.prototype.tick = function() {
    return RoamingEntity.__super__.tick.call(this) && (this.consumeMaterial(), this.doMovement(), this.reproduce());
  };

  return RoamingEntity;

})(LivingEntity);

module.exports = RoamingEntity;


},{"../lib/shuffleArray":12,"./EmptyEntity":3,"./LivingEntity":5,"./RawMaterialEntity":7}],9:[function(require,module,exports){
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
    if (Math.random() > .4) {
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
      direction = Math.random() * 90 > dec ? (intp + 1).mod(4) : (intp + 2).mod(4);
      return directions[direction];
    }
  };
};


},{}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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
    return x + this.width * y;
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

  Map.prototype._material_ratio = .2;

  Map.prototype._checkMaterialRatio = function() {
    var current_count, i, j, ref, results, target_count;
    current_count = this._counts.RawMaterial + this._counts.ComplexMaterial + this._counts.Producer;
    target_count = Math.floor(this._material_ratio * this._map.length);
    if (current_count < target_count) {
      results = [];
      for (j = 0, ref = target_count - current_count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        results.push((function() {
          var ref1;
          while (true) {
            i = Math.floor(Math.random() * (this._map.length - 1));
            if (((ref1 = this.getEntityAtIndex(i)) != null ? ref1.name : void 0) === 'Empty') {
              break;
            }
          }
          return this.assignEntityToIndex(i, new RawMaterialEntity(), true);
        }).call(this));
      }
      return results;
    }
  };

  Map.prototype._addRoamer = function() {
    var i;
    while (true) {
      i = Math.floor(Math.random() * (this._map.length - 1));
      if (this.getEntityAtIndex(i).name === 'Empty') {
        break;
      }
    }
    return this.assignEntityToIndex(i, new RoamingEntity(), true);
  };

  Map.prototype._addProducer = function() {
    var i;
    while (true) {
      i = Math.floor(Math.random() * (this._map.length - 1));
      if (this.getEntityAtIndex(i).name === 'Empty') {
        break;
      }
    }
    return this.assignEntityToIndex(i, new ProducerEntity(), true);
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
    var entity, j, len, ref;
    this._checkMaterialRatio();
    if (Math.random() > .98) {
      this._addRoamer();
    }
    if (Math.random() > .98) {
      this._addProducer();
    }
    ref = (this._tick % 2 === 0 ? this._map.slice() : this._map.slice().reverse());
    for (j = 0, len = ref.length; j < len; j++) {
      entity = ref[j];
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

  Map.prototype.$$dumpMap = function() {
    return console.debug(this._map);
  };

  return Map;

})();

module.exports = Map;


},{"../entities/ComplexMaterialEntity":2,"../entities/EmptyEntity":3,"../entities/ProducerEntity":6,"../entities/RawMaterialEntity":7,"../entities/RoamingEntity":8,"./flow":9}],12:[function(require,module,exports){
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


},{}],13:[function(require,module,exports){
var variables;

variables = {
  ProducerEntity: {
    starting_life: 250,
    life_gain_per_food: 300,
    life_to_reproduce: 400,
    life_loss_to_reproduce: 50,
    max_life: 500,
    transfer_divisor: 4,
    eating_cooldown: 5,
    age_death_rate: 1000000
  }
};

module.exports = variables;


},{}],14:[function(require,module,exports){
var Map, fps, getVariables, init, map, map_tick_int, running, sendImageData, sendTPS, start, stop, target_tps, tick, updateVariable, variables;

Map = require('./lib/map');

fps = require('./lib/fps')();

variables = require('./lib/variableHolder');

target_tps = 20;

map = null;

running = false;

map_tick_int = -1;

tick = function() {
  map.tick();
  fps.tick();
  return null;
};

init = function(width, height) {
  map = new Map(width, height);
  return self.postMessage(['initialized']);
};

start = function() {
  running = true;
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
    case 'updateVariable':
      return updateVariable(e.data[1], e.data[2], e.data[3]);
    case 'getVariables':
      return getVariables();
    default:
      return console.error("Unknown Command " + e.data[0]);
  }
};


},{"./lib/fps":10,"./lib/map":11,"./lib/variableHolder":13}]},{},[14]);
