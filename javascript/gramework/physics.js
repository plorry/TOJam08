var Box2D = require('../Box2dWeb-2.1.a.3');

  var b2Vec2 = Box2D.b2Vec2;
  var b2BodyDef = Box2D.b2BodyDef;
  var b2Body = Box2D.b2Body;
  var b2FixtureDef = Box2D.b2FixtureDef;
  var b2Fixture = Box2D.b2Fixture;
  var b2World = Box2D.b2World;
  var b2MassData = Box2D.b2MassData;
  var b2PolygonShape = Box2D.b2PolygonShape;
  var b2CircleShape = Box2D.b2CircleShape;
  var b2DebugDraw = Box2D.b2DebugDraw;
  var b2RevoluteJointDef = Box2D.b2RevoluteJointDef;

  BRANCH_CATEGORY = 0x0002;
  OBJECT_CATEGORY = 0x0001;

  BRANCH_MASK = OBJECT_CATEGORY;
  BRANCH_OBJECT = BRANCH_CATEGORY;

  var Physics = exports.Physics = function(element,scale) {
    var gravity = new b2Vec2(0,9.8);
    this.world = new b2World(gravity, true);
    this.context = element.getContext("2d");
    this.scale = scale || 20;
    this.dtRemaining = 0;
    this.stepAmount = 1/60;
  };

  Physics.prototype.debug = function() {
    this.debugDraw = new b2DebugDraw();
    this.debugDraw.SetSprite(this.context);
    this.debugDraw.SetDrawScale(this.scale);
    this.debugDraw.SetFillAlpha(0.3);
    this.debugDraw.SetLineThickness(1.0);
    this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(this.debugDraw);
  };

  Physics.prototype.step = function(dt) {
    this.dtRemaining += dt;
    while(this.dtRemaining > this.stepAmount) {
      this.dtRemaining -= this.stepAmount;
      this.world.Step(this.stepAmount, 
                      100, // velocity iterations
                      100);// position iterations
    }
    if(this.debugDraw) {
      this.world.DrawDebugData();
    }
  }


  var Body = exports.Body = function(physics,details) {
    this.details = details = details || {};

    // Create the definition
    this.definition = new b2BodyDef();

    // Set up the definition
    for(var k in this.definitionDefaults) {
      this.definition[k] = details[k] || this.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    //this.definition.linearDamping = 10;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody :
                                                      b2Body.b2_dynamicBody;
    this.definition.angle = details.angle || 0;
    this.kind = details.kind;

    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for(var l in this.fixtureDefaults) {
      this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }

    if (this.kind == 'branch') {
      this.definition.angularDamping = 100;
      this.fixtureDef.filter.groupIndex = -1;
      this.orientation = this.details.orientation || 'h';
    }
    // Create the Body
    this.body = physics.world.CreateBody(this.definition);

    details.shape = details.shape || this.defaults.shape;

    switch(details.shape) {
      case "circle":
        details.radius = details.radius || this.defaults.radius;
        this.fixtureDef.shape = new b2CircleShape(details.radius);
        break;
      case "polygon":
        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsArray(details.points,details.points.length);
        break;
      case "block":
      default:
        details.width = details.width || this.defaults.width;
        details.height = details.height || this.defaults.height;
        this.width = details.width;
        this.height = details.height;

        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsBox(details.width,
                                       details.height);
        break;
    }

    this.body.CreateFixture(this.fixtureDef);
  };

  Body.prototype.update = function(dt) {    

  };

  Body.prototype.defaults = {
    shape: "block",
    width: 2,
    height: 2,
    radius: 1
  };

  Body.prototype.fixtureDefaults = {
    density: 2,
    friction: 1,
    restitution: 0.2
  };

  Body.prototype.definitionDefaults = {
    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: false
  };

  var Joint = exports.Joint = function(physics, details) {
    this.details = details = details || {};
    this.definition = new b2RevoluteJointDef();

    this.bodyA = details.bodyA;
    this.bodyB = details.bodyB;

    this.branchNo = 1;

    this.x = details.x;
    this.y = details.y;

    this.homeAngle = details.homeAngle || 0;

    this.definition.Initialize(
      this.bodyA,
      this.bodyB,
      { x: this.x, y: this.y }
    );

    this.definition.enableMotor = true;

    this.joint = physics.world.CreateJoint(this.definition);
  };

  Joint.prototype.getAngle = function() {
    var angle = this.joint.GetJointAngle() * 180 / Math.PI;
    return angle;
  };

  Joint.prototype.update = function(dt) {
    this.joint.SetMaxMotorTorque(
      (this.getAngle() - this.homeAngle) * (-10) * this.bodyB.GetMass()
    );
    this.joint.SetMotorSpeed(
      1000
      //Math.abs((this.getAngle() - this.homeAngle) * (70 / this.branchNo))
    );
    /*
    if (this.getAngle() > (100 / Math.sqrt(this.bodyB.GetMass()))){
      var index = allJoints.indexOf(this);
      allJoints.splice(index, 1);
      physics.world.DestroyJoint(this.joint);
    }*/
  };

  var Branch = exports.Branch = function(trunk, height, side, details) {
    this.trunk = trunk;
    this.details = details = details || {};
    if (this.trunk.orientation == 'h'){
      this.orientation = 'v';
      var length_dim = 'height';
      var thickness_dim = 'width';
      var height_dim = 'y';
      var width_dim = 'x';
    } else {
      this.orientation = 'h';
      var length_dim = 'width';
      var thickness_dim = 'height';
      var height_dim = 'x';
      var width_dim = 'y';
    }

    this.num_segments = this.details.num_segments || 3;

    this[height_dim] = this.trunk[thickness_dim] * height;

  };


  var physics,
      lastFrame = new Date().getTime();

  window.gameLoop = function() {
    var tm = new Date().getTime();
    requestAnimationFrame(gameLoop);
    var dt = (tm - lastFrame) / 1000;
    if(dt > 1/15) { dt = 1/15; }

    allJoints.forEach(function(joint){
      joint.update(dt);
    });
    branches.forEach(function(branch){
      branch.update(dt);
    });    
    physics.step(dt);
    lastFrame = tm;
  };

  function init() {
    physics = window.physics = new Physics(document.getElementById("gjs-canvas"));
    physics.debug();

    branches = window.branches = new Array();

    // Create some walls
    new Body(physics, { type: "static", x: 0, y: 0, height: 25,  width: 0.5 });
    new Body(physics, { type: "static", x:51, y: 0, height: 25,  width: 0.5});
    new Body(physics, { type: "static", x: 0, y: 0, height: 0.5, width: 60 });
    new Body(physics, { type: "static", x: 0, y:25, height: 0.5, width: 60 });
    trunk = new Body(physics, {type: "static", x:22,y:20, height:5, width:1});
    branch2 = new Body(physics, {kind:'branch',x:25, y:20, height: 0.35, width:2}).body;
    branch12 = new Body(physics, {kind:'branch',x:29, y:20, height: 0.25, width:2, density: 1}).body;
    branch13 = new Body(physics, {kind:'branch',x:33, y:19.8, height: 0.15, width:2, density: 0.5}).body;
    branch14 = new Body(physics, {kind:'branch',x:33, y:20.2, height: 0.15, width:2, density: 0.5}).body;
    branch = new Branch(trunk, 0.7, 'l', {});

    ball = new Body(physics, {density:10,x:31, y: 10, height: 1, width: 1, shape:'circle'});

    allJoints = window.allJoints = new Array();

    jointDets = {
      bodyA: trunk.body,
      bodyB: branch2,
      x: 23,
      y: 20,
      homeAngle: -10
    };
    joint2 = new Joint(physics, jointDets);
    joint2.branchNo = 1;

    jointDets = {
      bodyA: branch2,
      bodyB: branch12,
      x: 27,
      y: 20
    };
    joint3 = new Joint(physics, jointDets);
    joint3.branchNo = 2;

    jointDets = {
      bodyA: branch12,
      bodyB: branch13,
      x: 31,
      y: 19.8
    };
    joint4 = new Joint(physics, jointDets);
    joint4.branchNo = 3;

    jointDets = {
      bodyA: branch12,
      bodyB: branch14,
      x: 31,
      y: 20.2,
      homeAngle: 15
    };
    joint5 = new Joint(physics, jointDets);
    joint5.branchNo = 3;

    branch3 = new Body(physics, {kind:'branch',x:25, y:16, height: 0.35, width:2}).body;
    branch32 = new Body(physics, {kind:'branch',x:29, y:16, height: 0.25, width:2, density: 1}).body;
    branch33 = new Body(physics, {kind:'branch',x:33, y:15.8, height: 0.15, width:2, density: 0.5}).body;
    branch34 = new Body(physics, {kind:'branch',x:33, y:16.2, height: 0.15, width:2, density: 0.5}).body;

    jointDets = {
      bodyA: trunk.body,
      bodyB: branch3,
      x: 23,
      y: 16,
      homeAngle: -10
    };
    jointA = new Joint(physics, jointDets);
    jointA.branchNo = 1;

    jointDets = {
      bodyA: branch3,
      bodyB: branch32,
      x: 27,
      y: 16
    };
    jointB = new Joint(physics, jointDets);
    jointB.branchNo = 2;

    jointDets = {
      bodyA: branch32,
      bodyB: branch33,
      x: 31,
      y: 15.8
    };
    jointC = new Joint(physics, jointDets);
    jointC.branchNo = 3;

    jointDets = {
      bodyA: branch32,
      bodyB: branch34,
      x: 31,
      y: 16.2,
      homeAngle: 15
    };
    jointD = new Joint(physics, jointDets);
    jointD.branchNo = 3;

    requestAnimationFrame(gameLoop);
  }

  window.addEventListener("load",init);





// Lastly, add in the `requestAnimationFrame` shim, if necessary. Does nothing 
// if `requestAnimationFrame` is already on the `window` object.
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

