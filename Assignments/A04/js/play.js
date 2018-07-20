var play = function () {}

var obstacleDelay = 10000
var callOnceFlag = false
var obstacleSpawnCount = 0
var velocityAdjustment = 0
var numObstacles = 1


var cursors;
var bullets;
var bulletTime = 0;
var bullet;

var scoreModifier =1;



play.prototype = {
	create: function () {
		console.log("play.js");
		// Game width and height for convenience
		w = this.game.width
		h = this.game.height

		frame_counter = 0

		// Bg color
		this.game.stage.backgroundColor = BG_COLOR
		// Bg image
		this.bg = this.game.add.image(0, 0, 'bg')

		// Bullets

		bullets = this.add.group();
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;

		// Create 20 bullets 

		for (var i = 0; i < 20; i++)
		{
			var b = bullets.create(0, 0, 'bullet');
			b.name = 'bullet' + i;
			b.exists = false;
			b.visible = false;
			b.checkWorldBounds = true;
			b.events.onOutOfBounds.add(this.resetBullet, this);
		}

		// SpaceBar Input
		cursors = this.input.keyboard.createCursorKeys();
		this.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

		// Death sound
		this.sound.crash = this.game.add.audio('crashSound')

		// Explosion Sound
		this.sound.explosion = this.game.add.audio('explosion')

		// Music
		this.music = this.game.add.audio('music')
		this.music.play('', 0, 0.5, true)

		this.physics.startSystem(Phaser.Physics.ARCADE)

		// Obstacles
		this.obstacles = this.game.add.group()
		this.shieldBonuses = this.game.add.group()

		// Player
		this.player = this.game.add.sprite(this.game.width / 2, 250, 'player')
		this.game.physics.enable(this.player, Phaser.Physics.ARCADE)
		this.player.enableBody = true
		this.player.body.collideWorldBounds = true
		this.player.scale.setTo(.5, .5)
		this.player.anchor.setTo(.5, .5)
		this.player.body.setSize(this.player.width-10,this.player.height)

		// Score label
		this.bmpText = this.game.add.bitmapText(this.game.width / 2, 100, 'fontUsed', '', 150);
		this.bmpText.anchor.setTo(.5, .5)
		this.bmpText.scale.setTo(.3, .3)

		// Support for mouse click and touchscreen input
		this.game.input.onDown.add(this.onDown, this)

		this.pauseAndUnpause(this.game)

		// Timer to adjust score per obstacle ever 1 sec

		this.time.events.loop(5000, this.adjustScoreModifier, this);

		// Explosions

		this.explosions = this.game.add.group();
		this.explosions.createMultiple(30, 'explosionAnimation');
		this.explosions.forEach(this.setupObstacles, this);

	},

	update: function () {
		this.bmpText.text = this.game.global.score

		// Movement

		this.move();

		// Overlap with Obstacle, Bonus, Bullets
		this.game.physics.arcade.overlap(this.player, this.obstacles, this.killPlayer, null, this)
		this.game.physics.arcade.overlap(this.player, this.shieldBonuses, this.applyShieldBonus, null, this)
		this.game.physics.arcade.overlap(bullets, this.obstacles, this.collisionHandler, null, this);


		// Spawn new obstacle wave

		if (obstacleSpawnCount < 1 && (this.time.now % 5 == 0)) {
			++obstacleSpawnCount 
			this.game.time.events.add(100, this.spawnObstacle, this);
		}

		// Spawn bonuses
		//var bonusChance = Math.round(Math.random() * 1000)
		//if (bonusChance < 1 && this.shieldBonuses.countLiving() ==0){
		//	this.spawnShieldBonus()
		//}

		// Speed and Obstacle Frequency Increasers

		 var test = this.game.global.score 
		 if (test % 2 == 1){
			velocityAdjustment += .5
			numObstacles += .01
		}


		// Fire bullets

		if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		{
			this.fireBullet();
		}

	},

	adjustScoreModifier: function (){
		++scoreModifier
	},

	spawnShieldBonus: function (){
		var shieldBonus = this.shieldBonuses.create(300,300, 'shield')
		this.game.physics.enable(shieldBonus, Phaser.Physics.ARCADE)


		
	},

	fireBullet: function () {

		if (this.time.now > bulletTime)
		{
			bullet = bullets.getFirstExists(false); // find first non-existing child
	
			if (bullet) // if bullet does not exist reset it (limits to number of bullets total)
			{
				bullet.reset(this.player.x+25, this.player.y-25 );
				bullet.body.velocity.x = 300;
				bulletTime = this.time.now + 250;	// Add delay between bullets
			}
		}
	
	},

	//  Called if the bullet goes out of the screen
	resetBullet: function(bullet) {

    bullet.kill();

},

	//  Called if the bullet hits one of the obstacles
	collisionHandler: function (bullet, obst) {

    bullet.kill();
	obst.kill();
	--obstacleSpawnCount
	this.game.global.score = this.game.global.score + scoreModifier
	this.sound.explosion.play()

	
	var explosion = this.explosions.getFirstExists(false);
    explosion.reset(obst.body.x, obst.body.y);
    explosion.play('explosionAnimation', 30, false, true);


},

setupObstacles: function (obstacle) {

	obstacle.anchor.x = 0.5;
	obstacle.anchor.y = 0.5;
	obstacle.animations.add('explosionAnimation');

},


	applyShieldBonus: function (_player, _shieldBonus){
		_shieldBonus.kill()

	},

	spawnObstacle: function () {
		var obstacleHeight = Math.random() * this.game.height
		var obstacleType = Math.round(Math.random() * 10)

		if (obstacleType < 5){
			var obstacle = this.obstacles.create(450, obstacleHeight, 'obstacle')
		}
		else{
			var obstacle = this.obstacles.create(450, obstacleHeight, 'sawBlade')
		}
		this.game.physics.enable(obstacle, Phaser.Physics.ARCADE)

		obstacle.enableBody = true
		obstacle.body.colliderWorldBounds = true
		obstacle.body.immovable = true
		obstacle.anchor.setTo(.5, .5)
		obstacle.scale.setTo(1, 1)
		obstacle.body.velocity.x = (Math.random() * -200 - 100 - velocityAdjustment)
		obstacle.animations.add('explosionAnimation')
		


		obstacle.checkWorldBounds = true;
		// Kill obstacle/enemy if  out of bounds
		obstacle.events.onOutOfBounds.add(this.killObstacle, this);

		obstacle.outOfBoundsKill = true;

		// Spawn number of obstacles per wave with delay per obstacle

		if (obstacleSpawnCount < numObstacles){
			++obstacleSpawnCount
			this.game.time.events.add(200, this.spawnObstacle, this);
		}
		
	},

	killObstacle: function (obstacle) {
	//	console.log(obstacle);
		this.obstacles.remove(obstacle);
		--obstacleSpawnCount
		
		
	},


	killPlayer: function (player) {
		
		if (!callOnceFlag)
		{

		
		this.sound.crash.play()
		
		this.music.stop()
		this.player.loadTexture('crashImage',0)
		callOnceFlag = true
		this.game.time.events.add(10, this.stopGame, this);
		
		}

	},

	stopGame: function() {
		//this.game.lockRender=true
		this.obstacles.destroy()
		this.explosions.destroy()
		bullets.destroy()
		this.player.destroy()
		obstacleSpawnCount =0
		callOnceFlag = false
		this.game.state.start('gameOver');
	},
	

	// Tap on touchscreen or click with mouse
	onDown: function (pointer) {},

	// Move player
	move: function () {
		if (this.game.input.activePointer.isDown) {
	
			this.physics.arcade.moveToPointer(this.player, 400)

			if (Phaser.Rectangle.contains(this.player.body, this.input.x, this.input.y))
        	{
            	this.player.body.velocity.setTo(0, 0);
        	}
		} 
		else {
			this.player.body.velocity.setTo(0,0);
		}
	},
	moveAngle: function(rate,factor){
		
			return rate * factor;
	},


	pauseAndUnpause: function (game) {
		var pause_button = this.game.add.sprite(this.game.width - 40, 40, 'pause')
		pause_button.anchor.setTo(.5, .5)
		pause_button.inputEnabled = true
		// pause:
		pause_button.events.onInputUp.add(
			function () {
				if (!game.paused) {
					game.paused = true
				}
				pause_watermark = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'pause')
				pause_watermark.anchor.setTo(.5, .5)
				pause_watermark.alpha = .1
			}, this)
		// Unpause:
		game.input.onDown.add(
			function () {
				if (game.paused) {
					game.paused = false
					pause_watermark.destroy()
				}
			}, self)
	},

	render: function () {
		debug = false
		if (debug) {
			// Show hitbox
			this.game.debug.body(this.player)

			for (var i = 0; i < obstacles.length; i++) {
				this.game.debug.body(obstacles[i])
			}
		}
	},
}