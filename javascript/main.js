var gamejs = require('gamejs');
var config = require('./config');

var Scene = require('./gramework/scenes').Scene;
var FourDirection = require('./gramework/actors').FourDirection;
var Director = require('./gramework/game').Director;

function main() {

    var director = new Director();
    var firstScene = new Scene(director, config.scenes.title);

    var player_1_opts = {
        x: 48,
        y: 48,
        width: 12,
        height: 12
    };

    var player_1 = new FourDirection(player_1_opts);
    firstScene.addActors([player_1]);
    director.start(firstScene);
    return;
}

gamejs.preload(config.RESOURCES.concat(['./static/backgrounds/test_tiles.png']));
console.log(config.RESOURCES);

gamejs.ready(main);