var gamejs = require('gamejs');
var config = require('./config');

gamejs.preload(config.RESOURCES);

var Scene = require('./gramework/scenes').Scene;
var FourDirection = require('./gramework/actors').FourDirection;
var Director = require('./gramework/game').Director;

function main() {

    var director = new Director();
    var firstScene = new Scene(director, config.scenes.title);

    var player_1_opts = {
        x: 16,
        y: 16,
        width: 12,
        height: 12
    };

    var player_1 = new FourDirection(player_1_opts);
    firstScene.addActors([player_1]);
    director.start(firstScene);
    return;
}

gamejs.ready(main);