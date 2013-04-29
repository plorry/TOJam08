var gamejs = require('gamejs');

var Scene = require('./gramework/scenes').Scene;
var Actor = require('./gramework/actors').Actor;
var Director = require('./gramework/game').Director;
var config = require('./config');

var director = new Director();
var firstScene = new Scene(director, config.scenes.title);

var actor_opts = {
    x: 16,
    y: 16,
    width: 12,
    height: 12
};

var thing = new Actor(actor_opts);
firstScene.addActors([thing]);

function main() {
    director.start(firstScene);
    return;
}

gamejs.ready(main);