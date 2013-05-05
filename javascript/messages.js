var gamejs = require('gamejs'),
        TextArea = require('./gramework/ui').TextArea,
        objects = require('gamejs/utils/objects'),
        Element = require('./gramework/ui').Element,
        config = require('./config');
var Score = require('./gramework/ui').Score;

var LoseMessage = function(options) {
    LoseMessage.superConstructor.apply(this, arguments);
    this.isLoseMessage = true;
}
objects.extend(LoseMessage, TextArea)

var score_opts = {
    pos: 'top left',
    margin: 2,
    size: [160, 10],
    text: ['00000000'],
    active: true
};
var score_opts_2 = {
    pos: 'top right',
    margin: 2,
    size: [160, 10],
    text: ['00000000'],
    active: true
};

var Player1Lose = {
    size: [600, 240],
    margin: 4,
    pos: 'top left',
    background: "#000",
    active: false,
    text: [
        'Got you! Tell me where your',
        'friend is for lenience!',
        ' PLAYER 1 CHOOSE!',
        '   UP: Stay Quiet',
        '   DOWN: Rat out your friend'],
    lineHeight: 17
};

var Player2Lose = {
    size: [600, 240],
    margin: 4,
    pos: 'top right',
    background: "#000",
    active: false,
    text: [
        'Got you! Tell me where your',
        'friend is for lenience!',
        ' PLAYER 2 CHOOSE!',
        '   UP: Stay Quiet',
        '   DOWN: Rat out your friend'],
    lineHeight: 17
};

var Gotcha = {
    size: [120, 120],
    pos: 'middle center',
    image: config.gotcha,
    active: true
};

var initialize = exports.initialize = function() {
    return [
        new LoseMessage(Player1Lose),
        new LoseMessage(Player2Lose),
        new Element(Gotcha)
    ];
};

var initializeScores = exports.initializeScores = function() {
    return [
        new Score(score_opts),
        new Score(score_opts_2)
    ];
}
