var gamejs = require('gamejs');
var Sprite = require('gamejs/sprite').Sprite;
var draw = require('gamejs/draw');
var objects = require('gamejs/utils/objects');
var config = require('../config');
var SpriteSheet = require('./animate').SpriteSheet;
var Animation = require('./animate').Animation;

var Body = require('./physics').Body;
var MapManager = require('./maps').MapManager;

var DEFAULT_CONTROL_MAPPING = {
    up: gamejs.event.K_UP,
    down: gamejs.event.K_DOWN,
    left: gamejs.event.K_LEFT,
    right: gamejs.event.K_RIGHT
};

var DEFAULT_ANIMATIONS = {
    'static': [0]
};

var Actor = exports.Actor = function(options) {
    /*
    Actor options
    x: the x position of the actor's centre - required
    y: the y position of the actor's centre - required
    width: half the width of the actor's rectangle (from centre to right or left edge) - required
    height: half the height of the actor's rectangle (from centre to top or bottom edge) - required
    */
    Actor.superConstructor.apply(this, arguments);
    this.init(options);
    return this;
};
objects.extend(Actor, Sprite);

Actor.prototype.init = function(options) {
    this.scale = options.scale || 1;
    this.x = options.x;
    this.y = options.y;
    this.height = options.height;
    this.width = options.width;
    this.startingAnimation = options.startingAnimation || 'static';

    // Starting positions can be customized.
    // No start provided? Set defaults for currentMap. We assume there is only a
    // single map in this case.
    var start = (options.start || {
        map: 0
    });

    this.currentMapIndex = start.map;
    this.currentMap = MapManager.getById(start.map);

    this.rect = new gamejs.Rect(
        [(this.x - this.width) * this.scale, (this.y - this.height) * this.scale],
        [this.width * 2 * this.scale, this.height * 2 * this.scale]
    );

    this.realRect = new gamejs.Rect(this.rect);
    this.collisionRect = new gamejs.Rect(
        [this.rect.left+1, this.rect.top+1],
        [this.rect.width-2, this.rect.height-2]
    );

    if (options.spriteSheet) {
        this.spriteSheet = new SpriteSheet(options.spriteSheet[0], options.spriteSheet[1]) || null;
        var animations = options.animations || DEFAULT_ANIMATIONS;
        this.animation = new Animation(this.spriteSheet, animations);
        this.animation.start(this.startingAnimation);
    }
    this.physics = options.physics || null;

    if (this.currentMap.spawnPlayers.length > 0) {
        this.spawnAtMapOrigin();
    }

    if (this.physics) {
        this.angle = options.angle * (Math.PI / 180) || 0;
        this.density = options.density || 2;
        this.body = new Body(this.physics, {
            type: options.type || 'dynamic',
            x: this.x,
            y: this.y,
            height: this.height,
            width: this.width,
            angle: this.angle,
            density: this.density,
            fixedRotation: options.fixedRotation || false
        });
    }

    return;
};


// Spawn at the current maps origin.
Actor.prototype.spawnAtMapOrigin = function() {
    return;
};

Actor.prototype.update = function(msDuration) {
    
    if (this.physics) {
        this.realRect.center = [this.body.body.GetPosition().x * this.scale, this.body.body.GetPosition().y * this.scale];
    }

    this.rect.top = Math.round(this.realRect.top) + 0.5;
    this.rect.left = Math.round(this.realRect.left) + 0.5;
    
    if (this.animation) {
        this.animation.update(msDuration);
        this.image = this.animation.image;
    }
    return;
};

Actor.prototype.handleEvent = function(event) {
    return;
};

Actor.prototype.draw = function(display) {
    //cq(this.image._canvas).matchPalette(palettes.simple);
    
    if (this.spriteSheet) {
        if (this.image) {
            gamejs.sprite.Sprite.prototype.draw.apply(this, arguments);
        };
    } else {
        //draw.rect(display, "#000FFF", new gamejs.Rect(this.pos, [5,5]));
    }
    
    if (config.DEBUG) {
        var color = "#000FFF";
        if (!this._inControl) {
            var color = "#555000";
        }
        draw.rect(display, color, this.rect, 1);
    }
    return;
};

var FourDirection = exports.FourDirection = function(options) {
    FourDirection.superConstructor.apply(this, arguments);
};
objects.extend(FourDirection, Actor);

