var gamejs = require('gamejs'),
        TextArea = require('./gramework/ui').TextArea,
        config = require('./config');

var Player1Lose = {
    size: [300, 120],
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
    size: [300, 120],
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

var initialize = exports.initialize = function() {
    return [
        new TextArea(Player1Lose),
        new TextArea(Player2Lose)
    ];
};