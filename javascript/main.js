var gamejs = require('gamejs');

var Scene = require('./gramework/scenes').Scene;
var Actor = require('./gramework/actors').Actor;
var Director = require('./gramework/game').Director;
var Branch = require('./trees').Branch,
    Animal = require('./trees').Animal;
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

var stump_opts = {
    x: 5,
    y: 17,
    height: 3,
    width: 1,
    physics: physics,
    type: 'static'
};
var stump = new Actor(stump_opts);
actor_opts.parent = stump;
actor_opts.height = 0.3;
actor_opts.density = 50;
actor_opts.angle = -45;
actor_opts.fixedRotation = false;
var branch = new Branch(actor_opts);
actor_opts.parent = branch;
actor_opts.angle = 0;
actor_opts.density = 20;
var branch2 = new Branch(actor_opts);
actor_opts.parent = branch2;
actor_opts.density = 5;
var branch3 = new Branch(actor_opts);
actor_opts.parent = branch3;
actor_opts.density = 0.5;
var branch4 = new Branch(actor_opts);
actor_opts.parent = branch4;
actor_opts.density = 0.25;
var branch5 = new Branch(actor_opts);
actor_opts.parent = branch5;
actor_opts.density = 0.125;
var branch6 = new Branch(actor_opts);
actor_opts.parent = branch6;
actor_opts.density = 0.0625;
var branch7 = new Branch(actor_opts);
actor_opts.parent = branch7;
actor_opts.density = 0.03125;
var branch8 = new Branch(actor_opts);
actor_opts.parent = branch8;
actor_opts.density = 0.016;
var branch9 = new Branch(actor_opts);
actor_opts.trunk = branch3;
actor_opts.angle = 45;
actor_opts.side = 'left';
var branch10 = new Branch(actor_opts);
actor_opts.trunk = null;
actor_opts.parent = branch10;
actor_opts.angle = 0;
branch11 = new Branch(actor_opts);
var branches = [
    branch,branch2,branch3,branch4,branch5,branch6,branch7,branch8,branch9,branch10, branch11
];
firstScene.addProps(branches);
firstScene.addActors([ball]);

console.log(firstScene.props);

function main() {
    director.start(firstScene);
    return;
}

gamejs.ready(main);