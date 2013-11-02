// Generated by CoffeeScript 1.6.3
(function() {
  var Q;

  Array.prototype.x = function() {
    return this[0];
  };

  Array.prototype.y = function() {
    return this[1];
  };

  Quintus.Math = function(Q) {
    Q.normalizeAngle = function(angle) {
      var result;
      result = angle % 360;
      if (result < 0) {
        return result + 360;
      } else {
        return result;
      }
    };
    Q.angle = function(fromX, fromY, toX, toY) {
      var distX, distY, radians;
      distX = toX - fromX;
      distY = toY - fromY;
      radians = Math.atan2(distY, distX);
      return Q.normalizeAngle(Q.radiansToDegrees(radians));
    };
    Q.distance = function(fromX, fromY, toX, toY) {
      if (toX == null) {
        toX = 0;
      }
      if (toY == null) {
        toY = 0;
      }
      return Math.sqrt(Math.pow(fromX - toX, 2) + Math.pow(fromY - toY, 2));
    };
    Q.offsetX = function(angle, radius) {
      return Math.sin(angle / 180 * Math.PI) * radius;
    };
    Q.offsetY = function(angle, radius) {
      return -Math.cos(angle / 180 * Math.PI) * radius;
    };
    Q.degreesToRadians = function(degrees) {
      return degrees * (Math.PI / 180);
    };
    return Q.radiansToDegrees = function(radians) {
      return radians * (180 / Math.PI);
    };
  };

  Quintus.Util = function(Q) {
    return Q.center = function() {
      return {
        x: Q.width / 2,
        y: Q.height / 2
      };
    };
  };

  Q = Quintus().include('Util, Math, Sprites, Scenes, Input, 2D, Touch, UI, Audio').setup({
    development: true,
    width: 640,
    height: 480
  }).controls().touch().enableSound();

  Q.gravityY = 0;

  Q.gravityX = 0;

  Q.clearColor = "#000";

  Q.load(['ship.png', 'enemy.png', 'particle.png', 'background.png', 'star.png', 'menu.mp3', 'blasterShot.mp3'], function() {
    return Q.stageScene('Menu');
  }, {
    progressCallback: function(loaded, total) {
      var percent_loaded;
      percent_loaded = Math.floor(loaded / total * 100);
      return document.getElementById('loading_progress').style.width = percent_loaded + '%';
    }
  });

  window.Q = Q;

  document.addEventListener("click", function() {
    var e;
    e = document.getElementById("quintus");
    if (e.webkitRequestFullScreen) {
      return e.webkitRequestFullScreen();
    }
  });

  Q.scene('Game', function(stage) {
    var player, _i, _ref;
    player = new Q.Player({
      x: Q.center().x,
      y: Q.center().y
    });
    stage.insert(new Q.Background({
      target: player
    }));
    for (_i = 1, _ref = Q.width * Q.height / 10000; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      stage.insert(new Q.Star({
        target: player
      }));
    }
    stage.insert(new Q.Enemy({
      x: player.p.x,
      y: player.p.y
    }));
    stage.insert(player);
    stage.on('destroy', function() {
      return player.destroy;
    });
    stage.add('viewport');
    return stage.follow(player, {
      x: true,
      y: true
    });
  });

  Q.scene('Menu', function(stage) {
    var color, x, _i, _ref;
    color = 'white';
    x = Q.width * (3 / 4);
    stage.insert(new Q.Background({
      target: null
    }));
    for (_i = 1, _ref = Q.width * Q.height / 10000; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      stage.insert(new Q.MenuStar);
    }
    stage.insert(new Q.UI.Text({
      label: 'Nebula',
      x: x,
      y: Q.height / 4,
      color: color,
      family: 'ui',
      size: 56
    }));
    stage.insert(new Q.UI.Button({
      label: 'New Game',
      x: x,
      y: Q.height / 2,
      fontColor: color,
      font: '400 24px ui'
    }, function() {
      return Q.stageScene('Game');
    }));
    return stage.insert(new Q.UI.Button({
      label: 'Quit',
      x: x,
      y: Q.height / (4 / 3),
      fontColor: color,
      font: '400 24px ui'
    }, function() {
      Q.audio.stop;
      return Q.stageScene(null);
    }));
  });

  Q.Sprite.extend('Ship', {
    init: function(p) {
      this._super(Q._extend({
        type: Q.SPRITE_DEFAULT,
        collisionMask: Q.SPRITE_ACTIVE
      }, p));
      return this.add('2d');
    },
    fire: function() {
      return this.weapon.tryFire(this);
    },
    accelerate: function(dt) {
      var vx, vy;
      vx = this.p.vx;
      vy = this.p.vy;
      this.p.vx += Q.offsetX(this.p.angle, Q[this.className].acceleration) * dt;
      this.p.vy += Q.offsetY(this.p.angle, Q[this.className].acceleration) * dt;
      if (Q.distance(this.p.vx, this.p.vy) > 500) {
        this.p.vx = vx;
        this.p.vy = vy;
      }
      return this.stage.insert(new Q.Particle({
        x: this.p.x - Q.offsetX(this.p.angle, this.p.cx),
        y: this.p.y - Q.offsetY(this.p.angle, this.p.cy),
        vx: this.p.vx - Q.offsetX(this.p.angle, Math.max(this.p.vx * 0.1, 75)),
        vy: this.p.vy - Q.offsetY(this.p.angle, Math.max(this.p.vy * 0.1, 75))
      }));
    },
    turn: function(dt, degree) {
      return this.p.angle += degree * dt;
    },
    friction: function(dt) {
      this.p.vx *= 1 - dt;
      return this.p.vy *= 1 - dt;
    }
  });

  Q.Weapon = Q.Class.extend("Weapon", {
    init: function() {
      return this.lastFired = 0;
    },
    tryFire: function(from) {
      var now;
      now = new Date().getTime();
      if (now > this.lastFired + Q[this.className].coolDown) {
        this.fire(from);
        return this.lastFired = now;
      }
    }
  });

  Q.Sprite.extend('Background', {
    init: function(p) {
      return this._super(p, {
        target: p.target,
        x: 0,
        y: 0,
        asset: 'background.png',
        type: Q.SPRITE_NONE
      });
    },
    drawOffset: 200,
    debugRender: function() {},
    draw: function(ctx) {
      var offsetX, offsetY;
      if (this.stage.viewport) {
        offsetX = this.stage.viewport.centerX - Q.width / 2;
        offsetY = this.stage.viewport.centerY - Q.height / 2;
      } else {
        offsetX = 0;
        offsetY = 0;
      }
      if (this.p.target) {
        offsetX += -this.p.target.p.vx / 10;
        offsetY += -this.p.target.p.vy / 10;
      }
      return ctx.drawImage(this.asset(), 0, 0, this.asset().width, this.asset().height, offsetX - this.drawOffset, offsetY - this.drawOffset, Q.width + this.drawOffset * 2, Q.height + this.drawOffset * 2);
    }
  });

  Q.Weapon.extend("Blaster", {
    fire: function(from) {
      var accuracy, angle, velocity;
      velocity = Q[this.className].velocity;
      accuracy = Math.floor((Math.random() * 5) - 5);
      angle = from.p.angle + accuracy;
      from.stage.insert(new Q.BlasterShot({
        x: from.p.x + Q.offsetX(from.p.angle, from.p.cx * 2.5),
        y: from.p.y + Q.offsetY(from.p.angle, from.p.cy * 2.5),
        vx: from.p.vx + Q.offsetX(angle, velocity),
        vy: from.p.vy + Q.offsetY(angle, velocity),
        angle: angle
      }));
      return Q.audio.play('blasterShot.mp3');
    }
  }, {
    coolDown: 100,
    velocity: 500
  });

  Q.Sprite.extend('BlasterShot', {
    init: function(p) {
      this._super(Q._extend({
        type: Q.SPRITE_ACTIVE,
        collisionMask: Q.SPRITE_ACTIVE,
        asset: 'particle.png',
        z: 5,
        scale: 0.4
      }, p));
      this.add('2d');
      return this.on('hit', function(col) {
        return this.destroy();
      });
    }
  });

  Q.Sprite.extend('MenuStar', {
    init: function(p) {
      return this._super(p, {
        x: Math.random() * Q.width,
        y: Math.random() * Q.height,
        scale: Math.max(Math.random(), .3),
        asset: 'star.png',
        type: Q.SPRITE_NONE
      });
    },
    step: function(dt) {
      if (this.p.y > Q.height) {
        this.p.y = 0;
        this.p.x = Math.random() * Q.width;
      }
      return this.p.y += dt * Math.pow(100, this.p.scale);
    }
  });

  Q.Sprite.extend('Particle', {
    init: function(p) {
      this._super(Q._extend({
        asset: 'particle.png',
        type: Q.SPRITE_NONE,
        z: 5,
        opacity: 0.5,
        scale: 0.5
      }, p));
      return this.add('2d');
    },
    step: function(dt) {
      this.p.vx *= 1 - dt;
      this.p.vy *= 1 - dt;
      if (this.p.scale >= 0) {
        return this.p.scale -= dt;
      } else {
        return this.destroy();
      }
    },
    draw: function(ctx) {
      ctx.globalCompositeOperation = 'lighter';
      return this._super(ctx);
    }
  });

  Q.Ship.extend('Player', {
    init: function(p) {
      this._super(Q._extend({
        type: Q.SPRITE_DEFAULT,
        asset: 'ship.png'
      }, p));
      return this.weapon = new Q.Blaster;
    },
    step: function(dt) {
      if (Q.inputs['up'] || Q.inputs['action']) {
        this.accelerate(dt);
      } else {
        this.friction(dt);
      }
      if (Q.inputs['fire']) {
        this.fire();
      }
      if (Q.inputs['left']) {
        this.turn(dt, -100);
      }
      if (Q.inputs['right']) {
        return this.turn(dt, 100);
      }
    }
  }, {
    acceleration: 100
  });

  Q.Sprite.extend('Star', {
    init: function(p) {
      this._super(p, {
        target: p.target,
        x: Math.random() * Q.width,
        y: Math.random() * Q.height,
        asset: 'star.png',
        scale: Math.max(Math.random(), .3),
        type: Q.SPRITE_NONE
      });
      return this.add('2d');
    },
    step: function(dt) {
      this.p.vx = this.p.target.p.vx * (Math.pow(this.p.scale, 10) / -1);
      this.p.vy = this.p.target.p.vy * (Math.pow(this.p.scale, 10) / -1);
      if (Math.abs(this.p.x - this.p.target.p.x) > Q.width || Math.abs(this.p.y - this.p.target.p.y) > Q.height) {
        this.p.x = Q.stage().viewport.x + (Math.random() * Q.width);
        return this.p.y = Q.stage().viewport.y + (Math.random() * Q.height);
      }
    }
  });

  Q.component('aiWander', {
    added: function() {
      return this.entity.on("step", this, "step");
    },
    step: function(dt) {
      var targetAngle, velocityAngle;
      if (!this.targetX || !this.targetY || 50 > Q.distance(this.entity.p.x, this.entity.p.y, this.targetX, this.targetY)) {
        this.targetX = Math.random() * 1000;
        this.targetY = Math.random() * 1000;
      }
      targetAngle = 90 + Q.angle(this.entity.p.x, this.entity.p.y, this.targetX, this.targetY);
      if (this.entity.p.angle - targetAngle > 0) {
        this.entity.turn(dt, -100);
      } else {
        this.entity.turn(dt, 100);
      }
      velocityAngle = 90 + Q.angle(this.entity.p.vx, this.entity.p.vy);
      return this.entity.accelerate(dt);
    }
  });

  Q.Ship.extend('Enemy', {
    init: function(p) {
      this._super(Q._extend({
        type: Q.SPRITE_DEFAULT | Q.SPRITE_ENEMY,
        collisionMask: Q.SPRITE_ACTIVE,
        asset: 'enemy.png'
      }, p));
      return this.add('aiWander');
    }
  }, {
    acceleration: 50
  });

}).call(this);
