var gamejs = require('gamejs');

var WIDTH = exports.WIDTH = 1280;
var HEIGHT = exports.HEIGHT = 512;

exports.DEBUG = false;
exports.PHYSICS_DEBUG = true;

var STATIC_PATH = exports.STATIC_PATH = './static/';

var SCALE = exports.SCALE = 1;

// BG Images
var BG_TEST = STATIC_PATH + 'backgrounds/test.jpg';
var BG_ROFO = STATIC_PATH + 'backgrounds/rofo.jpg';
var MAP_TILES = STATIC_PATH + 'backgrounds/test_tiles.png';
var DRAW_TILES = STATIC_PATH + 'backgrounds/draw_tiles.png';
var player_img = exports.player_img = STATIC_PATH + 'sprites/bike.png';
var player2_img = exports.player2_img = STATIC_PATH + 'sprites/bike2.png';
var button_img = exports.button_img = STATIC_PATH + 'sprites/test.png';
var gate_img = exports.gate_img = STATIC_PATH + 'sprites/gate.png';
var light_img = exports.light_img = STATIC_PATH + 'sprites/lights.png';
var ford_img = exports.ford_img = STATIC_PATH + 'sprites/suv.png';
var spray_can = exports.spray_can = STATIC_PATH + 'sprites/spray.png';
var goatpole = exports.goatpole = STATIC_PATH + 'sprites/goatonpole.png';
var GAME_OVER = exports.GAME_OVER = STATIC_PATH + 'backgrounds/ford_wins.png';
var gotcha = exports.gotcha = STATIC_PATH + 'backgrounds/gotya.png';
var win = exports.win = STATIC_PATH + 'backgrounds/win.png';
var title_screen = exports.title_screen = STATIC_PATH + 'backgrounds/title.png';
var intro = exports.intro = STATIC_PATH + 'backgrounds/intro.png';

var music_main = exports.music_main = STATIC_PATH + 'sounds/beat.ogg';
var aud_spray = exports.aud_spray = STATIC_PATH + 'sounds/e_selected.ogg';
var aud_roads = exports.aud_roads = STATIC_PATH + 'sounds/roads.ogg';
var aud_bike_lanes = exports.aud_bike_lanes = STATIC_PATH + 'sounds/bike_lanes.ogg';

//Add every resource variable to this array, please
exports.RESOURCES = [
    BG_TEST,
    BG_ROFO,
    MAP_TILES,
    player_img,
    player2_img,
    button_img,
    gate_img,
    light_img,
    ford_img,
    aud_bike_lanes,
    DRAW_TILES,
    spray_can,
    goatpole,
    GAME_OVER,
    gotcha,
    aud_roads,
    aud_spray,
    music_main,
    title_screen,
    win,
    intro
];

// Setup the size of the camera. Width and height will be multiplied based
// on the scene dimensions.
var cameraConfig = {
    width: 1,
    height: 1
}

exports.scenes = {
    'title': {
        width: 1280,
        height: 512,
        scale: SCALE,
        image: title_screen
    },
    'intro': {
        width: 1280,
        height: 512,
        scale: SCALE,
        image: intro
    },
    'game_over': {
        width: 1280,
        height: 768,
        scale: SCALE,
        image: GAME_OVER
    },
    'game': {
        'width': 1280,
        'height': 768,
        'scale': SCALE,
        'image': BG_TEST,
        camera: {
            config: cameraConfig
        },
        'maps': [
            {
                url: STATIC_PATH + 'maps/test_map.tmx',
                offset: [0, 0]
            },
            {
                url: STATIC_PATH + 'maps/test_map_2.tmx',
                offset: [640, 0]
            },
            {
                url: STATIC_PATH + 'maps/test_map_3.tmx',
                offset: [0, 255]
            },
            {
                url: STATIC_PATH + 'maps/test_map_4.tmx',
                offset: [640, 255]
            },
            {
                url: STATIC_PATH + 'maps/test_map_5.tmx',
                offset: [0, 510]
            },
            {
                url: STATIC_PATH + 'maps/test_map_final.tmx',
                offset: [640, 510]
            },                        
        ]
    }
};
