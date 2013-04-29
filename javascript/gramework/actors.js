var gamejs = require('gamejs');
var Sprite = require('gamejs/sprite').Sprite;
var draw = require('gamejs/draw');
var objects = require('gamejs/utils/objects');
var config = require('../config');
//var SpriteSheet = require('./animate').SpriteSheet;
//var Animation = require('./animate').Animation;

var Body = require('./physics').Body;

var Actor = exports.Actor = function(options) {
	/*
	Actor options
	x: the x position of the actor's centre - required
	y: the y position of the actor's centre - required
	width: half the width of the actor's rectangle (from centre to right or left edge) - required
	height: half the height of the actor's rectangle (from centre to top or bottom edge) - required
	*/
	Actor.superConstructor.apply(this, arguments);
	this.init(options);
    return this;
};
objects.extend(Actor, Sprite);

Actor.prototype.init = function(options) {
	this.scale = options.scale || 1;
	this.x = options.x;
	this.y = options.y;
	this.height = options.height;
	this.width = options.width;

	this.rect = new gamejs.Rect(
		[(this.x - this.width) * this.scale, (this.y - this.height) * this.scale],
		[this.width * 2 * this.scale, this.height * 2 * this.scale]);
	this.realRect = new gamejs.Rect(this.rect);
	//this.collisionRect = new gamejs.Rect([this.rect.left+1, this.rect.top+1],[this.rect.width-2, this.rect.height-2]);

	//this.spriteSheet = new SpriteSheet(options.spriteSheet[0], options.spriteSheet[1]) || null;
	this.physics = options.physics || null;

	if (this.physics) {
		this.angle = options.angle * (Math.PI / 180) || 0;
		this.density = options.density || 2;
		this.body = new Body(this.physics, {
			type: options.type || 'dynamic',
			x: this.x,
			y: this.y,
			height: this.height,
			width: this.width,
			angle: this.angle,
			density: this.density,
			fixedRotation: options.fixedRotation || false
		});
	}

	return;
};

Actor.prototype.update = function(msDuration) {
	
	if (this.physics) {
		this.realRect.center = [this.body.body.GetPosition().x * this.scale, this.body.body.GetPosition().y * this.scale];
	}

	this.rect.top = Math.round(this.realRect.top) + 0.5;
	this.rect.left = Math.round(this.realRect.left) + 0.5;
	
	if (this.animation) {
		this.animation.update(msDuration);
		this.image = this.animation.image;
	}

	//this.body.body.
	return;
};

Actor.prototype.handleEvent = function(event) {
	return;
};

Actor.prototype.draw = function(display) {
	//cq(this.image._canvas).matchPalette(palettes.simple);
	
	if (this.spriteSheet) {
		if (this.image) {
			gamejs.sprite.Sprite.prototype.draw.apply(this, arguments);
		};
	} else {
		//draw.rect(display, "#000FFF", new gamejs.Rect(this.pos, [5,5]));
	}
	
	if (config.DEBUG) {
		var color = "#000FFF";
		if (!this._inControl) {
			var color = "#555000";
		}
		draw.rect(display, color, this.rect, 1);
	}
	return;
};