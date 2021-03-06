/**************************************************
** GAME PLAYER CLASS
**************************************************/
//the player x and y are actually the lower right hand corner of image...
var Player = function(game, can, startX, startY, level, enemies) {
	var canvas = can;
	var moving = false;
	var paused = document.getElementById('paused');
	var storedBar = document.getElementById('storedBar');
	var emptyBar = document.getElementById('emptyBar');
	var usageText = document.getElementById('usageText');
	var levelData = level;
	var playerImage = new Image();
	playerImage.src = "SpriteSheets/PlayerSprites/racerSprite.png";
	var playerImageUp = [{x:16,y:1},{x:16,y:18},{x:16,y:35}];
	var playerImageDown = [{x:0,y:1},{x:0,y:18},{x:0,y:35}];
	var playerImageRight = [{x:32,y:1},{x:32,y:18},{x:32,y:35}];
	var playerImageLeft = [{x:48,y:1},{x:48,y:18},{x:48,y:35}];
	//default to the player looking down
 	var facing = playerImageDown;
	//for adjusting how fast animations go
	var rate = 5;
	//separate time for update to go with rate
	var frame = 0;
	var frameIndex = 0;
	//for keeping the update at the same pace
	var updateTime = 0;
	//for the frames
	var tempX = 0;
	var tempY = 0;
	//the size of the sprite
	var tileSize = 16;
	//scale the person to 48 (16*3) pixels with this
	var scale = 3;
	var size = tileSize * scale;
	//for shooting
	//higher is slower. lower is faster
	var startingProjectileFireRate = 20;
	//this is the value used to say when they can fire by subtracting then resetting the value
	var projectileFireRate = startingProjectileFireRate;
	//holds all the players projectiles
	var projectiles = [];

	var x = startX;
	var y = startY;
	var originalDamage = 20;
	var originalMoveAmount = 2.5;
	var moveAmount = 2.5;
	var fullHealth = 100;
	var health = fullHealth;
	// all the ability variables go here will DEFINITELY need to tinker here
	// if the player is currently storing a stat
	var storing = false;
	// if the player is using the stored stat
	var activated = false;
	// percentage to add on usage
	var perStore = 10.0;
	// max amount you can be dropping a stat
	var capPercent = 50.0;
	// currently how much the player is storing
	var percentStoring = 0.0;
	// how much of that stat is stored
	var storedStat = 0.0;
	// how much percent you are currently using of the stored stat
	var percentUsage = 0.0;
	// per space hit how much to use
	var perUsage = 10.0;
	// max you can use
	var capUsagePercent = 50.0;
	// max amount a player can store
	var maxStorage = 5000.0;

	// listen for the q e and space button
	window.addEventListener("keydown", playerKeyDown, false);

	// this format because the eventlistener is silly
	function playerKeyDown(e) {
		// i want teh comments so the code wont be as clean
		// Q to add percentage to drain of 1 stat
		if (e.keyCode === 81) {
			percentUsage = 0.0;
			if (percentStoring < capPercent) {
				percentStoring = percentStoring + perStore;
			}
			storing = true;
			activated = false;
		}
		// E stops all drainage or usage of stats
		else if (e.keyCode === 69) {
			// stops any storing that was going on 
			percentStoring = 0.0;
			percentUsage = 0.0;
			storing = false;
			activated = false;
			// reset to normal speed
			moveAmount = originalMoveAmount;
		}
		// space bar uses storedStat if has any
		else if (e.keyCode === 32) {
			// stops any storing that is going on if they skip hitting e
			percentStoring = 0.0;
			// will stop or start the activation
			if (percentUsage < capUsagePercent) {
				percentUsage = percentUsage + perUsage;
			}
			activated = true;
			storing = false;
		}
	};

	canvas.addEventListener("mousedown", mouseDown);

	function mouseDown(e){
		if (paused.classList.contains('hidden')) {
			var rect = canvas.getBoundingClientRect();
			var tempX = e.clientX - rect.left;
			var tempY = e.clientY - rect.top;
			//PREVX AND PREVY - THE TRANSLATE GIVES YOU PLAYER X AND Y
			//+ 20 for some reason. may need to tinker with that number
			if(projectileFireRate <= 0){
				var dx = (tempX - canvas.width/2) + 20;
				var dy = (tempY - canvas.height/2) + 20;
				var direction = Math.atan2(dy,dx);
				var tempProjectile = new Projectile(game, "player", x, y, direction, canvas, levelData, enemies, originalDamage, 6, 250);
				projectiles.push(tempProjectile);
				projectileFireRate = startingProjectileFireRate;
			}
		}
	};

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getHealth = function() {
		return health;
	};

	var getFullHealth = function() {
		return fullHealth;
	};

	var getEnemies = function() {
		return enemies;
	};

	var getWidth = function() {
		return size;
	};

	var getHeight = function() {
		return size;
	};

	var getUpdateTime = function() {
		return updateTime;
	};

	var setLevel = function(newLevel) {
		levelData = newLevel;
	};

	var setFullHealth = function(newHealth) {
		fullHealth = newHealth;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var setEnemies = function(newEnemies) {
		enemies = newEnemies;
		for (var i = 0; i < projectiles.length; i++) {
			var projectile = projectiles[i];
			projectile.setEnemies(enemies);
		}
	};

	var setHealth = function(newHealth) {
		health = newHealth;
	};

	var setUpdateTime = function(newTime) {
		updateTime = newTime;
	};

	var setLevel = function(newLevel) {
		levelData = newLevel;
	};

	// Update player position
	var update = function(keys) {
		updateTime = updateTime + 1;
		if(updateTime > 7500) {
			updateTime = 0;
		}

		// storing stuff
		if (storing) {
			if (storedStat < maxStorage) {
				// adds between .1 and .5 every update frame
				storedStat = storedStat + 0.04 * percentStoring;
				moveAmount = originalMoveAmount - .02 * percentStoring;
			}
		}
		// usage stuff
		if (activated) {
			if (storedStat > 0.0) {
				// increase the movement speed (just for testing)
				moveAmount = originalMoveAmount + .02 * percentUsage;
				storedStat = storedStat - 0.04 * percentUsage;
				if (storedStat < 0.0) {
					storedStat = 0.0;
				}
			} else {
				moveAmount = originalMoveAmount;
				activated = false;
			}
		}

		// Previous position
		var prevX = x;
		var	prevY = y;
		//if they can fire then update projectileFireRate
		if(startingProjectileFireRate > 0){
			projectileFireRate = projectileFireRate - 1;
		}
		//var emitterX = x;
		//var emitterY = y + (size / 2);
		//sets which way the character is facing
		if (keys.up) {
			if(!upIntersection(x, y)){
				y -= moveAmount;
			}
			facing = playerImageUp;
		}
		if (keys.down) {
			if(!downIntersection(x, y)){
				y += moveAmount;
			}
			facing = playerImageDown;
		}
		//since right and left are below up and down if they are combined (diagonal movement)
		//then the sprite will face left or right
		if (keys.left) {
			if(!leftIntersection(x, y)){
				x -= moveAmount;
			}
			//emitterX = x + (size / 2);
			facing = playerImageLeft;
		}
		if (keys.right) {
			if(!rightIntersection(x, y)){
				x += moveAmount;
			}
			//emitterX = x - (size / 2);
			facing = playerImageRight;
		}
		if (prevX == x && prevY == y) {
			moving = false;
		} else {
			/*if (prevY >= y || prevX !== x) {
				//kicking up some dust
				game.addEmitter(emitterX, emitterY, 3, 5, '#CDB99C');
			}*/
			moving = true;
		}
		return (prevX != x || prevY != y) ? true : false;
	};

	// Draw player
	var draw = function(ctx) {
		//so the way this works. we only want to change the frame every 5th time draw is
		//called. otherwise it goes through supppperr quick. which is bad.
		//so only change the frame every rate times per draw called.
		frame = frame + 1
		if(frame % rate === 0){
			tempX = facing[frameIndex % facing.length].x;
			tempY = facing[frameIndex % facing.length].y;
			frameIndex++;
		}
		if(frame > 7500){
			frame = 0;
			frameIndex = 0;
		}
		if(moving){
			//so. the image to draw, from startingX startingY through the width and height
			//then desination x and y and the width and height you want. so scaling to *3
			//get the proper animation.
			ctx.drawImage(playerImage, tempX, tempY, tileSize, tileSize, Math.round(x-((size)/2)), Math.round(y-((size)/2)), size, size);
		}
		else{
			//if the player is not moving then make sure it is in the stand still frame
			//by setting it to facing[0]
			ctx.drawImage(playerImage, facing[0].x, facing[0].y, tileSize, tileSize, Math.round(x-((size)/2)), Math.round(y-((size)/2)), size, size);
		}
		// show the percent meter
		var storedPercent = (storedStat / maxStorage) * 100;
		var emptyPercent = 100 - storedPercent;
		storedBar.style.width = storedPercent.toString() + '%';
		emptyBar.style.width = emptyPercent.toString() + '%';
		if (storing) {
			var temp = parseInt(percentStoring / 10) * -1;
			usageText.innerHTML = temp.toString();
		} else if (activated) {
			var temp = parseInt(percentUsage / 10);
			usageText.innerHTML = temp.toString();
		} else {
			usageText.innerHTML = '+0';
		}
	};

	var getProjectiles = function(){
		return projectiles;
	};

	var setProjectiles = function(a){
		projectiles = a;
	};

	var upIntersection = function(playerX, playerY){
		//this chooses two pixels at the top of the character
		var checkPixelX1 = playerX + (size / 6);
		var checkPixelX2 = playerX - (size / 6);
		var checkPixelY = playerY - (size / 2);
		//get that pixels tile
		return (intersection(getTile(checkPixelX1, checkPixelY)) || intersection(getTile(checkPixelX2, checkPixelY)));
	}
	var downIntersection = function(playerX, playerY){
		var checkPixelX1 = playerX + (size / 6);
		var checkPixelX2 = playerX - (size / 6);
		var checkPixelY = playerY + (size / 2);
		//get that pixels tile
		return (intersection(getTile(checkPixelX1, checkPixelY)) || intersection(getTile(checkPixelX2, checkPixelY)));
	}

	var leftIntersection = function(playerX, playerY){
		var checkPixelX = playerX - (size / 2);
		var checkPixelY1 = playerY - (size / 6);
		var checkPixelY2 = playerY + (size / 6);
		//get that pixels tile
		return (intersection(getTile(checkPixelX, checkPixelY1)) || intersection(getTile(checkPixelX, checkPixelY2)));
	}

	var rightIntersection = function(playerX, playerY){
		var checkPixelX = playerX + (size / 2);
		var checkPixelY1 = playerY - (size / 6);
		var checkPixelY2 = playerY + (size / 6);
		//get that pixels tile
		return (intersection(getTile(checkPixelX, checkPixelY1)) || intersection(getTile(checkPixelX, checkPixelY2)));
	}

	var intersection = function(checkTile){
		if (checkTile.y < 0 || checkTile.x < 0 || checkTile.y > levelData.length || checkTile.x > levelData[0].length) {
			return false;
		}
		if(levelData[checkTile.y][checkTile.x] > 10 && levelData[checkTile.y][checkTile.x] < 100){
			return true;
		}
		else{
			return false;
		}
	};

	var getTile = function(x0, y0){
		var tileX = Math.floor(x0/48.0);
		var tileY = Math.floor(y0/48.0);
		return {x: tileX, y: tileY};
	};

	// Define which variables and methods can be accessed
	return {
		getProjectiles: getProjectiles,
		setProjectiles: setProjectiles,
		getUpdateTime: getUpdateTime,
		setUpdateTime: setUpdateTime,
		setLevel: setLevel,
		getEnemies: getEnemies,
		setEnemies: setEnemies,
		getHealth: getHealth,
		getFullHealth: getFullHealth,
		setFullHealth: setFullHealth,
		setHealth: setHealth,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getWidth: getWidth,
		getHeight: getHeight,
		update: update,
		draw: draw
	}
};
