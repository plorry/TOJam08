var gamejs = require('gamejs');
var config = require('../config');

exports.Director = function() {
	var onAir = false;
	var currentScene = null;

    var display = this.display = gamejs.display.setMode([config.WIDTH * config.SCALE, config.HEIGHT * config.SCALE], gamejs.display.DISABLE_SMOOTHING);

	function tick(msDuration) {
		if (!onAir) return;

        gamejs.onEvent(function(event) {
			currentScene.handleEvent(event);
		});

        if (msDuration > 1000/15) {
            msDuration = 1000/15;
        }
		currentScene.update(msDuration);
        this.display.fill("#000");
		currentScene.draw(display);
		return;
	}

	this.start = function(scene) {
		onAir = true;
		this.replaceScene(scene);
		return;
	};

	this.replaceScene = function(scene) {
        currentScene = scene;
    };

    this.getScene = function() {
        return currentScene;
    };

    //var display = gamejs.display.setMode([config.WIDTH * config.SCALE, config.HEIGHT * config.SCALE]);
	if (config.DEBUG) {
        console.log(display.getSize());
	}

    gamejs.onTick(tick, this);
    return this;
};
