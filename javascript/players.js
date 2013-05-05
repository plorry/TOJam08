var gamejs = require('gamejs'),
        FourDirection = require('./gramework/actors').FourDirection,
        objects = require('gamejs/utils/objects'),
        config = require('./config');

var Player = function(options) {
    Player.superConstructor.apply(this, arguments);
};
objects.extend(Player, FourDirection);

Player.prototype.doCollisions = function(collisions) {
    var actor = this;
    _.each(collisions, function(tile, key) {
        if (tile.block === true) {
            actor._hitWall(tile, key);
        }

        if (tile.properties && tile.properties.teleportPlayer) {
            actor.doTeleport(tile);
        }
    });

};

// Set the players position and all related rects to a specified point.
Player.prototype.setPlayerPosition = function(x, y) {
    gamejs.log("setPlayerPosition", x, y);
    this.realRect.left = x;
    this.realRect.top = y;
}

Player.prototype.spawnAtMapOrigin = function() {
    var initialSpawn = this.currentMap.getTileCenter(
        this.currentMap.spawnPlayers[0]
    );
    this.setPlayerPosition(initialSpawn[0], initialSpawn[1]);
};

var Player1 = {
    x: 48,
    y: 48,
    width: 12,
    height: 12,
    spriteSheet: [
        config.player_img, {width:24, height:24}
    ],
    animations: {'static':[0,1]},
    // Have a default start point if the map provides nothing.
    start: {
        x: 48,
        y: 48,
        map: 0
    }
};

var Player2 = {
    x: 430,
    y: 80,
    width: 12,
    height: 12,
    spriteSheet: [
        config.player_img, {width:24, height:24}
    ],
    controlMapping: {
        down: gamejs.event.K_k,
        left: gamejs.event.K_j,
        right: gamejs.event.K_l,
        up: gamejs.event.K_i
    },
    animations: {'static':[0,1]},
    // Have a default start point if the map provides nothing.
    start: {
        x: 430,
        y: 80,
        map: 1
    }
};

var initialize = function() {
    return [
        new Player(Player1),
        new Player(Player2)
    ];
};

exports.initialize = initialize;
