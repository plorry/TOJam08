var gamejs = require('gamejs'),
        FourDirection = require('./gramework/actors').FourDirection,
        objects = require('gamejs/utils/objects'),
        config = require('./config'),
        Tile = require('./gramework/maps').Tile;

var Player = function(options) {
    Player.superConstructor.apply(this, arguments);
    this.isTarget = false;
    this.targetCounter = 0;
    this.playerScore = 0;
};
objects.extend(Player, FourDirection);

Player.prototype.doCollisions = function(collisions) {
    var actor = this;
    _.each(collisions, function(obj, key) {
        // We can be colliding with a tile or a prop object. Do a simple check
        // to know what route we should take
        if (obj instanceof Tile) {
            var tile = obj;
            if (tile.properties && tile.properties.teleportPlayer) {
                actor.doTeleport(tile);
            }

            if (tile.properties && tile.properties.obstacle) {
                actor._hitWall(tile, key);
            }
        } else {
            // Colliding with an actor of some sorts.
            if (obj.collectible) {
                actor.collectItem(obj);
            }

            if (obj.green === false) {
                actor.targetCounter = 1000;
            }
            if (obj.block === true) {
                actor._hitWall(obj, key);
            }

            if (obj.isButton) {
                actor.triggerButton(obj);
            }
        }
    });

};

// How can a button, when modified, trigger gates? TODO
Player.prototype.triggerButton = function(button) {
    // For each button we're colliding with, make sure we're colliding with its
    // centerCollisionRect before we trigger anything. We don't want players
    // trigger switches when they just touch the edge.
    if (this.realRect.collideRect(button.centerCollisionRect)) {
        if (button.canToggle) {
            gamejs.log("On", button);
            button.canToggle = false;
        }

    }
};

Player.prototype.updateScore = function(number) {
    this.playerScore += number;
};

Player.prototype.collectItem = function(item) {
    item.kill();
    this.updateScore(item.modifier);
    gamejs.log("Collected an item, add " + item.modifier + " to score. Total Score: " + this.playerScore);
};

// Set the players position and all related rects to a specified point.
Player.prototype.setPlayerPosition = function(x, y) {
    gamejs.log("setPlayerPosition", x, y);
    this.realRect.left = x;
    this.realRect.top = y;
};

Player.prototype.spawnAtMapOrigin = function() {
    if (this.currentMap.spawnPlayers.length === 0) {
        return;
    }

    var spawnPoint = this.currentMap.spawnPlayers[this.playerNumber];
    var initialSpawn = this.currentMap.getTileCenter(spawnPoint);
    this.setPlayerPosition(initialSpawn[0], initialSpawn[1]);
};

Player.prototype.update = function(msDuration, collisionCallback) {
    FourDirection.prototype.update.apply(this, arguments);
    if (this.targetCounter > 0) {
        this.targetCounter -= 1;
        this.isTarget = true;
    } else {
        this.isTarget = false;
    }
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
        map: 0
    }
};

var initialize = function() {
    var players = [Player1, Player2].map(function(player, index) {
        player.playerNumber = index;
        return new Player(player);
    });
    return players;
};

exports.initialize = initialize;
