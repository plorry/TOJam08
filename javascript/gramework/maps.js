var gamejs = require('gamejs');
var tmx = require('gamejs/tmx');
var objects = require('gamejs/utils/objects');

// JS Helper. Sanity!
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

/*
* Each tile can hold a "block" property detailing its desired
* blocking behaviour. Possible blocking data values are:
* - "none" -> Tile does not block.
* - "always" -> Tile blocks.
* - "north" -> Tile does not allow to go through its north border.
* - "east" -> Tile does not allow to go through its east border.
* - "south" -> Tile does not allow to go through its south border.
* - "west" -> Tile does not allow to go through its west border.
*
* Several restrictions can be added separated by commas; for example,
* an upper left corner should be "west,north". Restrictions are
* cumulative, so, for example, "west,always" would be the same as
* "always" and "east,none,north" would be the same as "east,north".
* 
* Note that "never" and "always" override any blocking information associated
* to a tile. This property cannot be changed in runtime.
*/
var BLOCK = {
    none: parseInt('0000', 2),
    north: parseInt('0001', 2),
    east: parseInt('0001', 2),
    south: parseInt('0100', 2),
    west: parseInt('1000', 2),
    always: parseInt('1111', 2)
};

// Store tiles that can be collided with 
var TileMapModel = function() {
    this.tiles = new gamejs.sprite.Group();
};

TileMapModel.prototype.getTiles = function() {
    return this.tiles;
};

TileMapModel.prototype.createMatrix = function(opts) {
    this.matrix = [];
    this.tileWidth = opts.width;
    this.tileHeight = opts.height;

    var i = opts.height;
    while (i-->0) {
        var j = opts.width;
        this.matrix[i] = [];
        while (j-->0) {
            this.matrix[i][j] = BLOCK.none;
        }
    }
};

// Every tile we have is added to a TileMap, for easy reference.
TileMapModel.prototype.push = function(tile, tilePos, i, j) {
    if (!tile.properties) {
        return;
    }
    this.tiles.add(tile);

    // TODO: This can probably be killed. Make sure "switch" is not used.
    _.each(tile.properties, function(value, key) {
      switch(key) {
        case "obstacle":
          // Add tile to the matrix. For simplicity sake at this point,
          // simply add it as a BLOCK.always tile if there is a 
          // blocking property on it.
          // TODO: Do we need this matrix? Why cant it just be a property on the
          // tile like so:
          // that.matrix[i][j] = BLOCK.always;
          tile.block = true;
          break;
        case "switch":
            tile.switch = true;
        default:
          break;
      }
    });
};

// Loads the Map at `url` and holds all layers.
var Tile = exports.Tile = function(rect, properties) {
    Tile.superConstructor.apply(this, arguments);

    this.rect = rect;
    this.properties = properties;

    return this;
};
objects.extend(Tile, gamejs.sprite.Sprite);

// Accepts an array of `map` hashes, where-in each hash looks
// something like so:
// {
//    url: "./path/to/map.tmx",
//    offset: [0, 0]
// }
//
// offset defines where the map should be drawn within the game scene. The scene
// will decide when the maps are drawn.
var MapManagerModel = function() {
    this.maps = [];
    return this;
};

// Add an array of maps to the manager.
MapManagerModel.prototype.addMaps = function(maps) {
    // Load up each map.
    this.maps.push.apply(this.maps, maps.map(function(map) {
        return new Map(map);
    }));
    return this;
};

// Return a map by its unique id. Useful when multiple actors are working with
// different maps in a single scene.
MapManagerModel.prototype.getById = function(index) {
    return this.maps[index];
};

var MapManager = exports.MapManager = new MapManagerModel();

