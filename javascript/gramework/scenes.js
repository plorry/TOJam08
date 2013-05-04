var gamejs = require('gamejs');
var config = require('../config');
var Camera = require('./camera').Camera;

var Physics  = require('./physics').Physics;
var Body = require('./physics').Body;
var Joint = require('./physics').Joint;

var Actor = require('./actors').Actor,
    Button = require('./actors').Button,
    Gate = require('./actors').Gate;
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
    this.wallState = 0;

    this.camera = new Camera(this, {
        width: this.width,
        height: this.height
    });

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
    return;
};

// TODO: This may be better suited inside the map module, and it'll be part of
// its draw command.
Scene.prototype.mapActors = function(map) {
    for (var i = 0; i < map.getTiles().sprites().length; i++) {
        var tile = map.getTiles().sprites()[i];
        var tile_opts = {
            x: tile.rect.center[0],
            y: tile.rect.center[1],
            width: tile.rect.width / 2,
            height: tile.rect.height / 2
        };
        if (tile.properties.button) {
            tile_opts['spriteSheet'] = [config.button_img, {height:32, width:32}];
            tile_opts['animations'] = {'static':[0], 'active':[1]};
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
    }
};

Scene.prototype.addActors = function(actors) {
    this.actors.add(actors);
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
    //this.view.clear();
    //this.props.draw(this.view);
    //this.actors.draw(this.view);

    var screen = this.camera.draw();
    this.ui.draw(screen);
    
    var size = screen.getSize();
    
    //var scaledScreen = gamejs.transform.scale(screen, [size[0] * this.scale, size[1] * this.scale]);
    
    display.blit(screen);
    
    return;
};

Scene.prototype.handleEvent = function(event) {
	
	this.actors.forEach(function(actor) {
		actor.handleEvent(event);
	});

	if (event.type === gamejs.event.KEY_DOWN) {
		if (event.key === gamejs.event.K_SPACE) {
			this.camera.zoomTo(0.5);
		}
	}
	if (event.type === gamejs.event.KEY_UP) {
		if (event.key === gamejs.event.K_SPACE) {
			this.camera.zoomTo(1);
		}
	}
	return;
};

var order = function(a,b) {
    return a.rect.top-b.rect.top;
};

Scene.prototype.update = function(msDuration) { 
    var that = this;

    if (!this.isFrozen()){
        //step the physics
        if (this.physics) {
            this.physics.step(msDuration / 1000);
        }

        // update actors
        var props = this.props;
        this.actors.forEach(function(actor){
            actor.update(msDuration, function() {
                actor.updateCollisions(actor.currentMap.getTiles());
                actor.updateCollisions(props);
            });
        });
        //update props
        this.props.forEach(function(prop){
            prop.update(msDuration);
        });

        this.ui.forEach(function(element){
            element.update(msDuration);
        });

        var buttonCollisions = gamejs.sprite.groupCollide(this.actors, this.buttons);
        var gates = this.gates;
        buttonCollisions.forEach(function(collision) {
        	var actor = collision.a;
        	var button = collision.b;
        	if (button.canToggle) {
        		button.canToggle = false;
        		if (this.wallState == 0) {
        			this.wallState = 1;
        		} else {
        			this.wallState = 0;
        		}
        		gates.forEach(function(gate) {
        			gate.setState(this.wallState);
        		});
        	}
        });
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
