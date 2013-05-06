var gamejs = require('gamejs');
var config = require('../config');

var playsound = exports.playsound = function(sound, loop) {
    var toLoop = loop || false;
    audio = new gamejs.mixer.Sound(sound);
    audio.play(toLoop);
};