var gamejs = require('gamejs');
var config = require('../config');
var Camera = require('./camera').Camera;
var objects = require('gamejs/utils/objects');

var Physics  = require('./physics').Physics;
var Body = require('./physics').Body;
var Joint = require('./physics').Joint;

var Actor = require('./actors').Actor,
    Button = require('./actors').Button,
    Gate = require('./actors').Gate,
    Collectible = require('./actors').Collectible,
    Light = require('./actors').Light;
var sounds = require('./sounds');
var MapManager = require('./maps').MapManager;

//Scene Class

var Scene = exports.Scene = function(director, sceneConfig) {
    this.director = director;
    this.display = this.director.display;

    this._frozen = false;
    this.scroll = true;

    //All the player-controlled elements
    this.actors = new gamejs.sprite.Group();
    //NPC sprites
    this.props = new gamejs.sprite.Group();
    //All UI elements to be rendered
    this.ui = new gamejs.sprite.Group();

    var sceneId = sceneId || 0;
    this.elapsed = 0;
    this.initScene(sceneConfig);
    return this;
};

Scene.prototype.initScene = function(sceneConfig) {
    var that = this;

    this.width = sceneConfig.width || 1024;
    this.height = sceneConfig.height || 500;
    this.scale = sceneConfig.scale || 1;
    this.buttons = new gamejs.sprite.Group();
    this.gates = new gamejs.sprite.Group();
    this.lights = new gamejs.sprite.Group();
    this.wallState = 0;
    this.scores = [];
    this.players = [];
    this.maps = sceneConfig.maps || [];

    this.camera = new Camera(this, {
        width: this.width,
        height: this.height
    });
    this.focusedPlayer = 0;
    this.inDilemna = null;

    if (sceneConfig.physics) {
        this.physics = new Physics(document.getElementById("gjs-canvas"));
    }

    if (sceneConfig.image) {
        this.image = gamejs.image.load(sceneConfig.image);
        this.image_size = this.image.getSize();
    }

    if (sceneConfig.maps) {
        this.maps = MapManager.addMaps(sceneConfig.maps).maps;
    }

    this.triggers = [];
    
    this.view_size = [this.width, this.height]; 
    this.view = new gamejs.Surface(this.view_size);
    if (this.image) {
        this.view.blit(this.image);
    }

    this.maps.forEach(function(map) {
        map.draw(that.view);
        that.mapActors(map);
    });
    this.background = new gamejs.Surface(this.view_size);
    this.background.blit(this.view);
    return;
};

// TODO: This may be better suited inside the map module, and it'll be part of
// its draw command.
Scene.prototype.mapActors = function(map) {
    for (var i = 0; i < map.getTiles().sprites().length; i++) {
        var tile = map.getTiles().sprites()[i];
        var tile_opts = {
            x: tile.rect.center[0] - 1,
            y: tile.rect.center[1] - 1,
            width: tile.rect.width / 2,
            height: tile.rect.height / 2,
            scale: 1
        };
        if (tile.properties.button) {
            tile_opts['spriteSheet'] = [config.button_img, {height:32, width:32}];
            tile_opts['animations'] = {'open':[0], 'closed':[1]};
            tile_opts['startingAnimation'] = 'open';
            var button = new Button(tile_opts);
            this.addProps([button]);
            this.buttons.add(button);
        }
        if (tile.properties.class == 'gate') {
            tile_opts['spriteSheet'] = [config.gate_img, {height:32, width:32}];
            tile_opts['animations'] = {'open': [0], 'closed': [1]};
            tile_opts['type'] = tile.properties.type;
            tile_opts['startingAnimation'] = 'open';
            var gate = new Gate(tile_opts);
            this.addProps([gate]);
            this.gates.add(gate);
        }
        if (tile.properties.class == 'light') {
            tile_opts['spriteSheet'] = [config.light_img, {height:32, width:32}];
            tile_opts['animations'] = {'red': [0], 'green': [1]};
            tile_opts['type'] = tile.properties.type;
            tile_opts['startingAnimation'] = 'red';
            var light = new Light(tile_opts);
            this.addProps([light]);
            this.lights.add(light);
        }

        if (tile.properties.collectible === true) {
            tile_opts['spriteSheet'] = [config.spray_can, {height:32, width:32}];
            tile_opts['animations'] = {'red': [0], 'green': [1]};
            tile_opts['startingAnimation'] = 'red';
            tile_opts['tile'] = tile;
            var collectible = new Collectible(tile_opts);
            this.addProps([collectible]);
        }
    }
};

