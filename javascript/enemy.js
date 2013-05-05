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
    // Have a default start point if the map provides nothing.
    start: {
        x: 500,
        y: 500,
        map: 0
    }
};

var initialize = function() {
    return new Enemy(robFord);
};

exports.initialize = initialize;
