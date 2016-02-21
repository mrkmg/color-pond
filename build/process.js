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
    return LivingEntity.__super__.tick.call(this) && (this.health <= 0 ? (this.map.assignEntityToIndex(this.map_index, new EmptyEntity(), true), this.died(), false) : (this.setColor(this.color[0], this.color[1], this.color[2], Math.min(255, 20 + Math.round((this.health / this.max_health) * 235))), true));
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


},{"./FlowingEntity":4}],8:[function(require,module,exports){
var EmptyEntity, LivingEntity, RawMaterialEntity, RoamingEntity, directions, search_radius, shuffle,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LivingEntity = require('./LivingEntity');

EmptyEntity = require('./EmptyEntity');

shuffle = require('../lib/shuffleArray');

RawMaterialEntity = require('./RawMaterialEntity');

search_radius = 10;

directions = ['right', 'down', 'left', 'up'];

RoamingEntity = (function(superClass) {
  extend(RoamingEntity, superClass);

  RoamingEntity.prototype.name = 'Roaming';

  function RoamingEntity() {
    RoamingEntity.__super__.constructor.call(this);
    this.max_health = 200;
    this.is_moveable = false;
    this.health = 100;
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
    if (this.stuck_count > 20) {
      this.chooseDirection();
      this.stuck_cooldown = 20;
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
    if (entity) {
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
      results.push((entity = this.map.getEntityAtDirection(this.map_index, side), entity ? entity.name === 'ComplexMaterial' ? (this.map.assignEntityToIndex(entity.map_index, new RawMaterialEntity(entity.type), true), this.health += 50) : void 0 : void 0));
    }
    return results;
  };

  RoamingEntity.prototype.reproduce = function() {
    var child, entity, i, len, ref, side;
    if (this.health > 200) {
      ref = shuffle(['up', 'down', 'left', 'right']);
      for (i = 0, len = ref.length; i < len; i++) {
        side = ref[i];
        entity = this.map.getEntityAtDirection(this.map_index, side);
        if (entity && entity.name === 'Empty') {
          child = new RoamingEntity();
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


},{"../lib/shuffleArray":12,"./EmptyEntity":3,"./LivingEntity":5,"./RawMaterialEntity":7}],9:[function(require,module,exports){
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

module.exports.mix = function(width, height, map) {
  var center_x, center_y, dual_spirals, maxDistance, mx, my, spiral;
  center_x = Math.floor(width / 2);
  center_y = Math.floor(height / 2);
  maxDistance = Math.sqrt(Math.pow(width - center_x, 2) + Math.pow(height - center_y, 2));
  mx = 1;
  my = 1;
  if (width > height) {
    mx = height / width;
  } else {
    my = width / height;
  }
  dual_spirals = module.exports.dual_spirals(width, height);
  spiral = module.exports.spiral(width, height);
  return function(index) {
    var distance, dx, dy, x, y;
    x = index % width;
    y = Math.floor(index / width);
    dx = (x - center_x) * mx;
    dy = (y - center_y + 1) * my;
    distance = Math.sin((Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / maxDistance) * 10);
    if (distance / maxDistance > .5) {
      return dual_spirals(index);
    } else {
      return spiral(index);
    }
  };
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
var ComplexMaterialEntity, EmptyEntity, Map, ProducerEntity, RawMaterialEntity, RoamingEntity, flow, shuffle, variables;

EmptyEntity = require('../entities/EmptyEntity');

RoamingEntity = require('../entities/RoamingEntity');

RawMaterialEntity = require('../entities/RawMaterialEntity');

ComplexMaterialEntity = require('../entities/ComplexMaterialEntity');

ProducerEntity = require('../entities/ProducerEntity');

flow = require('./flow');

shuffle = require('./shuffleArray');

variables = require('./variableHolder').Map;

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

  function Map(width, height) {
    var i, j, k, ref;
    this.width = width;
    this.height = height;
    this.flow = flow.opposite_spirals(this.width, this.height, this);
    this._image = new Uint8Array(this.width * this.height * 4);
    for (i = j = 0, ref = this.width * this.height - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.assignEntityToIndex(i, new EmptyEntity(), true);
    }
    for (k = 0; k <= 8; k++) {
      this._addProducer();
    }
  }

  Map.prototype.tick = function() {
    var entity, j, k, len, needed_material, ref, ref1;
    console.log(this._counts.RawMaterial);
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


},{"../entities/ComplexMaterialEntity":2,"../entities/EmptyEntity":3,"../entities/ProducerEntity":6,"../entities/RawMaterialEntity":7,"../entities/RoamingEntity":8,"./flow":9,"./shuffleArray":12,"./variableHolder":13}],12:[function(require,module,exports){
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
  Map: {
    empty_ratio: .3,
    chance_producer_spawn: 10,
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
  }
};

module.exports = variables;


},{}],14:[function(require,module,exports){
var FPS, Map, fps, getVariables, init, map, map_tick_int, running, sendImageData, sendTPS, start, stop, target_tps, tick, updateVariable, variables;

Map = require('./lib/map');

FPS = require('./lib/fps');

variables = require('./lib/variableHolder');

target_tps = 80;

map = null;

running = false;

map_tick_int = -1;

fps = FPS();

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


},{"./lib/fps":10,"./lib/map":11,"./lib/variableHolder":13}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW50aXRpZXMvQmFzZUVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvQ29tcGxleE1hdGVyaWFsRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9FbXB0eUVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvRmxvd2luZ0VudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvTGl2aW5nRW50aXR5LmNvZmZlZSIsInNyYy9lbnRpdGllcy9Qcm9kdWNlckVudGl0eS5jb2ZmZWUiLCJzcmMvZW50aXRpZXMvUmF3TWF0ZXJpYWxFbnRpdHkuY29mZmVlIiwic3JjL2VudGl0aWVzL1JvYW1pbmdFbnRpdHkuY29mZmVlIiwic3JjL2xpYi9mbG93LmNvZmZlZSIsInNyYy9saWIvZnBzLmNvZmZlZSIsInNyYy9saWIvbWFwLmNvZmZlZSIsInNyYy9saWIvc2h1ZmZsZUFycmF5LmNvZmZlZSIsInNyYy9saWIvdmFyaWFibGVIb2xkZXIuY29mZmVlIiwic3JjL3Byb2Nlc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBTTt1QkFDSixJQUFBLEdBQU07O0VBRU8sb0JBQUE7SUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWO0VBSEU7O3VCQUtiLElBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOO0FBQ0osUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsTUFBbUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxhQUFMLENBQW1CLEtBQW5CLENBQW5CLEVBQUMsSUFBQyxDQUFBLGNBQUYsRUFBUyxJQUFDLENBQUE7SUFDVixJQUFDLENBQUEs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TDdCLFNBTU8sZ0JBTlA7YUFNNkIsY0FBQSxDQUFlLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUF0QixFQUEwQixDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBakMsRUFBcUMsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQTVDO0FBTjdCLFNBT08sY0FQUDthQU82QixZQUFBLENBQUE7QUFQN0I7YUFRTyxPQUFPLENBQUMsS0FBUixDQUFjLGtCQUFBLEdBQW1CLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUF4QztBQVJQO0FBRGUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgQmFzZUVudGl0eVxuICBuYW1lOiAnQmFzZSdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAaXNfbW92ZWFibGUgPSB0cnVlXG4gICAgQGlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIEBjb2xvciA9IFswLCAwLCAwLCAyNTVdXG5cbiAgaW5pdDogKG1hcCwgaW5kZXgpIC0+XG4gICAgQG1hcCA9IG1hcFxuICAgIEBtYXBfaW5kZXggPSBpbmRleFxuICAgIFtAbWFwX3gsIEBtYXBfeV0gPSBAbWFwLl9pbmRleFRvUG9pbnQoaW5kZXgpXG4gICAgQHNldENvbG9yIEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIEBjb2xvclszXVxuICAgIHRydWVcblxuICBtb3ZlZDogKG5ld19pbmRleCkgLT5cbiAgICBAbWFwX2luZGV4ID0gbmV3X2luZGV4XG4gICAgW0BtYXBfeCwgQG1hcF95XSA9IEBtYXAuX2luZGV4VG9Qb2ludChuZXdfaW5kZXgpXG4gICAgQHNldENvbG9yIEBjb2xvclswXSwgQGNvbG9yWzFdLCBAY29sb3JbMl0sIEBjb2xvclszXVxuICAgIHRydWVcblxuICBzZXRDb2xvcjogKHIsIGcsIGIsIGEpIC0+XG4gICAgdW5sZXNzIEBpc19kZWxldGVkXG4gICAgICBAY29sb3IgPSBbciwgZywgYiwgYV1cbiAgICAgIGltYWdlX2luZGV4ID0gQG1hcF9pbmRleCAqIDQ7XG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleF0gPSByXG4gICAgICBAbWFwLl9pbWFnZVtpbWFnZV9pbmRleCArIDFdID0gZ1xuICAgICAgQG1hcC5faW1hZ2VbaW1hZ2VfaW5kZXggKyAyXSA9IGJcbiAgICAgIEBtYXAuX2ltYWdlW2ltYWdlX2luZGV4ICsgM10gPSBhXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICB0aWNrOiAtPlxuICAgIG5vdCBAaXNfZGVsZXRlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFbnRpdHkiLCJGbG93aW5nRW50aXR5ID0gcmVxdWlyZSAnLi9GbG93aW5nRW50aXR5J1xuXG5jbGFzcyBDb21wbGV4TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdDb21wbGV4TWF0ZXJpYWwnXG5cbiAgY29uc3RydWN0b3I6IChAdHlwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSozKSktPlxuICAgIHN1cGVyXG4gICAgQGlzX21vdmVhYmxlID0gZmFsc2VcbiAgICBzd2l0Y2ggQHR5cGVcbiAgICAgIHdoZW4gMFxuICAgICAgICBAY29sb3IgPSBbMjU1LCAwLCAwLCAyNTVdXG4gICAgICB3aGVuIDFcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgNTAsIDUwLCAyNTVdXG4gICAgICB3aGVuIDJcbiAgICAgICAgQGNvbG9yID0gWzI1NSwgMTAwLCAxMDAsIDI1NV1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBsZXhNYXRlcmlhbEVudGl0eSIsIkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5cbm1pbkJyaWdodG5lc3MgPSAwXG5tYXhCcmlnaHRuZXNzID0gMjBcblxuY2xhc3MgRW1wdHlFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdFbXB0eSdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigpXG4gICAgQGNvbG9yID0gWzAsIDAsIDAsIDI1NV1cblxuICB0aWNrOiAtPlxuICAgIHN1cGVyKCkgYW5kIChcbiAgICAgIGZhbHNlXG4jICAgICAgY29sb3JzID0gQGNvbG9yLmNvbmNhdCgpXG4jICAgICAgaW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMyk7XG4jICAgICAgY3VycmVudF9jb2xvciA9IGNvbG9yc1tpbmRdO1xuIyAgICAgIGluY3JlbWVudCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSAtIDEpICogM1xuIyAgICAgIGNvbG9yc1tpbmRdID0gTWF0aC5taW4obWF4QnJpZ2h0bmVzcywgTWF0aC5tYXgobWluQnJpZ2h0bmVzcywgY3VycmVudF9jb2xvciArIGluY3JlbWVudCkpXG4jICAgICAgQHNldENvbG9yKGNvbG9yc1swXSwgY29sb3JzWzFdLCBjb2xvcnNbMl0sIGNvbG9yc1szXSlcbiAgICApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFbXB0eUVudGl0eSIsIkJhc2VFbnRpdHkgPSByZXF1aXJlICcuL0Jhc2VFbnRpdHknXG5cbmRpcmVjdGlvbnMgPSBbJ3JpZ2h0JywgJ2Rvd24nLCAnbGVmdCcsICd1cCddXG5cbmNsYXNzIEZsb3dpbmdFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIG5hbWU6ICdGbG93aW5nJ1xuICBjb25zdHJ1Y3RvcjogLT4gc3VwZXJcblxuICB0aWNrOiAtPlxuICAgIGlmIHN1cGVyKClcbiAgICAgIGRpcmVjdGlvbiA9IGlmIE1hdGgucmFuZG9tKCkgPiAuNSB0aGVuIGRpcmVjdGlvbnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldIGVsc2UgQG1hcC5mbG93KEBtYXBfaW5kZXgpXG5cbiAgICAgIGVudGl0eSA9IEBtYXAuZ2V0RW50aXR5QXREaXJlY3Rpb24oQG1hcF9pbmRleCwgZGlyZWN0aW9uKVxuXG4gICAgICBpZiBlbnRpdHkgYW5kIGVudGl0eS5pc19tb3ZlYWJsZVxuICAgICAgICBAbWFwLnN3YXBFbnRpdGllcyhAbWFwX2luZGV4LCBlbnRpdHkubWFwX2luZGV4KVxuICAgICAgZWxzZVxuXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb3dpbmdFbnRpdHkiLCJCYXNlRW50aXR5ID0gcmVxdWlyZSAnLi9CYXNlRW50aXR5J1xuRW1wdHlFbnRpdHkgPSByZXF1aXJlICcuL0VtcHR5RW50aXR5J1xuXG5jbGFzcyBMaXZpbmdFbnRpdHkgZXh0ZW5kcyBCYXNlRW50aXR5XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQG1heF9oZWFsdGggPSA0MDBcblxuICBkaWVkOiAtPlxuXG4gIHRpY2s6IC0+XG4gICAgc3VwZXIoKSBhbmQgKFxuICAgICAgaWYgQGhlYWx0aCA8PSAwXG4gICAgICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChAbWFwX2luZGV4LCBuZXcgRW1wdHlFbnRpdHkoKSwgdHJ1ZSlcbiAgICAgICAgQGRpZWQoKVxuICAgICAgICBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBAc2V0Q29sb3IoQGNvbG9yWzBdLCBAY29sb3JbMV0sIEBjb2xvclsyXSwgTWF0aC5taW4oMjU1LCAyMCArIE1hdGgucm91bmQoKEBoZWFsdGggLyBAbWF4X2hlYWx0aCkqMjM1KSkpXG4gICAgICAgIHRydWVcbiAgICApXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2aW5nRW50aXR5IiwiTGl2aW5nRW50aXR5ID0gcmVxdWlyZSAnLi9MaXZpbmdFbnRpdHknXG5FbXB0eUVudGl0eSA9IHJlcXVpcmUgJy4vRW1wdHlFbnRpdHknXG5Db21wbGV4TWF0ZXJpYWxFbnRpdHkgPSByZXF1aXJlICcuL0NvbXBsZXhNYXRlcmlhbEVudGl0eSdcbnNodWZmbGUgPSByZXF1aXJlICcuLi9saWIvc2h1ZmZsZUFycmF5J1xudmFyaWFibGVIb2xkZXIgPSByZXF1aXJlKCcuLi9saWIvdmFyaWFibGVIb2xkZXInKS5Qcm9kdWNlckVudGl0eVxuXG5maXhtb2QgPSAobSwgbikgLT4gKChtJW4pK24pJW5cblxuY2xhc3MgUHJvZHVjZXJFbnRpdHkgZXh0ZW5kcyBMaXZpbmdFbnRpdHlcbiAgbmFtZTogJ1Byb2R1Y2VyJ1xuXG4gIGNvbnN0cnVjdG9yOiAoQHdhbnRzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjMpKS0+XG4gICAgc3VwZXJcbiAgICBAbWFrZXMgPSBmaXhtb2QoQHdhbnRzICsgMSwgMylcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBjb2xvciA9IFswLCAyNTUsIDAsIDI1NV1cbiAgICBAaGVhbHRoID0gdmFyaWFibGVIb2xkZXIuc3RhcnRpbmdfbGlmZVxuICAgIEBtYXhfaGVhbHRoID0gdmFyaWFibGVIb2xkZXIubWF4X2xpZmVcbiAgICBAbGFzdF9hdGUgPSAwXG4gICAgQGFnZSA9IDBcblxuICBnZXRTaWRlczogLT5cbiAgICAoQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBzaWRlKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J10pXG5cbiAgZWF0OiAoZW50aXRpZXMpIC0+XG4gICAgKFxuICAgICAgQGxhc3RfYXRlID0gMFxuICAgICAgQGFnZSA9IDBcbiAgICAgIEBoZWFsdGggKz0gdmFyaWFibGVIb2xkZXIubGlmZV9nYWluX3Blcl9mb29kXG4gICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoZW50aXR5Lm1hcF9pbmRleCwgbmV3IEVtcHR5RW50aXR5KCksIHRydWUpXG4gICAgKSBmb3IgZW50aXR5IGluIGVudGl0aWVzIHdoZW4gQGhlYWx0aCA8IEBtYXhfaGVhbHRoXG5cbiAgdHJhbnNmZXJIZWFsdGg6IChlbnRpdGllcykgLT5cbiAgICBmb3IgZW50aXR5IGluIGVudGl0aWVzXG4gICAgICBuZWVkcyA9IChcbiAgICAgICAgaWYgKEBoZWFsdGggPCB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2ZlciBhbmQgZW50aXR5LmhlYWx0aCA+IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyKVxuICAgICAgICAgIE1hdGguZmxvb3IoQGhlYWx0aCAqIC45KVxuICAgICAgICBlbHNlIGlmICgoQGhlYWx0aCA8IHZhcmlhYmxlSG9sZGVyLm1pbl9saWZlX3RvX3RyYW5zZmVyIGFuZCBlbnRpdHkuaGVhbHRoIDwgdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIpIG9yIChAaGVhbHRoID4gdmFyaWFibGVIb2xkZXIubWluX2xpZmVfdG9fdHJhbnNmZXIgYW5kIGVudGl0eS5oZWFsdGggPiB2YXJpYWJsZUhvbGRlci5taW5fbGlmZV90b190cmFuc2ZlcikpIGFuZCBAaGVhbHRoID4gZW50aXR5LmhlYWx0aFxuICAgICAgICAgIE1hdGgubWluKE1hdGguY2VpbCgoQGhlYWx0aCAtIGVudGl0eS5oZWFsdGgpIC8gMiksIHZhcmlhYmxlSG9sZGVyLm1heF9saWZlX3RyYW5zZmVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgMFxuICAgICAgKVxuXG4gICAgICBpZiBuZWVkcyA+IDBcbiAgICAgICAgQGhlYWx0aCAtPSBuZWVkc1xuICAgICAgICBlbnRpdHkuaGVhbHRoICs9IG5lZWRzXG5cbiAgICB0cnVlXG5cbiAgcmVwcm9kdWNlOiAoZW50aXRpZXMpIC0+XG4gICAgKFxuICAgICAgQGhlYWx0aCAtPSB2YXJpYWJsZUhvbGRlci5saWZlX2xvc3NfdG9fcmVwcm9kdWNlXG4gICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoZW50aXR5Lm1hcF9pbmRleCwgbmV3IFByb2R1Y2VyRW50aXR5KEB3YW50cyksIHRydWUpXG4gICAgICBAYWdlID0gMFxuICAgICkgZm9yIGVudGl0eSBpbiBlbnRpdGllcyB3aGVuIEBoZWFsdGggPj0gdmFyaWFibGVIb2xkZXIubGlmZV90b19yZXByb2R1Y2VcblxuICBkaWVkOiAtPlxuICAgIEBtYXAuYXNzaWduRW50aXR5VG9JbmRleChAbWFwX2luZGV4LCBuZXcgQ29tcGxleE1hdGVyaWFsRW50aXR5KEBtYWtlcyksIHRydWUpXG5cbiAgdGljazogLT5cbiAgICBpZiBzdXBlcigpXG4gICAgICBAbGFzdF9hdGUrK1xuICAgICAgQGFnZSsrXG5cbiAgICAgIHNpZGVzID0gKGVudGl0eSBmb3IgZW50aXR5IGluIEBnZXRTaWRlcygpIHdoZW4gZW50aXR5KVxuXG4gICAgICBwbGFjZWFibGVfZW50aXRpZXMgPSAoZW50aXR5IGZvciBlbnRpdHkgaW4gc2lkZXMgd2hlbiBlbnRpdHkubmFtZSBpcyBcIkVtcHR5XCIpXG4gICAgICBmcmllbmRseV9lbnRpdGllcyA9IChlbnRpdHkgZm9yIGVudGl0eSBpbiBzaWRlcyB3aGVuIGVudGl0eS5uYW1lIGlzIFwiUHJvZHVjZXJcIiBhbmQgZW50aXR5LndhbnRzIGlzIEB3YW50cyBhbmQgZW50aXR5Lm1ha2VzIGlzIEBtYWtlcylcbiAgICAgIGNvbnN1bWFibGVfZW50aXRpZXMgPSAoZW50aXR5IGZvciBlbnRpdHkgaW4gc2lkZXMgd2hlbiBlbnRpdHkubmFtZSBpcyBcIlJhd01hdGVyaWFsXCIgYW5kIGVudGl0eS50eXBlIGlzIEB3YW50cylcblxuICAgICAgQHRyYW5zZmVySGVhbHRoKGZyaWVuZGx5X2VudGl0aWVzKVxuXG4gICAgICBpZiBAYWdlID4gdmFyaWFibGVIb2xkZXIuYWdlX3RvX3JlcHJvZHVjZSBhbmQgTWF0aC5wb3coZnJpZW5kbHlfZW50aXRpZXMubGVuZ3RoKzEsIDIpLzE2ID4gTWF0aC5yYW5kb20oKVxuICAgICAgICBAcmVwcm9kdWNlKHBsYWNlYWJsZV9lbnRpdGllcylcblxuICAgICAgaWYgQGxhc3RfYXRlID4gdmFyaWFibGVIb2xkZXIuZWF0aW5nX2Nvb2xkb3duXG4gICAgICAgIEBlYXQoY29uc3VtYWJsZV9lbnRpdGllcylcblxuICAgICAgaWYgZnJpZW5kbHlfZW50aXRpZXMubGVuZ3RoIGlzIDRcbiAgICAgICAgQGFnZSA9IDBcbiAgICAgICAgQGNvbG9yWzFdID0gMjU1XG4gICAgICAgIEBoZWFsdGggLT0gMVxuICAgICAgZWxzZVxuICAgICAgICBAaGVhbHRoIC09IDJcbiAgICAgICAgQGNvbG9yWzFdID0gMjAwXG5cbiAgICAgIGlmIEBhZ2UgLyB2YXJpYWJsZUhvbGRlci5vbGRfYWdlX2RlYXRoX211bHRpcGxpZXIgPiBNYXRoLnJhbmRvbSgpXG4gICAgICAgIEBkaWVkKClcblxuXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2R1Y2VyRW50aXR5IiwiRmxvd2luZ0VudGl0eSA9IHJlcXVpcmUgJy4vRmxvd2luZ0VudGl0eSdcblxuY2xhc3MgUmF3TWF0ZXJpYWxFbnRpdHkgZXh0ZW5kcyBGbG93aW5nRW50aXR5XG4gIG5hbWU6ICdSYXdNYXRlcmlhbCdcblxuICBjb25zdHJ1Y3RvcjogKEB0eXBlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjMpKSAtPlxuICAgIHN1cGVyXG4gICAgc3dpdGNoIEB0eXBlXG4gICAgICB3aGVuIDBcbiAgICAgICAgQGNvbG9yID0gWzAsIDAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAxXG4gICAgICAgIEBjb2xvciA9IFs1MCwgNTAsIDI1NSwgMjU1XVxuICAgICAgd2hlbiAyXG4gICAgICAgIEBjb2xvciA9IFsxMDAsIDEwMCwgMjU1LCAyNTVdXG5cbm1vZHVsZS5leHBvcnRzID0gUmF3TWF0ZXJpYWxFbnRpdHkiLCJMaXZpbmdFbnRpdHkgPSByZXF1aXJlICcuL0xpdmluZ0VudGl0eSdcbkVtcHR5RW50aXR5ID0gcmVxdWlyZSAnLi9FbXB0eUVudGl0eSdcbnNodWZmbGUgPSByZXF1aXJlICcuLi9saWIvc2h1ZmZsZUFycmF5J1xuUmF3TWF0ZXJpYWxFbnRpdHkgPSByZXF1aXJlICcuL1Jhd01hdGVyaWFsRW50aXR5J1xuXG5zZWFyY2hfcmFkaXVzID0gMTBcblxuZGlyZWN0aW9ucyA9IFsncmlnaHQnLCAnZG93bicsICdsZWZ0JywgJ3VwJ11cblxuY2xhc3MgUm9hbWluZ0VudGl0eSBleHRlbmRzIExpdmluZ0VudGl0eVxuICBuYW1lOiAnUm9hbWluZydcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBzdXBlcigpXG4gICAgQG1heF9oZWFsdGggPSAyMDBcbiAgICBAaXNfbW92ZWFibGUgPSBmYWxzZVxuICAgIEBoZWFsdGggPSAxMDBcbiAgICBAY29sb3IgPSBbMjU1LCAyNTUsIDAsIDI1NV1cbiAgICBAc3R1Y2tfY291bnQgPSAwXG4gICAgQHN0dWNrX2Nvb2xkb3duID0gMFxuXG4gIGNob29zZURpcmVjdGlvbjogLT5cbiAgICBAd2FudGVkX2RpcmVjdGlvbiA9IGRpcmVjdGlvbnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldXG5cbiAgZG9Nb3ZlbWVudDogLT5cbiAgICBzZWxmID0gQFxuXG4gICAgaWYgQHN0dWNrX2NvdW50ID4gMjBcbiAgICAgIEBjaG9vc2VEaXJlY3Rpb24oKVxuICAgICAgQHN0dWNrX2Nvb2xkb3duID0gMjBcblxuICAgIGlmIEBzdHVja19jb29sZG93biA+IDBcbiAgICAgIEBzdHVja19jb29sZG93bi0tXG4gICAgICBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZGlyZWN0aW9uID0gKFxuICAgICAgaWYgQHN0dWNrX2Nvb2xkb3duID4gMFxuICAgICAgICBAc3R1Y2tfY29vbGRvd24tLVxuICAgICAgICBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICB4X25lZyA9IE1hdGgubWF4KEBtYXBfeCAtIHNlYXJjaF9yYWRpdXMsIDApXG4gICAgICAgIHlfbmVnID0gTWF0aC5tYXgoQG1hcF95IC0gc2VhcmNoX3JhZGl1cywgMClcbiAgICAgICAgeF9wb3MgPSBNYXRoLm1pbihAbWFwX3ggKyBzZWFyY2hfcmFkaXVzLCBAbWFwLndpZHRoKVxuICAgICAgICB5X3BvcyA9IE1hdGgubWluKEBtYXBfeSArIHNlYXJjaF9yYWRpdXMsIEBtYXAuaGVpZ2h0KVxuXG4gICAgICAgIGFsbF9lbnRpdGllcyA9IFtdXG5cbiAgICAgICAgZm9yIHkgaW4gW3lfbmVnIC4uIHlfcG9zXVxuICAgICAgICAgIGFsbF9lbnRpdGllcyA9IGFsbF9lbnRpdGllcy5jb25jYXQoc2VsZi5tYXAuZ2V0RW50aXRpZXNJblJhbmdlKHNlbGYubWFwLl9wb2ludFRvSW5kZXgoeF9uZWcsIHkpLCBzZWxmLm1hcC5fcG9pbnRUb0luZGV4KHhfcG9zLCB5KSkpXG5cbiAgICAgICAgZmlsdGVyZWRfZW50aXRpZXMgPSBhbGxfZW50aXRpZXMuZmlsdGVyIChlbnRpdHkpIC0+XG4gICAgICAgICAgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcblxuICAgICAgICBmaWx0ZXJlZF9lbnRpdGllcy5zb3J0IChlbnRfYSwgZW50X2IpIC0+XG4gICAgICAgICAgYV9kaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlbnRfYS5tYXBfeCAtIHNlbGYubWFwX3gsIDIpICsgTWF0aC5wb3coZW50X2EubWFwX3kgLSBzZWxmLm1hcF95LCAyKSlcbiAgICAgICAgICBiX2Rpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KGVudF9iLm1hcF94IC0gc2VsZi5tYXBfeCwgMikgKyBNYXRoLnBvdyhlbnRfYi5tYXBfeSAtIHNlbGYubWFwX3ksIDIpKVxuXG4gICAgICAgICAgaWYgYV9kaXN0YW5jZSA8IGJfZGlzdGFuY2UgdGhlbiAtMVxuICAgICAgICAgIGVsc2UgaWYgYV9kaXN0YW5jZSA+IGJfZGlzdGFuY2UgdGhlbiAxXG4gICAgICAgICAgZWxzZSAwXG5cbiAgICAgICAgaWYgZmlsdGVyZWRfZW50aXRpZXMubGVuZ3RoXG4gICAgICAgICAgdGFyZ2V0X2VudGl0eSA9IGZpbHRlcmVkX2VudGl0aWVzWzBdXG4gICAgICAgICAgZHggPSB0YXJnZXRfZW50aXR5Lm1hcF94IC0gc2VsZi5tYXBfeFxuICAgICAgICAgIGR5ID0gdGFyZ2V0X2VudGl0eS5tYXBfeSAtIHNlbGYubWFwX3lcblxuICAgICAgICAgIGlmIE1hdGguYWJzKGR4KSA+IE1hdGguYWJzKGR5KVxuICAgICAgICAgICAgaWYgZHggPiAwIHRoZW4gJ3JpZ2h0JyBlbHNlICdsZWZ0J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGR5ID4gMCB0aGVuICdkb3duJyBlbHNlICd1cCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG4gICAgKVxuXG4gICAgdW5sZXNzIGRpcmVjdGlvblxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA+IC45IHRoZW4gQGNob29zZURpcmVjdGlvbigpXG4gICAgICBkaXJlY3Rpb24gPSBAd2FudGVkX2RpcmVjdGlvblxuXG4gICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBkaXJlY3Rpb24pO1xuXG4gICAgaWYgZW50aXR5XG4gICAgICBAbWFwLnN3YXBFbnRpdGllcyBAbWFwX2luZGV4LCBlbnRpdHkubWFwX2luZGV4XG4gICAgICBAc3R1Y2tfY291bnQgPSAwXG4gICAgZWxzZVxuICAgICAgQHN0dWNrX2NvdW50KytcblxuICBjb25zdW1lTWF0ZXJpYWw6IC0+XG4gICAgKFxuICAgICAgZW50aXR5ID0gQG1hcC5nZXRFbnRpdHlBdERpcmVjdGlvbihAbWFwX2luZGV4LCBzaWRlKVxuXG4gICAgICBpZiBlbnRpdHlcbiAgICAgICAgaWYgZW50aXR5Lm5hbWUgaXMgJ0NvbXBsZXhNYXRlcmlhbCdcbiAgICAgICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoZW50aXR5Lm1hcF9pbmRleCwgbmV3IFJhd01hdGVyaWFsRW50aXR5KGVudGl0eS50eXBlKSwgdHJ1ZSlcbiAgICAgICAgICBAaGVhbHRoICs9IDUwXG4gICAgKSBmb3Igc2lkZSBpbiBzaHVmZmxlIFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J11cblxuICByZXByb2R1Y2U6IC0+XG4gICAgaWYgQGhlYWx0aCA+IDIwMFxuICAgICAgKFxuICAgICAgICBlbnRpdHkgPSBAbWFwLmdldEVudGl0eUF0RGlyZWN0aW9uKEBtYXBfaW5kZXgsIHNpZGUpXG5cbiAgICAgICAgaWYgZW50aXR5IGFuZCBlbnRpdHkubmFtZSBpcyAnRW1wdHknXG4gICAgICAgICAgICBjaGlsZCA9IG5ldyBSb2FtaW5nRW50aXR5KClcbiAgICAgICAgICAgIGNoaWxkLmhlYWx0aCA9IDIwXG4gICAgICAgICAgICBAbWFwLmFzc2lnbkVudGl0eVRvSW5kZXgoZW50aXR5Lm1hcF9pbmRleCwgY2hpbGQgLCB0cnVlKVxuICAgICAgICAgICAgQGhlYWx0aCAtPSA1MFxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICkgZm9yIHNpZGUgaW4gc2h1ZmZsZSBbJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCddXG5cbiAgICB0cnVlXG5cbiAgdGljazogLT5cbiAgICBpZiBzdXBlcigpXG4gICAgICBAY29uc3VtZU1hdGVyaWFsKClcbiAgICAgIEBkb01vdmVtZW50KClcbiAgICAgIEByZXByb2R1Y2UoKVxuICAgICAgQGhlYWx0aC0tXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBSb2FtaW5nRW50aXR5XG4iLCJOdW1iZXIucHJvdG90eXBlLm1vZCA9IChuKSAtPiAoKHRoaXMlbikrbiklblxuXG5tb2R1bGUuZXhwb3J0cy5taXggPSAod2lkdGgsIGhlaWdodCwgbWFwKSAtPlxuICBjZW50ZXJfeCA9IE1hdGguZmxvb3Igd2lkdGgvMlxuICBjZW50ZXJfeSA9IE1hdGguZmxvb3IgaGVpZ2h0LzJcbiAgbWF4RGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3cod2lkdGgtY2VudGVyX3gsIDIpICsgTWF0aC5wb3coaGVpZ2h0LWNlbnRlcl95LCAyKSlcblxuICBteCA9IDFcbiAgbXkgPSAxXG5cbiAgaWYgd2lkdGggPiBoZWlnaHRcbiAgICBteCA9IGhlaWdodC93aWR0aFxuICBlbHNlXG4gICAgbXkgPSB3aWR0aC9oZWlnaHRcblxuICBkdWFsX3NwaXJhbHMgPSBtb2R1bGUuZXhwb3J0cy5kdWFsX3NwaXJhbHMod2lkdGgsIGhlaWdodClcbiAgc3BpcmFsID0gbW9kdWxlLmV4cG9ydHMuc3BpcmFsKHdpZHRoLCBoZWlnaHQpXG5cbiAgKGluZGV4KSAtPlxuICAgIHggPSBpbmRleCAlIHdpZHRoXG4gICAgeSA9IE1hdGguZmxvb3IgaW5kZXggLyB3aWR0aFxuXG4gICAgZHggPSAoKHggLSBjZW50ZXJfeCkgKiBteClcbiAgICBkeSA9ICgoeSAtIGNlbnRlcl95ICsgMSkgKiBteSlcblxuICAgIGRpc3RhbmNlID0gTWF0aC5zaW4oKE1hdGguc3FydChNYXRoLnBvdyhkeCwgMikgKyBNYXRoLnBvdyhkeSwgMikpIC8gbWF4RGlzdGFuY2UpICogMTApXG5cbiAgICBpZiAoZGlzdGFuY2UgLyBtYXhEaXN0YW5jZSA+IC41KSB0aGVuIGR1YWxfc3BpcmFscyhpbmRleClcbiAgICBlbHNlIHNwaXJhbChpbmRleClcblxuXG5tb2R1bGUuZXhwb3J0cy5kdWFsX3NwaXJhbHMgPSAod2lkdGgsIGhlaWdodCwgbWFwKSAtPlxuICBjZW50ZXJfeCA9IE1hdGguZmxvb3Igd2lkdGgvMlxuICBjZW50ZXJfeSA9IE1hdGguZmxvb3IgaGVpZ2h0LzJcblxuICB6ID0gMVxuXG4gIChpbmRleCkgLT5cblxuICAgIHggPSBpbmRleCAlIHdpZHRoXG4gICAgeSA9IE1hdGguZmxvb3IgaW5kZXggLyB3aWR0aFxuXG4gICAgZHggPSB4IC0gY2VudGVyX3hcbiAgICBkeSA9IHkgLSBjZW50ZXJfeVxuXG4gICAgbXggPSBNYXRoLmFicyhkeClcblxuICAgIHEgPSAoXG4gICAgICBpZiBkeSA+IDBcbiAgICAgICAgaWYgbXggPCBjZW50ZXJfeCAvIDIgdGhlbiAwIGVsc2UgMVxuICAgICAgZWxzZVxuICAgICAgICBpZiBteCA+IGNlbnRlcl94IC8gMiB0aGVuIDIgZWxzZSAzXG4gICAgKVxuXG4gICAgcmFuZCA9IE1hdGgucmFuZG9tKCkgPj0gLjVcblxuICAgIGlmIGR4ID4gMFxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICd1cCcgZWxzZSAnbGVmdCdcbiAgICAgICAgd2hlbiAxXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICdkb3duJ1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICd1cCdcbiAgICBlbHNlXG4gICAgICBzd2l0Y2ggcVxuICAgICAgICB3aGVuIDBcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3VwJyBlbHNlICdyaWdodCdcbiAgICAgICAgd2hlbiAxXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdyaWdodCcgZWxzZSAnZG93bidcbiAgICAgICAgd2hlbiAyXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdkb3duJyBlbHNlICdsZWZ0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2xlZnQnIGVsc2UgJ3VwJ1xuXG5cbm1vZHVsZS5leHBvcnRzLm9wcG9zaXRlX3NwaXJhbHMgPSAod2lkdGgsIGhlaWdodCwgbWFwKSAtPlxuICBjZW50ZXJfeCA9IE1hdGguZmxvb3Igd2lkdGgvMlxuICBjZW50ZXJfeSA9IE1hdGguZmxvb3IgaGVpZ2h0LzJcblxuICB6ID0gMVxuXG4gIChpbmRleCkgLT5cblxuICAgIHggPSBpbmRleCAlIHdpZHRoXG4gICAgeSA9IE1hdGguZmxvb3IgaW5kZXggLyB3aWR0aFxuXG4gICAgZHggPSB4IC0gY2VudGVyX3hcbiAgICBkeSA9IHkgLSBjZW50ZXJfeVxuXG4gICAgbXggPSBNYXRoLmFicyhkeClcblxuICAgIHEgPSAoXG4gICAgICBpZiBkeSA+IDBcbiAgICAgICAgaWYgbXggPCBjZW50ZXJfeCAvIDIgdGhlbiAwIGVsc2UgMVxuICAgICAgZWxzZVxuICAgICAgICBpZiBteCA+IGNlbnRlcl94IC8gMiB0aGVuIDIgZWxzZSAzXG4gICAgKVxuXG4gICAgcmFuZCA9IE1hdGgucmFuZG9tKCkgPj0gLjVcblxuICAgIGlmIGR4ID4gMFxuICAgICAgc3dpdGNoIHFcbiAgICAgICAgd2hlbiAwXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICd1cCcgZWxzZSAnbGVmdCdcbiAgICAgICAgd2hlbiAxXG4gICAgICAgICAgaWYgcmFuZCB0aGVuICdsZWZ0JyBlbHNlICdkb3duJ1xuICAgICAgICB3aGVuIDJcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICd1cCdcbiAgICBlbHNlXG4gICAgICBzd2l0Y2ggcVxuICAgICAgICB3aGVuIDBcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ2Rvd24nIGVsc2UgJ2xlZnQnXG4gICAgICAgIHdoZW4gMVxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAnbGVmdCcgZWxzZSAndXAnXG4gICAgICAgIHdoZW4gMlxuICAgICAgICAgIGlmIHJhbmQgdGhlbiAndXAnIGVsc2UgJ3JpZ2h0J1xuICAgICAgICB3aGVuIDNcbiAgICAgICAgICBpZiByYW5kIHRoZW4gJ3JpZ2h0JyBlbHNlICdkb3duJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMudGlnaHRfc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgLT5cbiAgY2VudGVyX3ggPSBNYXRoLmZsb29yIHdpZHRoLzJcbiAgY2VudGVyX3kgPSBNYXRoLmZsb29yIGhlaWdodC8yXG5cbiAgKGluZGV4KSAtPlxuXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9IHggLSBjZW50ZXJfeFxuICAgIGR5ID0geSAtIGNlbnRlcl95XG5cbiAgICBpZiBkeCA+IDAgYW5kIGR5ID49IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAndXAnXG4gICAgICBlbHNlXG4gICAgICAgICdyaWdodCdcbiAgICBlbHNlIGlmIGR4ID49IDAgYW5kIGR5IDwgMFxuICAgICAgaWYgTWF0aC5yYW5kb20oKSA8IE1hdGguYWJzKGR5KSAvIGNlbnRlcl95XG4gICAgICAgICdsZWZ0J1xuICAgICAgZWxzZVxuICAgICAgICAndXAnXG4gICAgZWxzZSBpZiBkeCA8IDAgYW5kIGR5IDw9IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeCkgLyBjZW50ZXJfeFxuICAgICAgICAnZG93bidcbiAgICAgIGVsc2VcbiAgICAgICAgJ2xlZnQnXG4gICAgZWxzZSBpZiBkeCA8PSAwIGFuZCBkeSA+IDBcbiAgICAgIGlmIE1hdGgucmFuZG9tKCkgPCBNYXRoLmFicyhkeSkgLyBjZW50ZXJfeVxuICAgICAgICAncmlnaHQnXG4gICAgICBlbHNlXG4gICAgICAgICdkb3duJ1xuICAgIGVsc2UgWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV1cblxubW9kdWxlLmV4cG9ydHMuc3BpcmFsID0gKHdpZHRoLCBoZWlnaHQpIC0+XG4gIGNlbnRlcl94ID0gTWF0aC5mbG9vciB3aWR0aC8yXG4gIGNlbnRlcl95ID0gTWF0aC5mbG9vciBoZWlnaHQvMlxuXG4gIGRpdmlzaW9uX2FuZ2xlID0gTWF0aC5mbG9vciAzNjAvNFxuICBtYXhEaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh3aWR0aC1jZW50ZXJfeCwgMikgKyBNYXRoLnBvdyhoZWlnaHQtY2VudGVyX3ksIDIpKVxuICBteCA9IDFcbiAgbXkgPSAxXG5cbiAgaWYgd2lkdGggPiBoZWlnaHRcbiAgICBteCA9IGhlaWdodC93aWR0aFxuICBlbHNlXG4gICAgbXkgPSB3aWR0aC9oZWlnaHRcblxuICBkaXJlY3Rpb25zID0gWydyaWdodCcsICdkb3duJywgJ2xlZnQnLCAndXAnXVxuXG4gIHBvaW50Q2FjaGUgPSBbXVxuXG4gIGZvciBpbmRleCBpbiBbMCAuLiB3aWR0aCAqIGhlaWdodCAtIDFdXG4gICAgeCA9IGluZGV4ICUgd2lkdGhcbiAgICB5ID0gTWF0aC5mbG9vciBpbmRleCAvIHdpZHRoXG5cbiAgICBkeCA9ICgoeCAtIGNlbnRlcl94KSAqIG14KVxuICAgIGR5ID0gKCh5IC0gY2VudGVyX3kgKyAxKSAqIG15KVxuXG4gICAgZGlzdGFuY2UgPSBNYXRoLnNpbigoTWF0aC5zcXJ0KE1hdGgucG93KGR4LCAyKSArIE1hdGgucG93KGR5LCAyKSkgLyBtYXhEaXN0YW5jZSkgKiAxMClcbiAgICBhbmdsZSA9IE1hdGguZmxvb3IoKCgoKE1hdGguYXRhbjIoZHksIGR4KSoxODApL01hdGguUEkpK2Rpc3RhbmNlKS5tb2QoMzYwKS9kaXZpc2lvbl9hbmdsZSkqMTAwKS8xMDBcblxuICAgIHBvaW50Q2FjaGVbaW5kZXhdID0gYW5nbGVcblxuICAoaW5kZXgpIC0+XG4gICAgYW5nbGUgPSBwb2ludENhY2hlW2luZGV4XVxuXG4gICAgaW50cCA9IE1hdGguZmxvb3IoYW5nbGUpXG4gICAgZGVjID0gTWF0aC5mbG9vcigoYW5nbGUtaW50cCkqMTAwKVxuXG4gICAgZGlyZWN0aW9uID0gIGlmIE1hdGgucmFuZG9tKCkqOTAgPiBkZWMgdGhlbiAoaW50cCsxKS5tb2QoNCkgZWxzZSAoaW50cCsyKS5tb2QoNClcblxuICAgIGRpcmVjdGlvbnNbZGlyZWN0aW9uXSIsIm1vZHVsZS5leHBvcnRzID0gLT5cbiAgZmlsdGVyX3N0cmVuZ3RoID0gMjBcbiAgZnJhbWVfdGltZSA9IDBcbiAgbGFzdF9sb29wID0gbmV3IERhdGUoKVxuICB7XG4gICAgdGljayA6IC0+XG4gICAgICB0aGlzX2xvb3AgPSBuZXcgRGF0ZVxuICAgICAgdGhpc190aW1lID0gdGhpc19sb29wIC0gbGFzdF9sb29wXG4gICAgICBmcmFtZV90aW1lICs9ICh0aGlzX3RpbWUgLSBmcmFtZV90aW1lKSAvIGZpbHRlcl9zdHJlbmd0aFxuICAgICAgbGFzdF9sb29wID0gdGhpc19sb29wXG4gICAgZ2V0RnBzIDogLT5cbiAgICAgIDEwMDAgLyBmcmFtZV90aW1lXG4gIH1cblxuXG4iLCJFbXB0eUVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL0VtcHR5RW50aXR5J1xuUm9hbWluZ0VudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL1JvYW1pbmdFbnRpdHknXG5SYXdNYXRlcmlhbEVudGl0eSA9IHJlcXVpcmUgJy4uL2VudGl0aWVzL1Jhd01hdGVyaWFsRW50aXR5J1xuQ29tcGxleE1hdGVyaWFsRW50aXR5ID0gcmVxdWlyZSAnLi4vZW50aXRpZXMvQ29tcGxleE1hdGVyaWFsRW50aXR5J1xuUHJvZHVjZXJFbnRpdHkgPSByZXF1aXJlICcuLi9lbnRpdGllcy9Qcm9kdWNlckVudGl0eSdcbmZsb3cgPSByZXF1aXJlICcuL2Zsb3cnXG5zaHVmZmxlID0gcmVxdWlyZSAnLi9zaHVmZmxlQXJyYXknXG52YXJpYWJsZXMgPSByZXF1aXJlKCcuL3ZhcmlhYmxlSG9sZGVyJykuTWFwXG5cbmNsYXNzIE1hcFxuICAjIFByaXZhdGVzXG4gIF9tYXA6IFtdXG5cbiAgX3RpY2s6IDBcblxuICBfaW1hZ2U6IG51bGxcbiAgX2NvdW50czoge0Jhc2U6MCwgRW1wdHk6MCwgUmF3TWF0ZXJpYWw6MCwgUm9hbWluZzowLCBDb21wbGV4TWF0ZXJpYWw6MCwgUHJvZHVjZXI6MH1cblxuICAjcHVibGljc1xuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCkgLT5cbiAgICBAZmxvdyA9IGZsb3cub3Bwb3NpdGVfc3BpcmFscyhAd2lkdGgsIEBoZWlnaHQsIEApXG4gICAgQF9pbWFnZSA9IG5ldyBVaW50OEFycmF5KEB3aWR0aCAqIEBoZWlnaHQgKiA0KVxuICAgIEBhc3NpZ25FbnRpdHlUb0luZGV4KGksIG5ldyBFbXB0eUVudGl0eSgpLCB0cnVlKSBmb3IgaSBpbiBbMCAuLiBAd2lkdGgqQGhlaWdodCAtIDFdXG5cbiAgICBAX2FkZFByb2R1Y2VyKCkgZm9yIFswIC4uIDhdXG5cbiAgdGljazogLT5cbiAgICBjb25zb2xlLmxvZyBAX2NvdW50cy5SYXdNYXRlcmlhbFxuICAgIG5lZWRlZF9tYXRlcmlhbCA9IEBfZ2V0TmVlZGVkTWF0ZXJpYWxDb3VudCgpXG4gICAgaWYgbmVlZGVkX21hdGVyaWFsID4gMFxuICAgICAgQF9hZGRNYXRlcmlhbCgpIGZvciBbMCAuLiBuZWVkZWRfbWF0ZXJpYWxdXG4gICAgaWYgTWF0aC5yYW5kb20oKSoxMDAwMCA8IHZhcmlhYmxlcy5jaGFuY2Vfcm9hbWVyX3NwYXduXG4gICAgICBAX2FkZFJvYW1lcigpXG4gICAgaWYgTWF0aC5yYW5kb20oKSoxMDAwMCA8IHZhcmlhYmxlcy5jaGFuY2VfcHJvZHVjZXJfc3Bhd25cbiAgICAgIEBfYWRkUHJvZHVjZXIoKVxuICAgIGVudGl0eS50aWNrKCkgZm9yIGVudGl0eSBpbiBzaHVmZmxlKEBfbWFwLnNsaWNlKCkpXG4gICAgQF90aWNrKytcblxuICBnZXRSZW5kZXI6IC0+XG4gICAgQF9pbWFnZVxuXG4gIGdldEVudGl0eUF0WFk6ICh4LCB5KSAtPlxuICAgIEBnZXRFbnRpdHlBdEluZGV4KEBfcG9pbnRUb0luZGV4KHgsIHkpKVxuXG4gIGdldEVudGl0eUF0SW5kZXg6IChpbmRleCkgLT5cbiAgICBpZiBAX21hcFtpbmRleF0/IHRoZW4gQF9tYXBbaW5kZXhdIGVsc2UgZmFsc2VcblxuICBnZXRFbnRpdGllc0luUmFuZ2U6IChpbmRleF9taW4sIGluZGV4X21heCkgLT5cbiAgICBAX21hcC5zbGljZShpbmRleF9taW4sIGluZGV4X21heCsxKVxuXG4gIHN3YXBFbnRpdGllczogKGluZGV4MSwgaW5kZXgyKSAtPlxuICAgIGVudDEgPSBAZ2V0RW50aXR5QXRJbmRleCBpbmRleDFcbiAgICBlbnQyID0gQGdldEVudGl0eUF0SW5kZXggaW5kZXgyXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXggaW5kZXgxLCBlbnQyXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXggaW5kZXgyLCBlbnQxXG4gICAgZW50MS5pc19kZWxldGVkID0gZmFsc2VcbiAgICBlbnQyLmlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIHRydWVcblxuICBnZXRFbnRpdHlBdERpcmVjdGlvbjogKGluZGV4LCBkaXJlY3Rpb24pIC0+XG4gICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnXG4gICAgICAgIGlmIGluZGV4ID4gQHdpZHRoIC0gMVxuICAgICAgICAgIEBnZXRFbnRpdHlBdEluZGV4KGluZGV4IC0gQHdpZHRoKVxuICAgICAgICBlbHNlIGZhbHNlXG4gICAgICB3aGVuICdkb3duJ1xuICAgICAgICBpZiBpbmRleCA8IEBfbWFwLmxlbmd0aCAtIDFcbiAgICAgICAgICBAZ2V0RW50aXR5QXRJbmRleChpbmRleCArIEB3aWR0aClcbiAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgaWYgaW5kZXggJSBAd2lkdGggPiAwXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggLSAxKVxuICAgICAgICBlbHNlIGZhbHNlXG4gICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgaWYgaW5kZXggJSBAd2lkdGggPCBAd2lkdGggLSAxXG4gICAgICAgICAgQGdldEVudGl0eUF0SW5kZXgoaW5kZXggKyAxKVxuICAgICAgICBlbHNlIGZhbHNlXG5cbiAgYXNzaWduRW50aXR5VG9JbmRleDogKGluZGV4LCBlbnRpdHksIGlzX25ldyA9IGZhbHNlKSAtPlxuICAgIGN1cnJlbnRfZW50aXR5ID0gQGdldEVudGl0eUF0SW5kZXgoaW5kZXgpXG4gICAgaWYgY3VycmVudF9lbnRpdHlcbiAgICAgIGN1cnJlbnRfZW50aXR5LmlzX2RlbGV0ZWQgPSB0cnVlXG4gICAgICBAX2NvdW50c1tjdXJyZW50X2VudGl0eS5uYW1lXS0tXG5cbiAgICBAX2NvdW50c1tlbnRpdHkubmFtZV0rK1xuXG4gICAgQF9tYXBbaW5kZXhdID0gZW50aXR5XG4gICAgZW50aXR5LmlzX2RlbGV0ZWQgPSBmYWxzZVxuICAgIGlmIGlzX25ld1xuICAgICAgZW50aXR5LmluaXQgQCwgaW5kZXhcbiAgICBlbHNlXG4gICAgICBlbnRpdHkubW92ZWQoaW5kZXgpXG4gICAgdHJ1ZVxuXG4gICNwcml2YXRlc1xuICBfcG9pbnRUb0luZGV4OiAoeCwgeSkgLT4geCArIEB3aWR0aCAqIHlcbiAgX2luZGV4VG9Qb2ludDogKGluZGV4KSAtPiBbaW5kZXggJSBAd2lkdGgsIE1hdGguZmxvb3IoaW5kZXggLyBAd2lkdGgpXVxuICBfYWRkRW50aXR5VG9FbXB0eTogKHR5cGUpIC0+XG4gICAgbG9vcFxuICAgICAgaSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChAX21hcC5sZW5ndGgtMSkpXG4gICAgICBicmVhayBpZiBAZ2V0RW50aXR5QXRJbmRleChpKT8ubmFtZSBpcyAnRW1wdHknXG4gICAgQGFzc2lnbkVudGl0eVRvSW5kZXgoaSwgbmV3IHR5cGUoKSwgdHJ1ZSlcblxuICBfZ2V0TmVlZGVkTWF0ZXJpYWxDb3VudDogLT5cbiAgICBNYXRoLmZsb29yKEBfbWFwLmxlbmd0aCAqIHZhcmlhYmxlcy5lbXB0eV9yYXRpbykgLSBAX2NvdW50cy5Db21wbGV4TWF0ZXJpYWwgLSBAX2NvdW50cy5SYXdNYXRlcmlhbCAtIEBfY291bnRzLlByb2R1Y2VyXG5cbiAgX2FkZE1hdGVyaWFsOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShSYXdNYXRlcmlhbEVudGl0eSlcblxuICBfYWRkQ29tcGxleE1hdGVyaWFsOiAtPlxuICAgIEBfYWRkRW50aXR5VG9FbXB0eShDb21wbGV4TWF0ZXJpYWxFbnRpdHkpXG5cbiAgX2FkZFJvYW1lcjogLT5cbiAgICBAX2FkZEVudGl0eVRvRW1wdHkoUm9hbWluZ0VudGl0eSlcblxuICBfYWRkUHJvZHVjZXI6IC0+XG4gICAgQF9hZGRFbnRpdHlUb0VtcHR5KFByb2R1Y2VyRW50aXR5KVxuXG4gICNkZWJ1Z3NcbiAgJCRkdW1wTWFwOiAtPlxuICAgIGNvbnNvbGUuZGVidWcgQF9tYXBcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBcblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChhcnJheSkgLT5cbiAgY291bnRlciA9IGFycmF5Lmxlbmd0aFxuICAjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcbiAgd2hpbGUgY291bnRlciA+IDBcbiMgUGljayBhIHJhbmRvbSBpbmRleFxuICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRlcilcbiAgICAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgIGNvdW50ZXItLVxuICAgICMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG4gICAgdGVtcCA9IGFycmF5W2NvdW50ZXJdXG4gICAgYXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cbiAgICBhcnJheVtpbmRleF0gPSB0ZW1wXG4gIGFycmF5IiwiXG52YXJpYWJsZXMgPVxuICBNYXA6XG4gICAgZW1wdHlfcmF0aW86IC4zXG4gICAgY2hhbmNlX3Byb2R1Y2VyX3NwYXduOiAxMFxuICAgIGNoYW5jZV9yb2FtZXJfc3Bhd246IDEwMFxuICBQcm9kdWNlckVudGl0eTpcbiAgICBzdGFydGluZ19saWZlOiAyMDBcbiAgICBsaWZlX2dhaW5fcGVyX2Zvb2Q6IDEyMDBcbiAgICBsaWZlX3RvX3JlcHJvZHVjZTogNjAwXG4gICAgbGlmZV9sb3NzX3RvX3JlcHJvZHVjZTogNDAwXG4gICAgbWF4X2xpZmU6IDYwMFxuICAgIG1pbl9saWZlX3RvX3RyYW5zZmVyOiA1MFxuICAgIG1heF9saWZlX3RyYW5zZmVyOiA1MFxuICAgIGVhdGluZ19jb29sZG93bjogMTBcbiAgICBhZ2VfdG9fcmVwcm9kdWNlOiA4MFxuICAgIG9sZF9hZ2VfZGVhdGhfbXVsdGlwbGllcjogMTAwMDAwMDBcblxubW9kdWxlLmV4cG9ydHMgPSB2YXJpYWJsZXNcbiIsIk1hcCA9IHJlcXVpcmUgJy4vbGliL21hcCdcbkZQUyA9IHJlcXVpcmUoJy4vbGliL2ZwcycpXG5cbnZhcmlhYmxlcyA9IHJlcXVpcmUgJy4vbGliL3ZhcmlhYmxlSG9sZGVyJ1xuXG50YXJnZXRfdHBzID0gODBcblxubWFwID0gbnVsbFxucnVubmluZyA9IGZhbHNlXG5tYXBfdGlja19pbnQgPSAtMTtcbmZwcyA9IEZQUygpXG5cblxudGljayA9IC0+XG4gIG1hcC50aWNrKClcbiAgZnBzLnRpY2soKVxuICBudWxsXG5cbmluaXQgPSAod2lkdGgsIGhlaWdodCkgLT5cbiAgbWFwID0gbmV3IE1hcCB3aWR0aCwgaGVpZ2h0XG4gIHNlbGYucG9zdE1lc3NhZ2UgWydpbml0aWFsaXplZCddXG5cbnN0YXJ0ID0gLT5cbiAgcnVubmluZyA9IHRydWVcbiAgZnBzID0gRlBTKClcbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ3N0YXJ0ZWQnXVxuICBjbGVhckludGVydmFsIG1hcF90aWNrX2ludFxuICBtYXBfdGlja19pbnQgPSBzZXRJbnRlcnZhbCB0aWNrLCAxMDAwL3RhcmdldF90cHNcblxuc3RvcCA9IC0+XG4gIHJ1bm5pbmcgPSBmYWxzZVxuICBjbGVhckludGVydmFsIG1hcF90aWNrX2ludFxuICBzZWxmLnBvc3RNZXNzYWdlIFsnc3RvcHBlZCddXG5cbnNlbmRJbWFnZURhdGEgPSAtPlxuICBzZWxmLnBvc3RNZXNzYWdlIFsnaW1hZ2VEYXRhJywgbWFwLmdldFJlbmRlcigpXVxuXG5zZW5kVFBTID0gLT5cbiAgc2VsZi5wb3N0TWVzc2FnZSBbJ3RwbScsIGZwcy5nZXRGcHMoKV1cblxudXBkYXRlVmFyaWFibGUgPSAodHlwZSwgdmFyaWFibGUsIHZhbHVlKSAtPlxuICBjb25zb2xlLmRlYnVnIFwiVXBkYXRpbmcgI3t0eXBlfS4je3ZhcmlhYmxlfSB0byAje3ZhbHVlfVwiXG4gIHZhcmlhYmxlc1t0eXBlXVt2YXJpYWJsZV0gPSB2YWx1ZVxuXG5nZXRWYXJpYWJsZXMgPSAtPlxuICBzZWxmLnBvc3RNZXNzYWdlIFsndmFyaWFibGVzJywgdmFyaWFibGVzXVxuXG5cbnNlbGYub25tZXNzYWdlID0gKGUpIC0+XG4gIHN3aXRjaCBlLmRhdGFbMF1cbiAgICB3aGVuICdpbml0JyAgICAgICAgICAgdGhlbiBpbml0KGUuZGF0YVsxXSwgZS5kYXRhWzJdKVxuICAgIHdoZW4gJ3N0YXJ0JyAgICAgICAgICB0aGVuIHN0YXJ0KClcbiAgICB3aGVuICdzdG9wJyAgICAgICAgICAgdGhlbiBzdG9wKClcbiAgICB3aGVuICdzZW5kSW1hZ2VEYXRhJyAgdGhlbiBzZW5kSW1hZ2VEYXRhKClcbiAgICB3aGVuICdzZW5kVFBTJyAgICAgICAgdGhlbiBzZW5kVFBTKClcbiAgICB3aGVuICd1cGRhdGVWYXJpYWJsZScgdGhlbiB1cGRhdGVWYXJpYWJsZShlLmRhdGFbMV0sIGUuZGF0YVsyXSwgZS5kYXRhWzNdKVxuICAgIHdoZW4gJ2dldFZhcmlhYmxlcycgICB0aGVuIGdldFZhcmlhYmxlcygpXG4gICAgZWxzZSBjb25zb2xlLmVycm9yIFwiVW5rbm93biBDb21tYW5kICN7ZS5kYXRhWzBdfVwiXG5cbiJdfQ==