Scene.prototype.addActors = function(actors) {
    this.actors.add(actors);
    return;
};

Scene.prototype.addPlayers = function(players) {
    this.players.push.apply(this.players, players);
    this.actors.add(players);
    return;
};

Scene.prototype.addProps = function(props) {
    this.props.add(props);
    return;
};

Scene.prototype.addUI = function(ui) {
    this.ui.add(ui);
    return;
};

Scene.prototype.addScores = function(scores) {
    this.scores = scores;
    return;
};

Scene.prototype.isFrozen = function() {
    return this._frozen;
};

Scene.prototype.freeze = function() {
    this._frozen = true;
    return;
};

Scene.prototype.unFreeze = function() {
    this._frozen = false;
    return;
};

Scene.prototype.draw = function(display) {
    this.view.blit(this.background);

    this.props.draw(this.view);
    this.actors.draw(this.view);

    var screen = this.camera.draw();
    this.ui.draw(screen);

    this.scores.forEach(function(player) {
        player.draw(screen);
    });

    var size = screen.getSize();

    display.blit(screen);
    this.ui.draw(display);
    return;
};

Scene.prototype.handleEvent = function(event) {
    if (this.inDilemna) {
        var player = this.inDilemna;
        if (event.type == gamejs.event.KEY_DOWN) {
            gamejs.log("Hitting a key", event.key, player.controlMapping.up);
            if (event.key === player.controlMapping.up) {
                this.handleDilemna('quiet');
            } else if (event.key === player.controlMapping.down) {
                this.handleDilemna('ratout');
            }
        }
    }

    this.actors.forEach(function(actor) {
        actor.handleEvent(event);
    });

    if (event.type == gamejs.event.KEY_UP) {
        if (event.key === gamejs.event.K_SPACE) {
            if (this.focusedPlayer === 0) {
                this.focusedPlayer = 1;
            } else {
                this.focusedPlayer = 0;
            }
        }
    }
    return;
};

Scene.prototype.followPlayer = function(index) {
    var focused = this.players[this.focusedPlayer];
    this.camera.follow([focused.rect.center[0], focused.rect.center[1]]);
};

var order = function(a,b) {
    return a.rect.top-b.rect.top;
};

// Show the dilemna for the passed player.
Scene.prototype.showDilemna = function(player) {
    gamejs.log("showDilemna");
    // Get all lose messages.
    var loseMessages = [];
    this.ui.forEach(function(ui) {
        if (ui.isLoseMessage) { loseMessages.push(ui); }
    });

    loseMessages.forEach(function(ui, index) {
        if (index == player.playerNumber) {
            ui.active = true;
        }
    });
    this.inDilemna = player;
    this.freeze();
};

Scene.prototype.handleDilemna = function(choice) {
    var player = this.inDilemna;
    player.isDilemna = false;

    gamejs.log("Dilemna choice", choice);
    if (choice === 'quiet') {
        // Go back to the start of current map (player);
        player.spawnAtMapOrigin();
    } else if (choice === 'ratout') {
        player.updateScore(-300);
        // All other players go back to the start of their mazes.
        this.players.forEach(function(otherPlayer) {
            if (player !== otherPlayer) {
                otherPlayer.spawnAtMapOrigin();
            }
        });
    }

    this.ui.forEach(function(ui) {
        if (ui.isLoseMessage) { ui.active = false; }
    });

    this.inDilemna = null;
    this.unFreeze();
};

