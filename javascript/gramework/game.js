var gamejs = require('gamejs');
var config = require('../config');

exports.Director = function() {
	var onAir = false;
	var currentScene = null;
    var gamejsKey = null;

    var display = this.display = gamejs.display.setMode([config.WIDTH * config.SCALE, config.HEIGHT * config.SCALE], gamejs.display.DISABLE_SMOOTHING);

    var gamepadInput = function() {
        var index,
            buttonIndex,
            gamepadStatej

        // Loop through all possible gamepads.
        for (index = 0; index < 4; index++) {
            // Get the state of the gamepad at index.
            gamepadState = Gamepads.getState(index);
            if (gamepadState.isConnected) {
                var mapping = {
                    12: gamejs.event.K_i, // up
                    15: gamejs.event.K_l, // right
                    13: gamejs.event.K_k, // down
                    14: gamejs.event.K_j // left
                };

                for (buttonIndex = 0; buttonIndex < 17; buttonIndex++) {
                    if (gamepadState.buttonNew(buttonIndex)) {
                        gamejs.log(buttonIndex, " was pressed.");

                        // Clear the previous key.
                        if (gamejsKey) {
                            currentScene.handleEvent(
                                new KeyboardEvent(gamejs.event.KEY_UP,
                                { key: gamejsKey, char: gamejsKey, shiftKey: false }
                            ));
                        }
                        gamejsKey = mapping[buttonIndex];
                    }
                }

                currentScene.handleEvent(
                    new KeyboardEvent(gamejs.event.KEY_DOWN,
                    { key: gamejsKey, char: gamejsKey, shiftKey: false }
                ));

            }
        };
    };

	function tick(msDuration) {
		if (!onAir) return;
        gamejs.onEvent(function(event) {
			currentScene.handleEvent(event);
		});

        Gamepads.update();
        gamepadInput();

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
