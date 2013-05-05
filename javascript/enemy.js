var gamejs = require('gamejs'),
        FourDirection = require('./gramework/actors').FourDirection,
        objects = require('gamejs/utils/objects'),
        config = require('./config');

var Enemy = function(options) {
    Enemy.superConstructor.apply(this, arguments);
};
objects.extend(Enemy, FourDirection);

Enemy.prototype.doCollisions = function(collisions) {
    var actor = this;
    _.each(collisions, function(tile, key) {
        if (tile.block === true) {
            actor._hitWall(tile, key);
        }
    });
};

var robFord = {
    x: 800,
    y: 500,
    width: 48,
    height: 48,
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
        x: 500,
        y: 500,
        map: 0
    }
};

Enemy.prototype.doMove = function(targetX, targetY) {
    var xDelta;
    var yDelta;

    if ((Math.abs(this.rect.left - targetX) > 1) && (Math.abs(this.rect.top - targetX) > 1)) {

        xDelta = targetX - this.rect.left;
        yDelta = targetY - this.rect.top;

        var vectorLength = Math.sqrt(Math.abs((yDelta*yDelta)+(xDelta*xDelta)));

        var unitX = xDelta / vectorLength;
        var unitY = yDelta / vectorLength;

        this.rect.left = this.rect.left + unitX; //times speed?
        this.rect.top = this.rect.top + unitY; //times speed?
        console.log('Unit Vectors: '+unitX+' '+unitY);
        console.log('Vector Delta' +xDelta+' '+yDelta);
        console.log('Vector Length' +vectorLength);
        console.log('Rectangle Location '+this.rect.left+' '+this.rect.top);

    } else {
        alert("Reached Destination!");
    }
}

Enemy.prototype.update = function(msDuration) {
    //FourDirection.prototype.update.apply(this, arguments);
    window.setTimeout(this.doMove(24,24),1000);
}

// Enemy.protoype.handleEvent = function() {
//     //to go towards a player
// }

var initialize = function() {
    return new Enemy(robFord);
};

exports.initialize = initialize;