Scene.prototype.update = function(msDuration) { 
    var that = this;

    if (!this.isFrozen()){
        //step the physics
        if (this.physics) {
            this.physics.step(msDuration / 1000);
        }

        // Check if any player is in a dilemna.
        this.players.forEach(function(player) {
            if (player.isDilemna) {
                that.showDilemna(player);
            }
        });

        // Update actors
        var props = this.props;
        this.actors.forEach(function(actor){
            actor.update(msDuration, function() {
                if (actor.currentMap) {
                    actor.updateCollisions(actor.currentMap.getTiles());
                }
                actor.updateCollisions(props);
            });
        });

        this.followPlayer(this.focusedPlayer);

        // Update props
        this.props.forEach(function(prop){
            if (prop.setTarget) {
                var highestTime = 0;
                var targetPlayer;
                that.players.forEach(function(player){
                    if (player.targetSetTime > highestTime) {
                        highestTime = player.targetSetTime;
                        targetPlayer = player;
                    }
                });
                if (targetPlayer) prop.setTarget(targetPlayer);
            }
            prop.update(msDuration);
        });

        this.ui.forEach(function(element){
            element.update(msDuration);
        });

        this.scores.forEach(function(player, index) {
            player.update(msDuration, that.players[index].playerScore);
        });

        // TODO: !!! Button collisions. We should move this into the Button module.
        var gates = this.gates;
        var buttons = this.buttons;
        var lights = this.lights;
        var buttonCollisions = gamejs.sprite.groupCollide(this.actors, buttons);

        // For each collision, reduce it down to only ones that the collision is
        // happening with the center collision.
        var buttonCollisions = _.reduce(buttonCollisions, function(result, collision) {
            var actor = collision.a;
            var button = collision.b;

            var centerCollision = actor.realRect.collideRect(button.centerCollisionRect);
            if (centerCollision) {
                result.push(collision);
            }
            return result;
        }, []);


        var wallState = this.wallState;
        buttonCollisions.forEach(function(collision) {
            var actor = collision.a;
            var button = collision.b;
            // For each collision, let's check that
            if (button.canToggle) {
                button.canToggle = false;

                if (wallState == 0) {
                    wallState = 1;
                } else {
                    wallState = 0;
                }
                gates.forEach(function(gate) {
                    gate.setState(wallState);
                });
                buttons.forEach(function(button){
                    button.setState(wallState);
                });
                lights.forEach(function(light){
                    light.setState(wallState);
                });
            }
        });

        this.wallState = wallState;

        // Reset any buttons the player is not currently colliding with.
        var actors = this.actors;
        this.buttons.forEach(function(button) {
            if (gamejs.sprite.spriteCollide(button, actors).length === 0){
                button.canToggle = true;
            }
        });

        for (var i=0; i < this.triggers.length; i++){
            var trigger = this.triggers[i];
            if (trigger.condition(this)) {
                trigger.activate();
            }
            if (trigger.isActive()){
                trigger.update(msDuration, this);
            }
            if (trigger.killCondition(this) && trigger.isActive()) {
                trigger.killEvent(this);
                trigger.deactivate();
                this.triggers.splice(i,1);
            }
        }     
    }

    this.camera.update(msDuration);
    this.elapsed += msDuration;
    return;
};

var CutScene = exports.CutScene = function(options) {
    CutScene.superConstructor.apply(this, arguments);
    return this;
};
objects.extend(CutScene, Scene);

CutScene.prototype.handleEvent = function(event) {
    if (event.type == gamejs.event.KEY_DOWN) {
        this.director.nextScene();
    }
};

var Trigger = exports.Trigger = function(options) {
    this._active = false;
    this.condition = options.condition;
    this.update = options.update || function() {return;};
    this.killCondition = options.killCondition || function() {return false;};
    this.killEvent = options.killEvent || function() {return;};
    return this;
};

Trigger.prototype.activate = function() {
    this._active = true;
    return;
};

Trigger.prototype.isActive = function() {
    return this._active;
};

Trigger.prototype.deactivate = function() {
    this._active = false;
    return;
};
