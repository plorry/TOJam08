var gamejs = require('gamejs');
var tmx = require('gamejs/tmx');
var objects = require('gamejs/utils/objects');

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
    this.deadlyTiles = new gamejs.sprite.Group();

    // Tiles with active actions on them (lasers, doors, etc.)
    this.activeTiles = new gamejs.sprite.Group();

    // We need to know where to start for this map. The tile should be defined
    // by a `start:true` property.
    this.startingPosition = [0, 0];
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
    var that = this;

    if (!tile.properties) {
        return;
    }

    _.each(tile.properties, function(value, key) {
      switch(key) {
        case "obstacle":
          that.tiles.add(tile);
          // Add tile to the matrix. For simplicity sake at this point,
          // simply add it as a BLOCK.always tile if there is a 
          // blocking property on it.
          // TODO: Do we need this matrix? Why cant it just be a property on the
          // tile like so:
          tile._block = BLOCK.always;
          that.matrix[i][j] = BLOCK.always;
          break;
        case "switch":
            that.tiles.add(tile);
        default:
          break;
      }
    });
      
      /*
       * TODO
      if (tile.properties.start) {
        this.startingPosition = tilePos;
      } else if (tile.properties.active) {
        this.activeTiles.add(tile);
      } else if (tile.properties.block) {
        this.tiles.add(tile)

        this.matrix[i][j] = BLOCK.always;
      }
      if (tile.properties.pain) {
        this.deadlyTiles.add(tile);
      }
      */
};

TileMapModel.prototype.actorCollisionTest = function(actor) {
    var collisions = gamejs.sprite.spriteCollide(actor, this.tiles);
    return _.reduce(collisions, function(result, tile) {
        // An actor has collision rects. For each rect, we want to check if a
        // tile is colliding with it.
        for (var i = 0; i < actor.collisionRects.length; i ++) {
            var obj = actor.collisionRects[i];
            if (tile.rect.collideRect(obj.rect)) {
                result[obj.key] = true;
            }
        }
        return result;
    }, {});
    return null;
};

// Loads the Map at `url` and holds all layers.
var Tile = function(rect, properties) {
    Tile.superConstructor.apply(this, arguments);

    this.rect = rect;
    this.properties = properties;

    gamejs.log("Tile", properties);

    return this;
};
objects.extend(Tile, gamejs.sprite.Sprite);

var TileMap = exports.TileMap = new TileMapModel();

var Map = exports.Map = function(url) {
    // Draw each layer
    this.draw = function(display) {
        layerViews.forEach(function(layerView) {
            layerView.draw(display, mapController.offset);
        }, this);
    };

    // Input events.
    this.handle = function(event) {
        mapController.handle(event);
    };
    
    // Called on each tick.
    this.update = function(msDuration) {
        mapController.update(msDuration);
    };

    // Initialize.
    var self = this;
    var map = new tmx.Map(url);
    var mapController = new MapController();

    TileMap.createMatrix({
        width: map.tileWidth, 
        height: map.tileHeight
    });

    // Given the TMX Map we've loaded, go through each layer (via map.layers,
    // provided by gamejs), and return a LayerView that we can deal with.
    var layerViews = map.layers.map(function(layer) {
        return new LayerView(self, layer, {
            tileWidth: map.tileWidth,
            tileHeight: map.tileHeight,
            width: map.width,
            height: map.height,
            tiles: map.tiles
        });
    });
    return this;
};

var LayerView = function(map, layer, opts) {
    this.draw = function(display, offset) {
        // `blit` basically means draw.
        display.blit(this.surface, offset);
    };

    // Initialize.
    this.surface = new gamejs.Surface(
        opts.width * opts.tileWidth,
        opts.height * opts.tileHeight
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
                var tilePos = [j * opts.tileWidth, i * opts.tileHeight];
                var tileRect = new gamejs.Rect(
                  tilePos,
                  [opts.tileWidth, opts.tileHeight]
                );
                this.surface.blit(tileSurface, tileRect);
                var tile = new Tile(tileRect, tileProperties);

                // Push or ignore the tile. Only kept if its relevant.
                TileMap.push(tile, tilePos, i, j);
            } else {
                gamejs.log('No GID ', gid, i, j, 'layer', i);
            }
        }, this);
    }, this);
    return this;
};

// Input Controller
var MapController = function() {
    this.offset = [0, 0];

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

    this.update = function(msDuration) {
        // tick
    };
    return this;
};
