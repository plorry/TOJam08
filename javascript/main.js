var gamejs = require('gamejs');
var config = require('./config');

var Scene = require('./gramework/scenes').Scene;
var Trigger = require('./gramework/scenes').Trigger;
var Director = require('./gramework/game').Director;

var players = require('./players');
var messages = require('./messages');
var enemy = require('./enemy');

function main() {

    var director = new Director();
    var firstScene = new Scene(director, config.scenes.title);


    firstScene.addPlayers(players.initialize());
    firstScene.addProps(enemy.initialize());
    firstScene.addScores(messages.initializeScores());
    firstScene.addUI(messages.initialize());
    director.start(firstScene);
    return;
}

gamejs.preload(config.RESOURCES);
gamejs.ready(main);
