var gamejs = require('gamejs'),
        FourDirection = require('./gramework/actors').FourDirection,
        objects = require('gamejs/utils/objects'),
        config = require('./config');

var Player = function(options) {
    Player.superConstructor.apply(this, arguments);
}
objects.extend(Player, FourDirection);

Player.prototype.doCollisions = function(collisions) {
    var actor = this;
    _.each(collisions, function(tile, key) {
        if (tile.block === true) {
            actor._hitWall(tile, key);
        }
    });
};

var Player1 = {
    x: 48,
    y: 48,
    width: 12,
    height: 12,
    spriteSheet: [
        config.test_sprite, {width:24, height:24}
    ]
};

var Player2 = {
    x: 112,
    y: 80,
    width: 12,
    height: 12,
    spriteSheet: [
        config.test_sprite, {width:24, height:24}
    ],
    controlMapping: {
        down: gamejs.event.K_k,
        left: gamejs.event.K_j,
        right: gamejs.event.K_l,
        up: gamejs.event.K_i
    }
};

var initialize = function() {
    return [
        new Player(Player1),
        new Player(Player2)
    ];
};

exports.initialize = initialize;
