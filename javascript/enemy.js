var gamejs = require('gamejs'),
        Actor = require('./gramework/actors').Actor,
        objects = require('gamejs/utils/objects'),
        config = require('./config');
var Body = require('./gramework/physics').Body;
var targetPlayer = null;

var robFord = {
    x: 320,
    y: 24,
    width: 24,
    height: 24,
    spriteSheet: [
        config.ford_img, {width:48, height:48}
    ],
    animations: {'static':[0, 1]},
    controlMapping: {
        down: null,
        left: null,
        right: null,
        up: null
    },
    // Have a default start point if the map provides nothing.
    start: {
        x: 300,
        y: 24,
        map: 0
    }
};

var smokeCloud = {
    x: 800,
    y: 500,
    width : 32,
    height : 32,
    spritesheet: [
        config.smoke_cloud, {width:32, height:32}
    ],
    animations: {'static':[0,1]},
    controlMapping: {
        down: null,
        left: null,
        right: null,
        up: null
    },
    start: {
        x:500,
        y:500,
        map:0
    }
};


var Enemy = function(options) {
    Enemy.superConstructor.apply(this, arguments);
    this.isRobFord = true;
    this.startX = this.x;
    this.startY = this.y;
};
objects.extend(Enemy, Actor);

Enemy.prototype.doCollisions = function(collisions) {
    var actor = this;
    _.each(collisions, function(tile, key) {
        if (tile.block === true) {
            actor._hitWall(tile, key);
        }
    });
};

Enemy.prototype.doMove = function(targetX, targetY) {
    var xDelta;
    var yDelta;
    targetX = targetX - (this.width);
    targetY = targetY - (this.height);

    // Move towards target. Stop after awhile, sometimes.
    if ((Math.abs(this.realRect.left - targetX) > 1) && (Math.abs(this.realRect.top - targetX) > 1)) {

        xDelta = targetX - this.realRect.left;
        yDelta = targetY - this.realRect.top;

        var vectorLength = Math.sqrt(Math.abs((yDelta*yDelta)+(xDelta*xDelta)));

        var unitX = xDelta / vectorLength;
        var unitY = yDelta / vectorLength;

        this.realRect.left = this.realRect.left + unitX; //times speed?
        this.realRect.top = this.realRect.top + unitY; //times speed?
    }
};

Enemy.prototype.setTarget = function(target) {
    this.targetPlayer = target;
};

Enemy.prototype.setPosition = function(x, y) {
    gamejs.log("setPosition", x, y);
    this.realRect.left = x - this.width;
    this.realRect.top = y - this.height;
};

Enemy.prototype.update = function(msDuration) {
    Actor.prototype.update.apply(this, arguments);
    if (this.targetPlayer) {
        window.setTimeout(this.doMove(this.targetPlayer.rect.center[0], this.targetPlayer.rect.center[1]),1000);
    }
};

var initialize = function() {
    return new Enemy(robFord);
};

exports.initialize = initialize;
