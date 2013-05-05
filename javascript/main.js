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

    var titleScene = new scenes.CutScene(director, config.scenes.title);
    director.addScene(titleScene);

    var gameScene = new scenes.Scene(director, config.scenes.game);
    director.addScene(gameScene, function() {
        // Called on initialization of this scene.
        gameScene.addPlayers(players.initialize());
        gameScene.addProps(enemy.initialize());
        gameScene.addScores(messages.initializeScores());
        gameScene.addUI(messages.initialize());
    });

    director.start(gameScene); // titleScene);
    return;
}

gamejs.preload(config.RESOURCES);
gamejs.ready(main);
