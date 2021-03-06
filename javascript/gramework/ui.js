var gamejs = require('gamejs');
var objects = require('gamejs/utils/objects');
var config = require('../config');
var Animation = require('./animate').Animation;

var Element = exports.Element = function(options) {
    Element.superConstructor.apply(this, arguments);
    if (options.image) {
        this.image = gamejs.image.load(options.image);
    }
    if (options.animation){
        this.animation = new Animation(options.spriteSheet, options.animation, 12) || null;
    }
    this.size = options.size || [10,10];
    this.spriteSheet = options.spriteSheet || null;
    this.margin = options.margin  || 0;
    this.active = options.active || false;
    if (this.spriteSheet) {
        this.size[0] = this.spriteSheet.width;
        this.size[1] = this.spriteSheet.height;
    }
    if (typeof options.pos == "object") {
        this.pos = options.pos || [0,0];
    } else if (typeof options.pos == "string") {
        this.pos = [];
        if (options.pos.match('bottom')) {
            this.pos[1] = config.HEIGHT - this.size[1] - this.margin;
        }
        if (options.pos.match('top')) {
            this.pos[1] = this.margin;
        }
        if (options.pos.match('left')) {
            this.pos[0] = this.margin;
        }
        if (options.pos.match('right')) {
            this.pos[0] = config.WIDTH - this.size[0] - this.margin;
        }
        if (options.pos.match('center')) {
            this.pos[0] = (config.WIDTH / 2) - (this.size[0] / 2);
        }
        if (options.pos.match('middle')) {
            this.pos[1] = (config.HEIGHT / 2) - (this.size[1] / 2);
        }
    }
    this.rect = new gamejs.Rect(this.pos, this.size);
    
    if (this.animation) {
        this.animation.start('static');
    }
        
    return this;
};
objects.extend(Element, gamejs.sprite.Sprite);

Element.prototype.update = function(msDuration) {
    if (this.animation) {
        this.animation.update(msDuration);
        this.image = this.animation.image;
    }
    return;
};

Element.prototype.start = function() {
    this.active = true;
    return;
};

Element.prototype.hide = function() {
    this.active = false;
};

var font = new gamejs.font.Font('18px Ebit');

var TextArea = exports.TextArea = function(options) {
    TextArea.superConstructor.apply(this, arguments);
    this.padding = options.padding || 3;
    this.background = options.background || null;
    this.color = options.color || '#FFFFFF';
    this.text = options.text || null;
    this.scrolling = options.scrolling || false;
    this.scrollSpeed = options.scrollSpeed || 3;
    if (this.scrolling) {
        this.currentText = " ";
    } else {
        this.currentText = this.text;
    }
    this.textSurface = new gamejs.Surface(this.rect);
    this.currentChar = 1;
    this.counter = 0;
    this.lineHeight = options.lineHeight || 10;
    
    return this;
};
objects.extend(TextArea, Element);

TextArea.prototype.update = function(msDuration) {
    if (this.scrolling) {
        this.counter++;
        if (this.counter >= 12 / this.scrollSpeed) {
            this.currentChar++;
            this.counter = 0;
        }
        this.currentText = this.text.substring(0, this.currentChar);
    }
    return;
};

TextArea.prototype.draw = function(display) {
    if (this.active) {
        if (this.background) {
            this.textSurface.fill(this.background);
            this.textSurface.setAlpha(0.25);
            display.blit(this.textSurface, this.pos);
        }
        for (var i=0;i < this.text.length;i++) {
            var line = this.text[i];
            this.fontSurface = font.render(line, this.color);
            this.fontShadow = font.render(line, "#000");
            display.blit(this.fontShadow, [this.pos[0]+1+this.padding, this.pos[1]+1 + (i * this.lineHeight)+this.padding]);
            display.blit(this.fontSurface, [this.pos[0] + this.padding, this.pos[1] + (i * this.lineHeight) + this.padding]);
        }
    }
    return;
};

TextArea.prototype.start = function(text) {
    this.currentText = " ";
    this.text = text;
};

var Score = exports.Score = function(options) { 
    Score.superConstructor.apply(this, arguments);
    return this;
};
objects.extend(Score, TextArea);

Score.prototype.update = function(msDuration, value) {
    TextArea.prototype.update(this, arguments);
    var scoreString = value.toString();
    this.text = [("00000000" + scoreString).substring(scoreString.length)];
    return;
};