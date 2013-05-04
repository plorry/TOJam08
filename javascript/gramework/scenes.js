var gamejs = require('gamejs');
var Camera = require('./camera').Camera;

var Physics  = require('./physics').Physics;
var Body = require('./physics').Body;
var Joint = require('./physics').Joint;

var Actor = require('./actors').Actor;
var Map = require('./maps').Map;

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
	this.width = sceneConfig.width || 1024;
	this.height = sceneConfig.height || 500;
	this.scale = sceneConfig.scale || 1;

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

	if (sceneConfig.map) {
		this.map = new Map(sceneConfig.map);
	}

	this.triggers = [];
	
	this.view_size = [this.width, this.height];	
    this.view = new gamejs.Surface(this.view_size);
	return;
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
	this.view.fill("#F0A30F");
	if (this.image) {
		//this.view.blit(this.image, new gamejs.Rect([0,0], this.image_size), new gamejs.Rect([0,0], this.view_size));
		this.view.blit(this.image);
	}
	if (this.map) {
		this.map.draw(this.view);
	}
	this.props.draw(this.view);
	this.actors.draw(this.view);

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
    if (!this.isFrozen()){
        //step the physics
        if (this.physics) {
            this.physics.step(msDuration / 1000);
        }
        // update actors	
        this.actors.forEach(function(actor){
            actor.update(msDuration);
        });
        //update props
        this.props.forEach(function(prop){
            prop.update(msDuration);
        });

        this.ui.forEach(function(element){
            element.update(msDuration);
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