FourDirection.prototype.init = function(options) {
    Actor.prototype.init.apply(this, arguments);

    this.xSpeed = 0;
    this.ySpeed = 0;

    this.xMaxSpeed = options.xMaxSpeed || 2;
    this.yMaxSpeed = options.yMaxSpeed || 2;

    this.accel = options.accel || 0.1;
    this.decel = options.decel || 0.2;

    this.movingDown = false;
    this.movingUp = false;
    this.movingRight = false;
    this.movingLeft = false;

    //Define rectangles to detect collisions on each side
    this.collisionTop = new gamejs.Rect(
        [this.rect.left + 2, this.rect.top - 4],
        [this.rect.width - 4, 4]);
    this.collisionLeft = new gamejs.Rect(
        [this.rect.left - 4, this.rect.top + 2],
        [4, this.rect.height - 4]);
    this.collisionRight = new gamejs.Rect(
        [this.rect.right, this.rect.top + 2],
        [4, this.rect.height - 4]);
    this.collisionBottom = new gamejs.Rect(
        [this.rect.left + 2, this.rect.bottom],
        [this.rect.width - 4, 4]);

    this.collisionRects = [
        {key: 'bottom', rect: this.collisionBottom},
        {key: 'right', rect: this.collisionRight},
        {key: 'left', rect: this.collisionLeft},
        {key: 'top', rect: this.collisionTop}
    ];

    this.controlMapping = options.controlMapping || DEFAULT_CONTROL_MAPPING;
    return;
};

FourDirection.prototype.update = function(msDuration, collisionCallback) {
    if (this.movingDown) {
        this.ySpeed += this.accel;
    } else if (this.ySpeed > 0) {
        this.ySpeed -= this.decel;
    }
    if (this.movingUp) {
        this.ySpeed -= this.accel;
    } else if (this.ySpeed < 0) {
        this.ySpeed += this.decel;
    }
    if (this.movingLeft) {
        this.xSpeed -= this.accel;
    } else if (this.xSpeed < 0) {
        this.xSpeed += this.decel;
    }
    if (this.movingRight) {
        this.xSpeed += this.accel;
    } else if (this.xSpeed > 0) {
        this.xSpeed -= this.decel;
    }

    if (!this.movingRight && !this.movingLeft && Math.abs(this.xSpeed) < this.decel) {
        this.xSpeed = 0;
    }
    if (!this.movingUp && !this.movingDown && Math.abs(this.ySpeed) < this.decel) {
        this.ySpeed = 0;
    }
    //make sure you're not moving faster than you can
    if (this.xSpeed > this.xMaxSpeed) {
        this.xSpeed = this.xMaxSpeed;
    } else if (this.xSpeed < -this.xMaxSpeed) {
        this.xSpeed = -this.xMaxSpeed;
    }

    if (this.ySpeed > this.yMaxSpeed) {
        this.ySpeed = this.yMaxSpeed;
    } else if (this.ySpeed < -this.yMaxSpeed) {
        this.ySpeed = -this.yMaxSpeed;
    }

    collisionCallback(this);

    this.realRect.left += this.xSpeed;
    this.realRect.top += this.ySpeed;

    this.collisionTop.top = this.rect.top - 4;
    this.collisionTop.left = this.rect.left + 2;
    this.collisionLeft.left = this.rect.left - 4;
    this.collisionLeft.top = this.rect.top + 2;
    this.collisionRight.left = this.rect.right;
    this.collisionRight.top = this.rect.top + 2;
    this.collisionBottom.left = this.rect.left + 2;
    this.collisionBottom.top = this.rect.bottom;

    Actor.prototype.update.apply(this, arguments);
    return;
};

// Called on each tick. Check against another spritEGroup to see if this
// actor is colliding with anything within that one. Custom functionality
// to test against the actors 4 collision rects.
FourDirection.prototype.updateCollisions = function(spriteGroup) {
    var actor = this;
    var tiles = gamejs.sprite.spriteCollide(actor, spriteGroup);

    var collisions = _.reduce(tiles, function(result, tile) {
        // An actor has collision rects. For each rect, we want to check if a
        // tile is colliding with it.
        for (var i = 0; i < actor.collisionRects.length; i ++) {
            var obj = actor.collisionRects[i];
            if (tile.rect.collideRect(obj.rect)) {
                result[obj.key] = tile;
            }
        }
        return result;
    }, {});

    if (Object.keys(collisions).length > 0) {
        return this.doCollisions(collisions);
    }
    return;
};

