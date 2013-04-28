var gamejs = require('gamejs');

var Scene = require('./gramework/scenes').Scene;
var Actor = require('./gramework/actors').Actor;
var Director = require('./gramework/game').Director;
var Branch = require('./trees').Branch,
    Animal = require('./trees').Animal,
    Tree = require('./trees').Tree;
var config = require('./config');

var director = new Director();
var firstScene = new Scene(director, config.scenes.title);

var physics = firstScene.physics;

var actor_opts = {
    x: 7.2,
    y: 3,
    height: 1,
    width: 1,
    physics: physics,
    angle: 0,
    fixedRotation: true
};
var ball = new Animal(actor_opts);

var tree_opts = {
    x: 20,
    y: 23,
    num_branches: 1,
    physics: physics
};

var tree = new Tree(tree_opts);

firstScene.addActors(tree.getBranches());
firstScene.addActors([ball]);

function main() {
    director.start(firstScene);
    return;
}

gamejs.ready(main);