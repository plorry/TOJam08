var gamejs = require('gamejs');
var config = require('./config');

var Scene = require('./gramework/scenes').Scene;
var Trigger = require('./gramework/scenes').Trigger;
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
        spriteSheet: [config.test_sprite, {width:24, height:24}],
        animations: {'static':[0,1]}
    };

    var player_2_opts = {
        x: 576,
        y: 80,
        width: 12,
        height: 12,
        spriteSheet: [config.test_sprite, {width:24, height:24}],
        controlMapping: {
            down: gamejs.event.K_k,
            left: gamejs.event.K_j,
            right: gamejs.event.K_l,
            up: gamejs.event.K_i
        },
        animations: {'static':[0,1]}
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
    var player_2 = new FourDirection(player_2_opts);
    firstScene.addActors([player_1, player_2]);
    firstScene.addUI([player_1_score, player_2_score]);
    director.start(firstScene);
    return;
}

gamejs.preload(config.RESOURCES);

gamejs.ready(main);
