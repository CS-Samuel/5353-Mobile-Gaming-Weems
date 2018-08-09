var destroyer = {
	create: function () {
		console.log("play.js");

		// Reset variables for game reset

		deathFlag = false;
		deathFlag2 = false;
		game.lockRender = false;

		//Client.sendNewPlayerRequest();

		
		this.player = new Ufo(game);
		this.player2 = new Ufo(game);

		w = game.width // Game width and height for convenience
		h = game.height
		frame_counter = 0 // variable to help with the creation of obstacles

		//used for points right now
		this.item_destroyed = false;

		//  The scrolling starfield background
		this.starfield = game.add.tileSprite(0, 0, w, h, 'starfield');

		// this.earth = game.add.sprite(0, 0, 'earth');

		// this.earth.animations.add('spin', 0, 48);
		// this.earth.animations.play('spin', 10, true);

		// Score sound
		//this.sound.score = game.add.audio('score')
		//this.sound.score.volume = .4

		// Death sound
		this.sound.kill = game.add.audio('kill')

		// Music
		//this.music = game.add.audio('music')
		//this.music.play('', 0, 0.5, true)

		game.physics.startSystem(Phaser.Physics.ARCADE)

		// Obstacles (little icons of food)
		this.obstacles = game.add.group()

		//  An explosion pool that gets attached to each icon
		this.explosions = game.add.group();
		this.explosions.createMultiple(10, 'kaboom');
		this.explosions.forEach(this.setupObstacles, this);

		// Player
		//calls the create method of the ufo object
		this.player.create(randomInt(0,game.width), randomInt(0,game.height/2), 0.75, 0.75); 
		this.player2.create(randomInt(0,game.width), randomInt(0,game.height/2), 0.75, 0.75); 

		// Create Player Health
		this.invincibleTimer = 0
		this.player.health = 3;
		

		

		this.healthText = game.add.bitmapText(10, 450, 'fontUsed', 'Health: ', 64)
		this.healthValueText = game.add.bitmapText(95,450, 'fontUsed', '0', 64)
		this.healthText.scale.setTo(0.5)
		this.healthValueText.scale.setTo(0.5)

		this.healthText2 = game.add.bitmapText(700, 450, 'fontUsed', 'Health: ', 64)
		this.healthValueText2 = game.add.bitmapText(700+85,450, 'fontUsed', '0', 64)
		this.healthText2.scale.setTo(0.5)
		this.healthValueText2.scale.setTo(0.5)
		this.invincibleTimer2 = 0
		this.player2.health = 3;
		

		// Player Ship explosions

		this.shipExplosion = game.add.sprite(0,0, 'explosionAnimation')
		this.shipExplosion.animations.add('explodeShip', 0, 24)
		this.shipExplosion.anchor.setTo(0.5)
		this.shipExplosion.alpha=0

		this.shipExplosion2 = game.add.sprite(0,0, 'explosionAnimation')
		this.shipExplosion2.animations.add('explodeShip', 0, 24)
		this.shipExplosion2.anchor.setTo(0.5)
		this.shipExplosion2.alpha=0
	

		// Score label
		// this.bmpText = game.add.bitmapText(game.width / 2, 100, 'fontUsed', '', 150);
		// this.bmpText.anchor.setTo(.5, .5)
		// this.bmpText.scale.setTo(.3, .3)

		///// Tracking keyboard inputs /////////////

		// Fire the ufo big laser when the 'X' key is pressed
		// laserFire = this.input.keyboard.addKey(Phaser.Keyboard.X);
		// laserFire.onDown.add(this.player.startLaser, this.player);

		// Assigns arrow keys and spacebar for player2
		this.player2.assignMovementKeys(38, 40, 37, 39);
		this.player2.assignFireKeys(Phaser.KeyCode.SPACEBAR);
	
		
		// Assigns W,S,A,D keys and shift for player1
		this.player.assignMovementKeys(Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D);
		this.player.assignFireKeys(Phaser.KeyCode.SHIFT)

		this.pauseAndUnpause(game)
		this.player1Fire(game)
		this.player2Fire(game)

	},

	update: function () {

		this.healthValueText.text = this.player.health
		this.healthValueText2.text = this.player2.health

		//if (game.num_other_players > 0) {

			// Place score on game screen
			// this.bmpText.text = game.globals.score

			// Move background to look like space is moving
			this.starfield.tilePosition.y -= 2;

			// Check for overlap between game ship and obstacles
			game.physics.arcade.overlap(this.player.ship, this.obstacles, this.killPlayer, null, this)
			game.physics.arcade.overlap(this.player2.ship, this.obstacles, this.killPlayer2, null, this)

			// Check for overlap between bullets and obstacles
			game.physics.arcade.overlap(this.player.bullets, this.obstacles, this.destroyItem, null, this);
			game.physics.arcade.overlap(this.player2.bullets, this.obstacles, this.destroyItem, null, this);
			
			// Collide players

			game.physics.arcade.collide(this.player.ship, this.player2.ship, this.playerCollide, null, this);

			if (this.item_destroyed) {
				// Check to see if we score any points
				// needs changed since we added bullets
				game.globals.score += this.scorePoint();
				this.item_destroyed = false;
			}

			spawn_rate = 100 - game.globals.score; // how fast to add new obstacles to screen (smaller value = more obstacles)
			obstacle_speed = game.globals.score * 1.5 + 200; // how fast should each obstacle move

			// Spawn rate continuously shrinks so stop it at 5
			if (spawn_rate < 5) {
				spawn_rate = 5;
			}

			// Spawn obstacles
			if (frame_counter % spawn_rate == 0) {
				//console.log(spawn_rate);
				//console.log(obstacle_speed);
				this.spawnObstacle(game.rnd.integerInRange(32, game.width - 32), game.height, speed = obstacle_speed, 0.5, 0.5)
			}

			this.player.move();
			this.player2.move();

			frame_counter++;
		//}
	},

	/**
	 * Spawn New Player
	 */
	spawnNewPlayer: function (player) {
		game.players.push(new Ufo(game));
		game.players[game.players.length-1].create(player.x,player.y,0.75,0.75);
	},

	/**
	 * spawn a new obstacle
	 * 
	 * @param x : x coord
	 * @param y : y coord
	 * @param speed : speed to move across game board
	 */
	spawnObstacle: function (x, y, speed, x_scale, y_scale) {
		// randomly choose an icon from an array of icon names
		var choice = game.rnd.integerInRange(0, game.globals.obstacle_icons.length - 1);
		var name = game.globals.obstacle_icons[choice];

		var animatedObstacleChance = Math.random()*10

		//create the obstacle with its randomly chosen name
		if (animatedObstacleChance < 2)
		{
			var obstacle = this.obstacles.create(x, y, 'icon-' + name)
		}

		else if (animatedObstacleChance < 5)
		{
			var obstacle = this.obstacles.create(x, y, 'planet1')
			obstacle.animations.add('planetAnimation', 0, 10)
			obstacle.play('planetAnimation', 20, true)
			
		}
		else if (animatedObstacleChance < 7)
		{
			var obstacle = this.obstacles.create(x, y, 'planet2')
			obstacle.animations.add('planetAnimation', 0, 28)
			obstacle.play('planetAnimation', 20, true)
			
		}
		else
		{
			var obstacle = this.obstacles.create(x, y, 'planet3')
			obstacle.animations.add('planetAnimation', 0, 18)
			obstacle.play('planetAnimation', 20, true)

		}
		
		
		game.physics.enable(obstacle, Phaser.Physics.ARCADE)

		x_scale = y_scale = Math.random()
		

		obstacle.enableBody = true
		obstacle.body.colliderWorldBounds = true
		obstacle.body.immovable = true
		obstacle.anchor.setTo(.5, .5)
		obstacle.scale.setTo(x_scale, y_scale)
		obstacle.body.setSize(obstacle.width + 20, obstacle.height - 20);
		obstacle.body.velocity.y = -speed

		obstacle.checkWorldBounds = true;

		// Kill obstacle/enemy if vertically out of bounds
		obstacle.events.onOutOfBounds.add(this.killObstacle, this);

		obstacle.outOfBoundsKill = true;
	},

	/**
	 * removes an obstacle from its group
	 */
	killObstacle: function (obstacle) {
		this.obstacles.remove(obstacle);
	},

	/**
	 * Adds an explosion animation to each obstacle when created
	 */
	setupObstacles: function (obstacle) {
		obstacle.anchor.x = 0.5;
		obstacle.anchor.y = 0.5;
		obstacle.animations.add('kaboom');
	},

	/**
	 * Determines score. Needs changed
	 */
	scorePoint: function () {
		// silly but wanted a function in case points started
		// to change based on logic.
		return 1;
	},

	/**
	 * Kills player. Things commented out for debugging.
	 */
	killPlayer: function (player) {



		if (this.game.time.now > this.invincibleTimer) {
			--this.player.health 
			this.invincibleTimer = this.game.time.now + 1000;
		}

		// player is dead, start over
		if (this.player.health <= 0) {
			this.player.visible=true;
			this.player.exists=true;
			this.player.alpha = 0
		
			if (!deathFlag)
			{
			this.shipExplosion.x = this.player.ship.x	// Move explosion sprite to player position
			this.shipExplosion.y = this.player.ship.y
			this.shipExplosion.alpha = 1;			// Make it visible

			this.shipExplosion.play('explodeShip', 20, false);	// Play the explosion
			deathFlag = true;
		
			game.time.events.add(1000, this.playerRespawn, this);
			}

		}
	},

	playerRespawn: function (){
		this.shipExplosion.alpha=0;
		deathFlag = false;
		this.player.health = 3
		invincibleTimer = 0
		this.player.alpha = 1;
		
	},

	killPlayer2: function (player) {

	
		if (this.game.time.now > this.invincibleTimer2) {
			--this.player2.health 
			this.invincibleTimer2 = this.game.time.now + 1000;
		}

		// player is dead, start over
		if (this.player2.health <= 0) {
			this.player2.alpha = 0
		
			if (!deathFlag2)
			{
			this.shipExplosion.x = this.player2.ship.x	// Move explosion sprite to player position
			this.shipExplosion.y = this.player2.ship.y
			this.shipExplosion.alpha = 1;			// Make it visible

			this.shipExplosion.play('explodeShip', 20, false);	// Play the explosion
			deathFlag2 = true;
		
			game.time.events.add(1000, this.player2Respawn, this);
			}

		}
	},

	player2Respawn: function (){
		this.shipExplosion.alpha=0;
		deathFlag2 = false;
		this.player2.health = 3
		invincibleTimer2 = 0
		this.player2.alpha = 1;
		
	},

	player1Fire: function (){
	
		var player1retical = game.add.sprite(50,550,'retical')
		player1retical.anchor.setTo(0.5)
		player1retical.inputEnabled = true;

		player1retical.events.onInputUp.add(
			function(){
				this.player.fireBullets();
			}, this)
		
	},

	player2Fire: function(){
		var player2retical = game.add.sprite(750,550,'retical')
		player2retical.anchor.setTo(0.5)
		player2retical.inputEnabled = true;

		player2retical.events.onInputUp.add(
			function(){
				this.player2.fireBullets();
			}, this)
	},

	
	/**
	 * Source: https://phaser.io/examples/v2/games/invaders
	 * 
	 * Collision handler for a bullet and obstacle
	 */
	destroyItem: function (bullet, obstacle) {
		bullet.kill();
		obstacle.kill();
		var explosion = this.explosions.getFirstExists(false);
		explosion.reset(obstacle.body.x, obstacle.body.y);
		explosion.play('kaboom', 30, false, true);
		this.item_destroyed = true;
	},

	playerCollide: function()
	{
		if (this.player.ship.y > this.player2.ship.y)
		{
			--this.player.health
		}
		else
		{
			--this.player2.health
		}
		this.killPlayer()
		this.killPlayer2()
	},

	/**
	 * This method lets a user pause the game by pushing the pause button in
	 * the top right of the screen. 
	 */
	pauseAndUnpause: function (game) {
		var pause_button = game.add.sprite(game.width - 40, 40, 'pause')
		pause_button.anchor.setTo(.5, .5)
		pause_button.inputEnabled = true
		// pause:
		pause_button.events.onInputUp.add(
			function () {
				if (!game.paused) {
					game.paused = true
				}
				pause_watermark = game.add.sprite(game.width / 2, game.height / 2, 'pause')
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
	}
}