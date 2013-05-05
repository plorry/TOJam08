var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 1524;
var HEIGHT = exports.HEIGHT = 768;

exports.DEBUG = false;
exports.PHYSICS_DEBUG = true;

var STATIC_PATH = exports.STATIC_PATH = './static/';

var SCALE = exports.SCALE = 2;

// BG Images
var BG_TEST = STATIC_PATH + 'backgrounds/test.jpg';
var MAP_TILES = STATIC_PATH + 'backgrounds/test_tiles.png';
var player_img = exports.player_img = STATIC_PATH + 'sprites/bike.png';
var button_img = exports.button_img = STATIC_PATH + 'sprites/test.png';
var gate_img = exports.gate_img = STATIC_PATH + 'sprites/gate.png';

//Add every resource variable to this array, please
exports.RESOURCES = [
    BG_TEST,
    MAP_TILES,
    player_img,
    button_img,
    gate_img
];

exports.scenes = {
    'title': {
        'width': 1524,
        'height': 768,
        'scale': SCALE,
        'image': BG_TEST,
        'maps': [
            {
                url: STATIC_PATH + 'maps/test_map.tmx',
                offset: [0, 0]
            },
            {
                url: STATIC_PATH + 'maps/test_map_2.tmx',
                offset: [650, 0]
            },
            {
                url: STATIC_PATH + 'maps/test_map_4.tmx',
                offset: [0, 270]
            },
        ]
    }
};
