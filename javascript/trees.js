var gamejs = require('gamejs');
var objects = require('gamejs/utils/objects');
var physics = require('./gramework/physics');
var Actor = require('./gramework/actors').Actor;

var defaultMapping = {
    'LEFT': gamejs.event.K_LEFT,
    'RIGHT': gamejs.event.K_RIGHT,
    'UP': gamejs.event.K_UP,
    'DOWN': gamejs.event.K_DOWN,
    'BUTTON1': gamejs.event.K_p,
    'BUTTON2': gamejs.event.K_l
};

var Branch = exports.Branch = function(options) {

    this.id = options.id || 0;
    this.num_segments = options.segments || 0;
    this.segment_length = options.segment_length || 3;
    this.ave_angle = options.ave_angle || 0;

    Branch.superConstructor.apply(this, arguments);

    return this;
};
objects.extend(Branch, Actor);

Branch.prototype.init = function(options) {
    this.scale = options.scale || 10;
    this.trunk = options.trunk || null;
    this.parent = this.trunk || options.parent || null;

    this.height = options.height;
    this.width = options.width;
    this.angle = options.angle * (Math.PI / 180) || 0;

    if (this.parent.absAngle != undefined){
        this.parentAbs = this.parent.absAngle;
    } else {
        this.parentAbs = 0;
    }

    if (this.trunk && options.side == 'left') {
        this.angle -= Math.PI / 2;
    } else if (this.trunk && options.side == 'right') {
        this.angle += Math.PI / 2;
    }

    this.absAngle = this.parentAbs + this.angle;
    this.density = options.density || 2;

    this.x = this.parent.x + (this.width * Math.cos(this.absAngle)) + (this.parent.width * Math.cos(this.parentAbs));
    this.y = this.parent.y + (this.width * Math.sin(this.absAngle)) +(this.parent.width * Math.sin(this.parentAbs));

    this.rect = new gamejs.Rect([(this.x - this.width) * this.scale, (this.y - this.height) * this.scale], [(this.width * 2) * this.scale, (this.height * 2) * this.scale]);
    this.realRect = new gamejs.Rect(this.rect);
    //this.collisionRect = new gamejs.Rect([this.rect.left+1, this.rect.top+1],[this.rect.width-2, this.rect.height-2]);

    //this.spriteSheet = new SpriteSheet(options.spriteSheet[0], options.spriteSheet[1]) || null;
    this.physics = options.physics || null;

    if (this.physics) {
        this.body = new physics.Body(this.physics, {
            type: options.type || 'dynamic',
            x: this.x,
            y: this.y,
            height: this.height,
            width: this.width,
            angle: this.absAngle,
            density: this.density,
            kind: 'branch'
        });
    }
    
    var joint_opts = {
        bodyA: this.parent.body.body,
        bodyB: this.body.body,
        x: this.x - (this.width * Math.cos(this.absAngle)),
        y: this.y - (this.width * Math.sin(this.absAngle)),
        //homeAngle: Math.floor(Math.random() * 60) - 30
        //homeAngle: this.angle * (180 / Math.PI)
        homeAngle: 0
    };
    this.joint = new physics.Joint(this.physics, joint_opts);
    return;
};

Branch.prototype.getSurface = function(side, height) {
    var coords;
    var x = (this.y + this.width) * Math.sin(this.angle);
    return coords;
};

Branch.prototype.update = function(msDuration) {
    Actor.prototype.update.call(this, msDuration);
    this.joint.update(msDuration);
    return;
};

var Animal = exports.Animal = function(options) {
    Animal.superConstructor.apply(this, arguments);
    return this;
};
objects.extend(Animal, Actor);

Animal.prototype.handleEvent = function(event) {
    if (event.type === gamejs.event.KEY_DOWN) {
        if (event.key === defaultMapping['RIGHT']) {
            this.body.body.ApplyImpulse({x:3, y:0}, this.body.body.GetWorldCenter())
        }
        if (event.key === defaultMapping['LEFT']) {
            this.body.body.ApplyImpulse({x:-3, y:0}, this.body.body.GetWorldCenter())
        }
        if (event.key === defaultMapping['UP']) {
            this.body.body.ApplyImpulse({x:0, y:-200}, this.body.body.GetWorldCenter())
        }
    } else if (event.type === gamejs.event.KEY_UP) {
    }
    return;
};