// Takes a hash containing:
//  `url`, ./path/to/map.tmx,
//  `offset`, an [x, y] array of where to draw the map initially.
var Map = exports.Map = function(options) {
    options = (options || {});

    var url = options.url;
    var offset = options.offset;

    // An array of spawn points players can come from. In many cases, we
    // may just want to 0-index this, but we want the notion of "checkpoints"
    this.spawnPlayers = [];

    // These tiles have properties which teleport a player in some way. They
    // could have values like 'next', or 'ref:anotherTitle', allowing us to
    // build simple teleport mechanisms, or move onto the next level.
    this.teleportPlayers = [];

    this.tileset = new TileMapModel();

    // Draw each layer
    this.draw = function(display) {
        var that = this;
        layerViews.forEach(function(layerView) {
            layerView.draw(display);
        }, this);
    };

    // Input events.
    this.handle = function(event) {
        this.controller.handle(event);
    };
    
    // Called on each tick.
    this.update = function(msDuration) {
        this.controller.update(msDuration);
    };

    // Initialize.
    var self = this;
    var map = new tmx.Map(url);
    this.controller = new MapController(offset);

    this.getTiles = function() {
        return this.tileset.getTiles();
    };

    // Given a specific tile, get the center of it. Useful for outside classes.
    this.getTileCenter = function(tile) {
        return [
            (tile.rect.left + (tile.rect.width / 2)),
            (tile.rect.top + (tile.rect.height / 2))
        ];
    };

    // Given the TMX Map we've loaded, go through each layer (via map.layers,
    // provided by gamejs), and return a LayerView that we can deal with.
    var layerViews = map.layers.map(function(layer) {
        return new LayerView(self, layer, {
            tileWidth: map.tileWidth * 2,
            tileHeight: map.tileHeight * 2,
            width: map.width * 2,
            height: map.height * 2,
            tiles: map.tiles
        });
    });
    return this;
};

var LayerView = function(map, layer, opts) {
    this.draw = function(display) {
        display.blit(this.surface);
    };

    // Initialize.
    this.surface = new gamejs.Surface(
        (opts.width * opts.tileWidth) + map.controller.offset[0],
        (opts.height * opts.tileHeight) + map.controller.offset[1]
    );
    this.surface.setAlpha(layer.opacity);

    // Note how below we look up the "gid" of the tile images in the TileSet 
    // from the Map ('opt.tiles') to get the actual Surfaces.
    layer.gids.forEach(function(row, i) {
        row.forEach(function(gid, j) {
            if (gid === 0) {
                return;
            }

            var tileProperties = opts.tiles.getProperties(gid);
            var tileSurface = opts.tiles.getSurface(gid);

            if (tileSurface) {
                var tilePos = [
                    (j * opts.tileWidth) + map.controller.offset[0] * 2, 
                    (i * opts.tileHeight) + map.controller.offset[1] * 2
                ];
                var tileRect = new gamejs.Rect(
                  tilePos,
                  [opts.tileWidth, opts.tileHeight]
                );
                var tile = new Tile(tileRect, tileProperties);

                if (tileProperties.draw) {
                  this.surface.blit(tileSurface, tileRect);
                }

                if (tileProperties.spawnPlayer) {
                    map.spawnPlayers.insert(Number(tileProperties.index), tile);
                }

                if (tileProperties.teleportPlayer) {
                    map.teleportPlayers.push(tile);
                }

                // Push each tile into our custom TileMap model, which adds some
                // convenience over what gamejs provides.
                map.tileset.push(tile, tilePos, i, j);
            } else {
                gamejs.log('No GID ', gid, i, j, 'layer', i);
            }
        }, this);
    }, this);
    return this;
};

// Input Controller
var MapController = function(offset) {
    this.offset = offset || [0, 0];

    this.handle = function(event) {
        if (event.type === gamejs.event.KEY_DOWN) {
            if (event.key === gamejs.event.K_LEFT) {
               this.offset[0] += 50;
            } else if (event.key === gamejs.event.K_RIGHT) {
               this.offset[0] -= 50;
            } else if (event.key === gamejs.event.K_DOWN) {
               this.offset[1] -= 50;
            } else if (event.key === gamejs.event.K_UP) {
               this.offset[1] += 50;
            }
        }
    };

    // tick
    this.update = function(msDuration) {};
    return this;
};
