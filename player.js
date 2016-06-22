/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(can, startX, startY, level, intersectionEntities) {
	var canvas = can;
	var moving = false;
	var levelData = level;
	var playerImage = new Image();
	playerImage.src = "SpriteSheets/PlayerSprites/racerSprite.png";
	var playerImageUp = [{x:16,y:1},{x:16,y:18},{x:16,y:35}];
	var playerImageDown = [{x:0,y:1},{x:0,y:18},{x:0,y:35}];
	var playerImageRight = [{x:32,y:1},{x:32,y:18},{x:32,y:35}];
	var playerImageLeft = [{x:48,y:1},{x:48,y:18},{x:48,y:35}];
	//default to the player looking down
 	var facing = playerImageDown;
	//for choosing the animation
	var frame = 0;
	//for adjusting how fast animations go
	var rate = 5;
	//separate time for update to go with rate
	var time = 0;
	//for the frames
	var tempX = 0;
	var tempY = 0;
	//the size of the sprite
	var tileSize = 16;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	//for shooting
	//higher is slower. lower is faster
	var startingProjectileFireRate = 20;
	//this is the value used to say when they can fire by subtracting then resetting the value
	var projectileFireRate = startingProjectileFireRate;
	var prevX = 0;
	var prevY = 0;
	var mouseClicked = false;
	//holds all the players projectiles
	var projectiles = [];

	var x = startX;
	var y = startY;
	var id;
	var moveAmount = 2.5;

	canvas.addEventListener("mousedown", mouseDown);

	function mouseDown(e){
		var rect = canvas.getBoundingClientRect();
	  var tempX = e.clientX - rect.left;
	  var tempY = e.clientY - rect.top;
	  //PREVX AND PREVY - THE TRANSLATE GIVES YOU PLAYER X AND Y
		//+ 20 for some reason. may need to tinker with taht number
		if(projectileFireRate <= 0){
		  var dx = (tempX - canvas.width/2) + 20;
		  var dy = (tempY - canvas.height/2) + 20;
		  var direction = Math.atan2(dy,dx);
		  var tempProjectile = new Projectile(this, x, y, direction, canvas);
		  projectiles.push(tempProjectile);
			projectileFireRate = startingProjectileFireRate;
		}
	};

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	// Update player position
	var update = function(keys) {
		// Previous position
		var prevX = x;
		var	prevY = y;
		//frame for animating player
		if(frame < 7500){
			frame = frame + 1;
		}
		//if it gets too large then reset it. big numbers bad
		else{
			frame = 0;
		}
		//if they can fire then update projectileFireRate
		if(startingProjectileFireRate > 0){
			projectileFireRate = projectileFireRate - 1;
		}
		//sets which way the character is facing
		if (keys.up) {
			if(!intersection(x, y, "up")){
				y -= moveAmount;
			}
			facing = playerImageUp;
		}
		if (keys.down) {
			if(!intersection(x, y, "down")){
				y += moveAmount;
			}
			facing = playerImageDown;
		}
		//since right and left are below up and down if they are combined (diagonal movement)
		//then the sprite will face left or right
		if (keys.left) {
			if(!intersection(x, y, "left")){
				x -= moveAmount;
			}
			facing = playerImageLeft;
		}
		if (keys.right) {
			if(!intersection(x, y, "right")){
				x += moveAmount;
			}
			facing = playerImageRight;
		}
		if(prevX == x && prevY == y){
			moving = false;
		}
		else{
			moving = true;
		}
		return (prevX != x || prevY != y) ? true : false;
	};

	// Draw player
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		time = time + 1
		if(time%rate == 0){
			tempX = facing[frame%facing.length].x;
			tempY = facing[frame%facing.length].y;
		}
		if(time > 7500){
			time = 0;
		}
		if(moving){
			//so. the image to draw, from startingX startingY through the width and height
			//then desination x and y and the width and height you want. so scaling to *3
			//get the proper animation.
			ctx.drawImage(playerImage, tempX, tempY, tileSize, tileSize, Math.round(x-(tileSize*scale)), Math.round(y-(tileSize*scale)), tileSize*scale, tileSize*scale);
		}
		else{
			//if the player is not moving then make sure it is in the stand still frame
			//by setting it to facing[0]
			ctx.drawImage(playerImage, facing[0].x, facing[0].y, tileSize, tileSize, Math.round(x-(tileSize*scale)), Math.round(y-(tileSize*scale)), tileSize*scale, tileSize*scale);
		}
	};

	var getProjectiles = function(){
		return projectiles;
	};

	var setProjectiles = function(a){
		projectiles = a;
	};

	//check if player would intersect with a box.
	var intersection = function(playerX, playerY, direction){
		//get the players current tile based on direction for collision purposes
		var playerTileCoord = getPlayerTile(playerX, playerY, direction);
		var playerTileX = playerTileCoord.x;
		var playerTileY = playerTileCoord.y;
		if(direction == "right"){
			var checkTile = levelData[playerTileY][playerTileX+1];
		}
		else if(direction == "left"){
			var checkTile = levelData[playerTileY][playerTileX-1];
		}
		else if(direction == "up"){
			var checkTile = levelData[playerTileY-1][playerTileX];
		}
		else if(direction == "down"){
			var checkTile = levelData[playerTileY+1][playerTileX];
		}
		if(checkTile > 10){
			return true;
		}
		else{
			return false;
		}
	};

	var getPlayerTile = function(playerX, playerY, direction){
		if(direction == "left"){
			var tileX = Math.floor((playerX+48)/48.0)-1;
			var tileY = Math.floor((playerY+24)/48.0)-1;
		}
		else if(direction == "right"){
			var tileX = Math.floor(playerX/48.0)-1;
			var tileY = Math.floor((playerY+24)/48.0)-1;
		}
		else if(direction == "up"){
			var tileX = Math.floor((playerX+24)/48.0)-1;
			var tileY = Math.floor((playerY+48)/48.0)-1;
		}
		else if(direction == "down"){
			var tileX = Math.floor((playerX+24)/48.0)-1;
			var tileY = Math.floor(playerY/48.0)-1;
		}
		return {x: tileX, y: tileY};
	};
	// Define which variables and methods can be accessed
	return {
		getProjectiles: getProjectiles,
		setProjectiles: setProjectiles,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		update: update,
		draw: draw
	}
};
