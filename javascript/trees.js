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

    this.height = options.height || this.parent.height * 0.9;
    this.width = options.width;
    this.angle = options.angle * (Math.PI / 180) || 0;

    this.segment_prob = options.segment_prob || 1;
    this.sub_branch_prob = options.sub_branch_prob || 0.5;

    if (this.parent.absAngle != undefined){
        this.parentAbs = this.parent.absAngle;
    } else {
        this.parentAbs = this.parent.angle;
    }

    this.absAngle = this.parentAbs + this.angle;
    this.density = options.density || this.parent.density * 0.5 || 2;

    if (this.trunk && options.side == 'left') {
        this.angle -= Math.PI / 2;
        this.absAngle -= Math.PI / 2
        this.x = this.parent.x + (this.width * Math.cos(this.absAngle)) + (this.parent.height * Math.sin(this.parentAbs));
        this.y = this.parent.y + (this.width * Math.sin(this.absAngle)) + (this.parent.height * Math.cos(this.parentAbs));
    } else if (this.trunk && options.side == 'right') {
        this.angle += Math.PI / 2;
        this.absAngle += Math.PI / 2;
        this.x = this.parent.x + (this.width * Math.cos(this.absAngle)) + (this.parent.height * Math.sin(this.parentAbs));
        this.y = this.parent.y + (this.width * Math.sin(this.absAngle)) + (this.parent.height * Math.cos(this.parentAbs));
    } else {
        this.x = this.parent.x + (this.width * Math.cos(this.absAngle)) + (this.parent.width * Math.cos(this.parentAbs));
        this.y = this.parent.y + (this.width * Math.sin(this.absAngle)) + (this.parent.width * Math.sin(this.parentAbs));
    }

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
        homeAngle: 0
    };
    this.joint = new physics.Joint(this.physics, joint_opts);

    delete options.height;
    delete options.density;
    delete options.trunk;
    options.segment_prob = this.segment_prob * 0.97;
    options.sub_branch_prob = this.sub_branch_prob * 0.95;
    options.density = this.density * 0.4;
    options.angle = Math.floor(Math.random() * 40) - 20;

    var rand = Math.random();
    if (rand <= this.segment_prob) {
        options.parent = this;
        this.child = new Branch(options);
    }
    rand = Math.random();
    if (rand <= this.sub_branch_prob) {
        options.trunk = this;
        options.width = this.width * 0.7;
        options.height = this.height * 0.5;
        options.density = this.density * 0.7;
        options.sub_branch_prob = this.sub_branch_prob * 0.7;
        options.segment_prob = this.segment_prob * 0.7;
        if (Math.random() > 0.5) { options.side = 'left' }
        else { options.side = 'right' }
        this.sub_branch = new Branch(options);
    }

    return;
};

Branch.prototype.getChildren = function() {
    var children = [];
    if (this.child) {
        children.push(this.child);
        children = children.concat(this.child.getChildren());
    }
    if (this.sub_branch) {
        children.push(this.sub_branch);
        children = children.concat(this.sub_branch.getChildren());
    }
    return children;
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

var Tree = exports.Tree = function(options) {
    this.x = options.x;
    this.y = options.y;

    this.physics = options.physics;

    this.num_branches = options.num_branches || 2;
    this.branch_length = options.branch_length || 5;

    this.branches = [];

    this.stump = new Actor({
        physics: this.physics,
        type: 'static',
        x: this.x,
        y: this.y,
        height: 1,
        width: 3,
        angle: -90,
        density: 50
    });

    for (var i=0; i < this.num_branches; i++) {
        var branch_opts = {
            physics: this.physics,
            parent: this.stump,
            width: 2,
            height: this.height * 0.75,
            angle: Math.floor(Math.random() * 30) - 15
        };
        var branch = new Branch(branch_opts);
        this.branches.push(branch);
        this.branches = this.branches.concat(branch.getChildren());
    }

    return;
};

Tree.prototype.getBranches = function() {
    return this.branches;
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

