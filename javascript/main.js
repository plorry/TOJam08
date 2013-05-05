var gamejs = require('gamejs');
var config = require('./config');

var scenes = require('./gramework/scenes');
var Trigger = require('./gramework/scenes').Trigger;
var Director = require('./gramework/game').Director;

var players = require('./players');
var messages = require('./messages');
var enemy = require('./enemy');

function main() {
    var director = new Director();

    var titleScene = {
        scene: new scenes.CutScene(director, config.scenes.title)
    };
    director.addScene(titleScene);

    var gameSceneObject = {
        scene: new scenes.Scene(director, config.scenes.game),
        callback: function(scene) {
            // Called on initialization of this scene.
            scene.addPlayers(players.initialize());
            scene.addProps(enemy.initialize());
            scene.addScores(messages.initializeScores());
            scene.addUI(messages.initialize());
        }
    };

    director.addScene(gameSceneObject);

    var gameOverScene = new scenes.CutScene(director, config.scenes.game_over);
    director.addScene({
        scene: gameOverScene
    });

    director.start(titleScene);
    return;
}

gamejs.preload(config.RESOURCES);
gamejs.ready(main);
