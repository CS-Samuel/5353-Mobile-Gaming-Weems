var jumpflag = false;
var deathFlag = false;
var startX = 103
var startY = 192

var slimes


var level_03 = {

	preload: function () {
		// Load tile map
		game.load.tilemap('dungeon2', 'Tileset/dungeon2.json', null, Phaser.Tilemap.TILED_JSON);

		//map tile images:
		game.load.image('floor', 'Tileset/dungeon_tileset.png');
		game.load.image('Items', 'Tileset/dungeon_items.png');
        game.load.image('Decorations', 'Tileset/dungeon_objects.png')
		game.load.image('Boundary', 'Tileset/school.png')
		game.load.image('mini_map', 'assets/images/minimap.png')

		// Font

        game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
    
    
    
		
	},
	create: function () {
		
		// Resets after player death
		deathFlag = false;
		game.lockRender = false;
		currentLevel = "level_03"

		// Mapping layers and tilesets

		this.map = game.add.tilemap('dungeon2');
	
		this.map.addTilesetImage('floor', 'floor');
		this.map.addTilesetImage('Items','Items');
        this.map.addTilesetImage('Decorations', 'Decorations');
        this.map.addTilesetImage('Boundary', 'Boundary');

		this.layers = {
			ground_layer: this.map.createLayer('Floor'),
			decoration_layer: this.map.createLayer('Decorations'),
			// coin_layer: this.map.createLayer('Coins'),
			collision_layer: this.map.createLayer('Boundary')
		};

		this.layers.ground_layer.resizeWorld();

		// Collision between player and collison layer

		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.enable(this.layers.collision_layer);
		//game.physics.arcarde.enable(this.layers.decoration_layer);
		this.layers.collision_layer.alpha = 0
		this.map.setCollisionBetween(659,659, true, this.layers.collision_layer);
    
        // Animated Tiles plugin
		this.map.plus.animation.enable();
		
		// Add Coins

		// this.coins = game.add.group();
		// this.coins.enableBody = true;
		// this.coins.physicsBodyType = Phaser.Physics.ARCADE;
		// this.createCoins();

	

		// Movement tracker

		this.prevDir = '';	// holds sprites previous direction (left , right) so
							// we can face the correct direction when using the 'idle' animation

        // Add Portal Sprite

        this.portal = game.add.sprite(547,542, 'portal');
		this.portal.animations.add('portalAnimation', [0,1,2,3,4,5,6,7,8,9,10,11,12], 5, true)
        this.portal.play('portalAnimation')
        this.portal.anchor.setTo(0.5,.5)
	
		// Adding the knight atlas that contains all the animations
        this.player = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'knight_atlas');
		this.player.scale.setTo(.75,.75)
		
		// Add walking and idle animations. Different aninmations are needed based on direction of movement.
		this.player.animations.add('walk_left', Phaser.Animation.generateFrameNames('Walk_left', 0, 8), 20, true);
		this.player.animations.add('walk_right', Phaser.Animation.generateFrameNames('Walk_right', 0, 8), 20, true);
		this.player.animations.add('run_left', Phaser.Animation.generateFrameNames('Run_left', 0, 8), 80, true);
		this.player.animations.add('run_right', Phaser.Animation.generateFrameNames('Run_right', 0, 8), 80, true);
		this.player.animations.add('idle_left', Phaser.Animation.generateFrameNames('Idle_left', 0, 9), 20, true);
		this.player.animations.add('idle_right', Phaser.Animation.generateFrameNames('Idle_right', 0, 9), 20, true);
		
		// Jump Animation
		this.player.animations.add('jump_right', Phaser.Animation.generateFrameNames('Jump_right', 0, 9), 60, false);
		this.player.animations.add('jump_left', Phaser.Animation.generateFrameNames('Jump_left', 0, 9), 60, false);
  
		// Attack animation
		this.player.animations.add('attack_right', Phaser.Animation.generateFrameNames('Attack_right',0,9), 20, true);
		this.player.animations.add('attack_left', Phaser.Animation.generateFrameNames('Attack_left',0,9), 20, true);

		// Jump Attack Animation
		this.player.animations.add('jump_attack_right', Phaser.Animation.generateFrameNames('JumpAttack_right',0,9), 20, false);
		this.player.animations.add('jump_attack_left', Phaser.Animation.generateFrameNames('JumpAttack_left',0,9), 20, false);
		
		// Die Animation
		this.player.animations.add('die', Phaser.Animation.generateFrameNames('Dead',0,10), 20, false);

		// turn physics on for player, world bound collisions
		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		

		// set the anchor for sprite to middle of the view
		this.player.anchor.setTo(0.5);
		this.player.body.width=28;
		this.player.body.height=60;

			// // Add Slime Enemies

			// slimes = game.add.group();
			// slimes.enableBody = true;
			// slimes.physicsBodyType = Phaser.Physics.ARCADE;
		
			// this.createSlimes();
	
		// Set movement keys

		this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

		// Mouse Input

		game.input.mouse.capture= true;

		// tell camera to follow sprite now that we're on a map
		// and can move out of bounds
		game.camera.follow(this.player);

		// set starting location for player in some middle spot in the map
		this.player.x = startX;
		this.player.y = startY;
		
		// Add HUD background and attach to camera
		this.hudBackground = game.add.sprite(0,0, 'hudBackground')
		this.hudBackground.fixedToCamera=true;
		

		// Health meter  -- https://github.com/matthiaswh/phaser-health-meter

		this.invincibleTimer = 0 // Timer so player is breifly invincible after being damaged
		this.player.health=5;
		this.player.maxHealth=5;
		this.healthMeterIcons = this.game.add.plugin(Phaser.Plugin.HealthMeter);
		this.healthMeterIcons.icons(this.player, {icon: 'heart', x: 650, y: 10, width: 16, height: 16, rows:1} );
		
		// Mini Map
	
		this.mmgraphics = this.add.graphics(0,-360) // add graphics so we can draw rectangles for minimap
		this.mmgraphics.fixedToCamera = true // fix it to camera
		this.mmgraphics.alpha = 0.5
		
		this.mmgraphics.padding = 10 // padding from sides
		this.mmgraphics.mapsize = 40*32 // mine map is 6900 wide (change to your own settings)
		this.mmgraphics.timesby = 46 // times it down depending on your screen minimap width, height and of your map size
		this.mmgraphics.screensizeW = 50 // minimap screen width
		this.mmgraphics.screensizeH = 50 // minimap screen height

		// Coin Count and Display

	
		this.coinHudText = game.add.bitmapText(100, 0, 'desyrel', 'Coins: ', 64)
		this.coinCountText = game.add.bitmapText(175,0, 'desyrel', '0', 64)
		this.coinHudText.scale.setTo(0.5)
		this.coinCountText.scale.setTo(0.5)
		this.coinCountText.fixedToCamera = true;
		this.coinHudText.fixedToCamera = true;

		
	},

	update: function () {
	//	console.log(this.player.x, this.player.y)   // debug players position
		// HUD Minimap update

		this.mmgraphics.clear()
		this.mmgraphics.beginFill(0xFFFFFF)
		
			// minimap itself
		this.mmgraphics.drawRoundedRect(this.mmgraphics.padding,this.camera.height-this.mmgraphics.padding-this.mmgraphics.screensizeH,this.mmgraphics.screensizeW,this.mmgraphics.screensizeH,5)
		
			// local player
		if (this.player) {
			this.mmgraphics.drawRect(this.player.x/this.mmgraphics.timesby+this.mmgraphics.padding,this.camera.height+this.player.y/this.mmgraphics.timesby-this.mmgraphics.padding-this.mmgraphics.screensizeH,10,10)
		}
		this.mmgraphics.endFill()

		// Hud Coin update

		this.coinCountText.text = numCoins

		// Player Movement Updates

		this.move()
		
		// Collision and Overlaps
		game.physics.arcade.collide(this.player, this.layers.collision_layer);
		//game.physics.arcade.collide(slimes, this.layers.collision_layer);
	//	game.physics.arcade.collide(this.player, slimes, this.slimeAttack, null, this);
	//	game.physics.arcade.overlap(this.player, this.coins, this.collectCoin, null, this)

		// Slime Movement

	//	this.moveTowardPlayer(slimes.children[0], 10)

        
    
    // Back up to Level 02 through Ladder
	
     if ((this.player.x < 120)  && (this.player.x >100) && (this.player.y>152) && (this.player.y <163))
        {
        startX = 500
        startY = 290
        this.game.state.start("level_02");
        }

    // Through portal to end game

    if ((this.player.x < 541) && (this.player.x > 538) && (this.player.y > 535) && (this.player.y < 540))
    {
        console.log("HERE")
        this.game.state.start("gameOver");

    }
		// Tile Properties Call for Debug purposes

		// if (this.leftKey.isDown || this.rightKey.isDown || this.upKey.isDown || this.downKey.isDown) {
		// 	this.getTileProperties(this.layers.collision_layer, this.player);
		// }


		//  map.setTileIndexCallback(26, hitCoin, this); Calls function based on index of tile
	},

	render: function(){
		//game.debug.bodyInfo(this.player, 16, 24);
		// Instructions:
		//game.debug.text( "Use arrow keys to move sprite around.", game.width/2, game.height-10 );
	//	game.debug.body(this.player) // Show hit box of player
	//	game.debug.body(slimes.children[0])
	},

	// Main Character Movement /////////////////////////////////////////////////

	move: function(){

		// Moving Left (Shift key for running)

		if (this.leftKey.isDown && (!jumpflag)) {
			this.player.body.velocity.x = -100;
			this.prevDir = 'left'
			
			if (this.shiftKey.isDown){
				this.player.body.velocity.x = -300
				this.player.animations.play('run_left');
			}
			else {
			this.player.animations.play('walk_left');
			}

		}

		// Moving Right (Shift key for running)

		else if (this.rightKey.isDown  && (!jumpflag)) {
			this.player.body.velocity.x = 100;
			this.prevDir = 'right'

			if (this.shiftKey.isDown){
				this.player.body.velocity.x = 300
				this.player.animations.play('run_right');
			}
			else {
				this.player.animations.play('walk_right');
				}
	

		}

		// Moving Up (Shift key for running)

		if (this.upKey.isDown) {
			this.player.body.velocity.y = -100;

			if (this.shiftKey.isDown){
				this.player.body.velocity.y = -300

				if(this.prevDir == 'left'){
					this.player.animations.play('run_left');
				}else{
					this.player.animations.play('run_right');
				}
			}
			else {
				if(this.prevDir == 'left'){
					this.player.animations.play('walk_left');
				}else{
					this.player.animations.play('walk_right');
				}
			}
		}

		// Moving Down (Shift key for running)

		else if (this.downKey.isDown) {
			this.player.body.velocity.y = 100;

			if (this.shiftKey.isDown){
				this.player.body.velocity.y = 300;

				if(this.prevDir == 'left'){
					this.player.animations.play('run_left');
				}else{
					this.player.animations.play('run_right');
				}
			}
			else {
				if(this.prevDir == 'left'){
					this.player.animations.play('walk_left');
				}else{
					this.player.animations.play('walk_right');
				}
			}
		}

		// Stop Moving

		if (!jumpflag && !deathFlag && !game.input.keyboard.isDown(Phaser.Keyboard.K) && !this.leftKey.isDown && !this.rightKey.isDown && !this.upKey.isDown && !this.downKey.isDown && !game.input.activePointer.leftButton.isDown) {
			this.stopMovement()
		}

		// Fix for velocity with two keys

		if (!this.leftKey.isDown && !this.rightKey.isDown ){
			this.player.body.velocity.x = 0;
		}

		if (!this.upKey.isDown && !this.downKey.isDown && !jumpflag){
			this.player.body.velocity.y = 0;
		}

		// Attack
			if (game.input.activePointer.leftButton.isDown && !jumpflag && !this.leftKey.isDown && !this.rightKey.isDown && !this.upKey.isDown && !this.downKey.isDown)
			{
				if(this.prevDir == 'left'){
					
					this.player.animations.play('attack_left');
				}else{
					this.player.animations.play('attack_right');
				}
			}

		// Die
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.K) && (deathFlag == false))
		{
            deathFlag = true;
            this.player.animations.play('die', 20, false);
          //  this.player.stop()
     
		}
		// Jump 
		// Note: This makes no sense in a top down RPG and is implemented only by course requirement

		if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && (!jumpflag) && !this.downKey.isDown && !this.upKey.isDown)
		{
			jumpflag = true
			this.player.body.velocity.y = -200;
			if(this.prevDir == 'left'){
				if (game.input.activePointer.leftButton.isDown){
					this.player.animations.play('jump_attack_left')}
				else{
					this.player.animations.play('jump_left')}
			}else{
				if (game.input.activePointer.leftButton.isDown){
					this.player.animations.play('jump_attack_right')}
				else{
					this.player.animations.play('jump_right')}
			
			}
			game.time.events.add(300, this.jumpBack, this);
		}

		if ((jumpflag) && (game.input.activePointer.leftButton.isDown))
		{
			if(this.prevDir == 'left'){
					
				this.player.animations.play('jump_attack_left');
			}else{
				this.player.animations.play('jump_attack_right');
			}
		}

	},

	jumpBack: function()
	{
		this.player.body.velocity.y = 200
		game.time.events.add(275, this.stopMovement, this);
		game.time.events.add(300, this.jumpPause,this);
	},

	jumpPause: function()
	{
		jumpflag= false;
	},

	stopMovement: function()
	{
		if(this.prevDir == 'left'){
			this.player.animations.play('idle_left');
		}else{
			this.player.animations.play('idle_right');
		}

		this.player.body.velocity.x = 0;
			this.player.body.velocity.y = 0;
	},

	getTileProperties: function (layer, player) {

		var x = layer.getTileX(player.x);
		var y = layer.getTileY(player.y);

		var tile = this.map.getTile(x, y, layer);

		console.log(tile);

	},

	createCoins: function(){

		for(var y = 0; y < this.map.height; ++y)
		{   
			for(var x = 0; x < this.map.width; x ++)
			{    
				var coinChance = Math.round(Math.random() * 100)
				var tile = this.map.getTile(x, y, this.layers.collision_layer);   
			
				if ((tile == null) && (coinChance <10))
				{
					
					var coin = this.coins.create(x*32, y*32, 'coinAnimation')
					coin.animations.add('coinSpin', [0,1,2,3], 20, true)
					coin.play('coinSpin')
				}   
			}
		}
		

	},

	collectCoin: function(player, coin){
		++numCoins
		coin.kill()

	},

	createSlimes: function(){

		var slime = slimes.create(200,300, 'slime')
		slime.animations.add('move_left', [13,14], 1, true)
		slime.play('move_left')
		slime.anchor.setTo(0.5,.5)
		slime.body.setSize (20,20, 5, 40)
		slime.body.collideWorldBounds = true;
		
	},

	// Griffin Code - https://github.com/rugbyprof/4353-MobileGameIntro/blob/master/Resources/dungeon_game/dungeon_zeta/js/ghosts.js

	moveTowardPlayer: function(enemy, speed){
		  // get differences in x and y locations between enemy and player
		  var xdiff = Math.abs(this.player.x - enemy.x);
		  var ydiff = Math.abs(this.player.y - enemy.y);

 
		  // Arbitrary buffer
		  var buffer = 5;
	  
		  // If the enemy is within buffer distance, set velocity to 
		  // zero so we don't get the jerky left / right behavior
		  if (xdiff < buffer) {
			  enemy.body.velocity.x = 0;
		  } else {
			  // Change velocity to keep moving toward player
			  if (this.player.x < enemy.x) {
				  enemy.body.velocity.x = -speed;
			  } else {
				  enemy.body.velocity.x = speed;
			  }
		  }
		//   If the enemy is within buffer distance, set velocity to 
		//   zero so we don't get the jerky up / down behavior		
		   if (ydiff < buffer) {
			  enemy.body.velocity.y = 0;
		  } else {
			  // Change velocity to keep moving toward player
			  if (this.player.y < enemy.y) {
				  enemy.body.velocity.y = -speed;
			  } else {
				  enemy.body.velocity.y = speed;
			  }
			}
		
	},

	slimeAttack: function (player, slime){

		//this.player.health = this.player.health - 0.5
		if (this.game.time.now > this.invincibleTimer) {
			this.player.damage(1);
			this.invincibleTimer = this.game.time.now + 1000;
		}

		// player is dead, start over
		if (this.player.health <= 0) {
			this.player.visible=true;
			this.player.exists=true;
		
			if (!deathFlag)
			{
			this.player.animations.play('die',20,false);
			deathFlag = true;
		
			game.time.events.add(600, this.playerDeath, this);
			}

		}
	},

	playerDeath: function (){
		game.lockRender=true;
		game.time.events.add(1000, this.restartLevel, this);
		
	},

	restartLevel: function(){
		this.game.state.start(currentLevel);

	}


	

}