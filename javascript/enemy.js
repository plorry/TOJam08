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
    x: 48,
    y: 96,
    width: 24,
    height: 24,
    spriteSheet: [
        config.ford_img, {width:24, height:24}
    ],
    animations: {'static':[0]},
    // Have a default start point if the map provides nothing.
    start: {
        x: 24,
        y: 24,
        map: 0
    }
};

var initialize = function() {
    return new Enemy(robFord);
};

exports.initialize = initialize;
