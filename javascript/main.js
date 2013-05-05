var gamejs = require('gamejs');
var config = require('./config');

var Scene = require('./gramework/scenes').Scene;
var Trigger = require('./gramework/scenes').Trigger;
var Director = require('./gramework/game').Director;
var Score = require('./gramework/ui').Score;

var players = require('./players');
var messages = require('./messages');
var enemy = require('./enemy');

function main() {

    var director = new Director();
    var firstScene = new Scene(director, config.scenes.title);

    var score_opts = {
        pos: 'top left',
        margin: 2,
        size: [55, 10],
        text: ['00000000']
    };
    var score_opts_2 = {
        pos: 'top right',
        margin: 2,
        size: [55, 10],
        text: ['00000000']
    };
    var player_1_score = new Score(score_opts);
    var player_2_score = new Score(score_opts_2);

    firstScene.addActors(players.initialize());
    firstScene.addActors(enemy.initialize());
    firstScene.addUI([player_1_score, player_2_score]);
    firstScene.addUI(messages.initialize());
    director.start(firstScene);
    return;
}

gamejs.preload(config.RESOURCES);
gamejs.ready(main);
