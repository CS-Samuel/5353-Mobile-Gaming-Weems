var jumpflag = false;
var deathFlag = false;
var startX = 0
var startY = 768

var level_01 = {

	preload: function () {
		// Load tile map
		game.load.tilemap('classroom', 'Tileset/classroom.json', null, Phaser.Tilemap.TILED_JSON);
		//map tile images:
		game.load.image('floor', 'Tileset/floor.png');
		game.load.image('school', 'Tileset/school.png');
		game.load.image('floor2', 'Tileset/floor2.png')
		// Sprites for this Level
		game.load.image('teacher', 'assets/images/terry.png')
		game.load.image('teacherSpeech01', 'assets/images/teacherSpeechBubble.gif')
	},
	create: function () {
		
		
		// Mapping layers and tilesets
		/////////////////////////////////////////////////
		this.map = game.add.tilemap('classroom');
		this.map.addTilesetImage('floor', 'floor');
		this.map.addTilesetImage('school','school');
		this.map.addTilesetImage('floor2', 'floor2');
		
		this.layers = {
			ground_layer: this.map.createLayer('Floor'),
			decoration_layer: this.map.createLayer('Decorations'),
			collision_layer: this.map.createLayer('Boundary')
		};

		this.layers.ground_layer.resizeWorld();

		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.enable(this.layers.collision_layer);
		this.layers.collision_layer.alpha = 0

		this.map.setCollisionBetween(0,1, true, this.layers.collision_layer);
	

		this.prevDir = '';	// holds sprites previous direction (left , right) so
							// we can face the correct direction when using the 'idle' animation

		
		// Adding the knight atlas that contains all the animations
		this.player = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'knight_atlas');
		
	
		
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

		// turn physics on for player
		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;

		// set the anchor for sprite to middle of the view
		this.player.anchor.setTo(0.5);
		this.player.body.width=44;
		this.player.body.height=62;
	
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
		
		// Teacher Sprite
		
		this.teacher = game.add.sprite(120, 940, 'teacher')
		this.teacher.scale.setTo(.25,.25)
		this.teacherBubble = game.add.sprite (35,885, 'teacherSpeech01')
		this.teacherBubble.alpha=0


		// Add HUD background and attach to camera
		this.hudBackground = game.add.sprite(0,0, 'hudBackground')
		//this.player.addChild(this.hudBackground); // This command follows the player sprite
		this.hudBackground.fixedToCamera=true;

		// Health meter 

		// this.healthMeterText = this.game.add.plugin(Phaser.Plugin.HealthMeter);
		// this.healthMeterText.text(this.player, {x: 400, y: 20, font: {font: "22px arial", fill: "#ff0000" }});

		this.player.health=5;
		this.player.maxHealth=5;
		this.healthMeterIcons = this.game.add.plugin(Phaser.Plugin.HealthMeter);
		this.healthMeterIcons.icons(this.player, {icon: 'heart', x: 650, y: 10, width: 16, height: 16, rows:1} );

		
	},


	update: function () {

		this.move()
		
		game.physics.arcade.collide(this.player, this.layers.collision_layer);

		if ((this.player.x < 320) && (this.player.y > 1000))
		{
			this.teacherBubble.alpha=1
		}
		else{ this.teacherBubble.alpha=0}

		// if (this.leftKey.isDown || this.rightKey.isDown || this.upKey.isDown || this.downKey.isDown) {

		// 	this.getTileProperties(this.layers.collision_layer, this.player);
		// }
	},

	render: function(){
		//game.debug.bodyInfo(this.player, 16, 24);
		// Instructions:
		//game.debug.text( "Use arrow keys to move sprite around.", game.width/2, game.height-10 );
		//game.debug.body(this.player) // Show hit box of player
	},

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

	}









}