// Hook for subclasses to use. Given an object containing the sprites that this
// actor is colliding with.
FourDirection.prototype.doCollisions = function(collisions) {
    return;
};

// Teleport actor from one location to another! Requires `tile`, the
// tile causing the teleport.
FourDirection.prototype.doTeleport = function(tile) {
    if (tile.properties.teleportPlayer === 'next') {
        // Update players current map index.
        this.currentMapIndex += 1;
        this.currentMap = MapManager.getById(this.currentMapIndex);
        this.spawnAtMapOrigin();
    }
};

// Collision callback functions. The `tile` that this occured 
// against is passed.
FourDirection.prototype._hitWall = function(tile, direction) {
    if (direction === 'bottom' && this.ySpeed > 0) {
        this.ySpeed = 0;
    } else if (direction === 'top' && this.ySpeed < 0) {
        this.ySpeed = 0;
    } else if (direction === 'left' && this.xSpeed < 0) {
        this.xSpeed = 0;
    } else if (direction === 'right' && this.xSpeed > 0) {
        this.xSpeed = 0;
    }
    return;
};

FourDirection.prototype.draw = function(display) {
    Actor.prototype.draw.apply(this, arguments);
    if (config.DEBUG) {
        draw.rect(display, "#000", this.collisionTop, 1);
        draw.rect(display, "#000", this.collisionLeft, 1);
        draw.rect(display, "#000", this.collisionRight, 1);
        draw.rect(display, "#000", this.collisionBottom, 1);
        //draw.rect(display, "#000", this.collisionRect, 1);
    }
    return;
};

FourDirection.prototype.handleEvent = function(event) {
    if (event.type == gamejs.event.KEY_DOWN) {
        gamejs.log("Move player", event);
        if (event.key == this.controlMapping['down']) {
            this.movingDown = true;
        }
        if (event.key == this.controlMapping['up']) {
            this.movingUp = true;
        }
        if (event.key == this.controlMapping['left']) {
            this.movingLeft = true;
        }
        if (event.key == this.controlMapping['right']) {
            this.movingRight = true;
        }
    }
    if (event.type == gamejs.event.KEY_UP) {
        gamejs.log("Stop moving player", event);
        if (event.key == this.controlMapping['down']) {
            this.movingDown = false;
        }
        if (event.key == this.controlMapping['up']) {
            this.movingUp = false;
        }
        if (event.key == this.controlMapping['left']) {
            this.movingLeft = false;
        }
        if (event.key == this.controlMapping['right']) {
            this.movingRight = false;
        }
    }
    return;
};

var Button = exports.Button = function(options) {
    Button.superConstructor.apply(this, arguments);
    //toggle state
    this.state = 0;
    this.canToggle = true;
    this.centerCollisionRect = new gamejs.Rect(
        [this.rect.left, this.rect.top],
        [
            this.rect.width - (this.rect.width / 2),
            this.rect.height - (this.rect.height / 2)
        ]
    );
    return this;
};
objects.extend(Button, Actor);

Button.prototype.setState = function(wallState) {
    if (wallState == 0){
        this.state = 0;
    } else {
        this.state = 1;
    }
    return;
};

Button.prototype.update = function(msDuration) {
    Actor.prototype.update.apply(this, arguments);
    if (this.state == 1 && this.animation.currentAnimation == 'open') {
        this.animation.start('closed');
    } else if (this.state == 0 && this.animation.currentAnimation == 'closed') {
        this.animation.start('open');
    }
    return;
};

var Gate = exports.Gate = function(options) {
    Gate.superConstructor.apply(this, arguments);
    this.type = options.type || 0;
    this.block = true;
    return this;
};
objects.extend(Gate, Actor);

Gate.prototype.setState = function(wallState) {
    if ((this.type == 0 && wallState == 0) || (this.type == 1 && wallState == 1) ) {
        this.block = true;
    } else if ((this.type == 0 && wallState == 1) || (this.type == 1 && wallState == 0)) {
        this.block = false;
    }
    return;
};

Gate.prototype.update = function(msDuration) {
    Actor.prototype.update.apply(this, arguments);
    if (this.block && this.animation.currentAnimation == 'open') {
        this.animation.start('closed');
    } else if (!this.block && this.animation.currentAnimation == 'closed') {
        this.animation.start('open');
    }
    return;
};
