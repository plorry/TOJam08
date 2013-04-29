var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 320;
var HEIGHT = exports.HEIGHT = 240;

exports.DEBUG = true;
exports.PHYSICS_DEBUG = true;

exports.STATIC_PATH = '../static/';

var SCALE = exports.SCALE = 2;

exports.scenes = {
	'title': {
        'width': WIDTH,
        'height': HEIGHT,
        'scale': SCALE
	}
};