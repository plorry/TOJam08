var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 1024;
var HEIGHT = exports.HEIGHT = 500;

exports.DEBUG = true;
exports.PHYSICS_DEBUG = true;

exports.STATIC_PATH = '../static/';

exports.SCALE = 1;

exports.scenes = {
	'title': {
        'width': WIDTH,
        'height': HEIGHT,
        'scale': 2
	}
};