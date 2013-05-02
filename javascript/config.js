var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 320;
var HEIGHT = exports.HEIGHT = 240;

exports.DEBUG = true;
exports.PHYSICS_DEBUG = true;

var STATIC_PATH = exports.STATIC_PATH = '../static/';

var SCALE = exports.SCALE = 2;

// BG Images
var BG_TEST = STATIC_PATH + 'backgrounds/test.jpg';

//Add every resource variable to this array, please
exports.RESOURCES = [
    BG_TEST,
];

exports.scenes = {
	'title': {
        'width': WIDTH,
        'height': HEIGHT,
        'scale': SCALE,
        'image': BG_TEST
	}
};