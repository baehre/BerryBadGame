// what gets drawn on
var canvas;
// the context used to draw things on the canvas
var context;
// keys pressed for the player.
var keys;
//the player playing
var localPlayer;
// the list of projectiles currently in the game
var projectiles;
// sprites used to draw the background
var backgroundSprites;
// how large a tile would be
var tileSize = 16;
// scale the tilesize
var scale = 3;
// all the enemies in the game currently
var enemies
// basically what I said above
var backgroundTileSize = tileSize * scale;
//level data. saying which tiles to use.
var levelData = [
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,11,11,11,11,11,11,0,2,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,2,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,2,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]];


function init(){
  //set globals
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  backgroundSprites = new Image();
  backgroundSprites.src = "SpriteSheets/LevelSprites/levelElementSprites48.png";

  canvas.width = 900;
  canvas.height = 504;

  enemies = [];
  //keys.js
  keys = new Keys();
  //player.js
  localPlayer = new Player(canvas, 100, 300, levelData, enemies);
  //made a function that adds a chaser and updates the enemies for the player
  addChaser(300, 100);
  addChaser(350, 100);
  addChaser(500, 100);
  addChaser(200, 100);
  addChaser(600, 100);
  addChaser(500, 300);
  addChaser(700, 100);
  addChaser(500, 400);
  addChaser(550, 600);
  projectiles = [];
  //sets all the event handlers
  setEventHandlers();
}

function setEventHandlers(){
  //checking for keys
  window.addEventListener("keydown", keyDown, false);
  window.addEventListener("keyup", keyUp, false);
}

// when the key is pressed
function keyDown(e){
  if(localPlayer){
    keys.onKeyDown(e);
  }
}

//when the key is let go of
function keyUp(e){
  if(localPlayer){
    keys.onKeyUp(e);
  }
}

// how the game actually runs
function gameLoop(){
  update();
  draw();
  //the magic by Paul Irish.
  // chooses the time called based on browser info
  // (like 60 or 30 based on what the browser can handle)
  window.requestAnimFrame(gameLoop);
}

// updates the data for player enemies and projectiles
function update(){
  updatePlayer();
  updateChasers();
  updateProjectiles();
}

// update the player
function updatePlayer(){
  localPlayer.update(keys);
}

//update all the projectiles
function updateProjectiles(){
  for(var i = 0; i < projectiles.length; i++){
    var tempProjectile = projectiles[i];
    tempProjectile.update();
  }
}

// upadte the chasers
function updateChasers(){
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    //pass in enemies to check for inter-enemy collision
    enemy.update(enemies);
  }
}

//draws everything on the canvas
function draw(){
  //wipe it
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  //shifts the canvas based around where the player is
  context.translate(Math.round(canvas.width/2 - localPlayer.getX()), Math.round(canvas.height/2 - localPlayer.getY()));
  // draw the layers. background first. otherwise doesn't really matter
  drawBackground();
  drawEnemies();
  drawPlayer();
  drawProjectiles();
  // keep the context bueno
  context.restore();
}

function drawBackground(){
  // the coordinates for each type of tile
  var grassSprite = {x : 0, y : 0};
  var rockSprite = {x : 0, y : 96};
  var flowerSprite = {x : 0, y : 48};
  var voidSprite = {x : 48, y: 0};
  for(var y = 0; y < levelData.length; y++){
    for(var x = 0; x < levelData[0].length; x++){
      var tileNum = levelData[y][x];
      //so. draw the appropriate sprite. at an x and y coordinate * 48 since that's how
      //many pixels we want each sprite to take up
      // by using Mod we can make tiles solid if we want.
      if(tileNum % 10 === 0){
        context.drawImage(backgroundSprites, grassSprite.x, grassSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if(tileNum % 10 === 1){
        context.drawImage(backgroundSprites, rockSprite.x, rockSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else if(tileNum % 10 === 2){
        context.drawImage(backgroundSprites, flowerSprite.x, flowerSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*tileSize*scale), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
      else{
        context.drawImage(backgroundSprites, voidSprite.x, voidSprite.y, backgroundTileSize, backgroundTileSize, Math.round(x*backgroundTileSize), Math.round(y*backgroundTileSize), backgroundTileSize, backgroundTileSize);
      }
    }
  }
}

// only draw the player if he has health. otherwise reset him
function drawPlayer(){
  if(localPlayer.getHealth() <= 0) {
    localPlayer.setX(100);
    localPlayer.setY(300);
    localPlayer.setHealth(100);
  } else {
    localPlayer.draw(context);
  }
}

// draw the enemy if he has health. otherwise remove him from the array and update the players enemies
function drawEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (enemy.getHealth() <= 0) {
      enemies.splice(i, 1);
      localPlayer.setEnemies(enemies);
    } else {
      enemy.draw(context);
    }
  }
}

function drawProjectiles(){
  //get the players projectiles and add them to the overall list
  projectiles = localPlayer.getProjectiles();
  for(var j = 0; j < enemies.length; j++) {
    if(enemies[i].hasOwnProperty('getProjectiles')) {
      projectiles.concat(enemies[i].getProjectiles());
    }
  }
  // NOTE: for later concat the array here
  for(var i = 0; i < projectiles.length; i++){
    var tempProjectile = projectiles[i];
    if(tempProjectile.getToRemove()){
      projectiles.splice(i, 1);
    }
    else{
      tempProjectile.draw(context);
    }
  }
  // NOTE: this needs to be changed when we have shooting enemies
  localPlayer.setProjectiles(projectiles);
}

//adds a chaser to the game
function addChaser(chaserX, chaserY){
  enemies.push(new Chaser(chaserX, chaserY, levelData, localPlayer));
  localPlayer.setEnemies(enemies);
}
