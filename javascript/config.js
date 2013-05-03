var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 320;
var HEIGHT = exports.HEIGHT = 240;

exports.DEBUG = true;
exports.PHYSICS_DEBUG = true;

var STATIC_PATH = exports.STATIC_PATH = '../static/';

var SCALE = exports.SCALE = 2;

// BG Images
var BG_TEST = STATIC_PATH + 'backgrounds/test.jpg';
var MAP_TILES = STATIC_PATH + 'backgrounds/test_tiles.png';
var test_sprite = exports.test_sprite = STATIC_PATH + 'sprites/bike.png';

//Add every resource variable to this array, please
exports.RESOURCES = [
    BG_TEST,
    MAP_TILES,
    test_sprite
];

exports.scenes = {
    'title': {
        'width': 640,
        'height': 480,
        'scale': SCALE,
        'image': BG_TEST,
        'map': STATIC_PATH + 'maps/test_map.tmx'
    }
};
