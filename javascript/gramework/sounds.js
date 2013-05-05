var gamejs = require('gamejs');
var config = require('../config');

var playsound = exports.playsound = function(sound) {
    audio = new gamejs.mixer.Sound(sound);
    audio.play(false);
};