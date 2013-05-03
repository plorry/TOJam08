var gamejs = require('gamejs');
var config = require('./config');

var Scene = require('./gramework/scenes').Scene;
var FourDirection = require('./gramework/actors').FourDirection;
var Director = require('./gramework/game').Director;
var Score = require('./gramework/ui').Score;

function main() {

    var director = new Director();
    var firstScene = new Scene(director, config.scenes.title);

    var player_1_opts = {
        x: 48,
        y: 48,
        width: 12,
        height: 12,
        spriteSheet: [config.test_sprite, {width:24, height:24}]
    };

    var score_opts = {
        pos: 'top left',
        margin: 2,
        size: [55, 10],
        text: '0 0 0 0 0 0 0 0'
    };
    var score_opts_2 = {
        pos: 'top right',
        margin: 2,
        size: [55, 10],
        text: '0 0 0 0 0 0 0 0'
    };
    var player_1_score = new Score(score_opts);
    var player_2_score = new Score(score_opts_2);

    var player_1 = new FourDirection(player_1_opts);
    firstScene.addActors([player_1]);
    firstScene.addUI([player_1_score, player_2_score]);
    director.start(firstScene);
    return;
}

gamejs.preload(config.RESOURCES.concat(['./static/backgrounds/test_tiles.png']));
console.log(config.RESOURCES);

gamejs.ready(main);