var preload = {
	preload:function(){
		console.log("preload.js");
		game.stage.backgroundColor = game.globals.bg_color;

		var loading_border = this.add.image(game.width/2,game.height/2,'loading_border')
		loading_border.anchor.setTo(.5,.5)
		var loading = this.add.sprite(game.width/2,game.height/2,'loading')
		loading.anchor.setTo(.5,.5)
		this.load.setPreloadSprite(loading)
		
		
		// game entities/world
		game.load.image('pause', 'assets/images/pause.png')
		game.load.image('space', 'assets/images/space.jpg')
		game.load.image('bullet', 'assets/laserBlue02.png');
		game.load.image('starfield', 'assets/images/starfield.png');
		game.load.image('retical', 'assets/images/retical.png');

		// Load all my new obstacles
		for(i=0;i<game.globals.obstacle_icons.length;i++){
			name = game.globals.obstacle_icons[i];
			game.load.image('icon-'+name, 'assets/icon-'+name+'.png');
		}

		game.load.spritesheet('kaboom', 'assets/sprites/explode.png', 128, 128);
		//game.load.spritesheet('earth', 'assets/sprites/Earth.png', 213,160,13);
		game.load.spritesheet('earth', 'assets/sprites/Earth4.png', 85,85,48);
		game.load.atlas('ufoAtlas','assets/sprites/ufo-sheet_2.png','assets/sprites/ufo-atlas_2.json');
		game.load.spritesheet('explosionAnimation', 'assets/images/explosionAnimation.png', 64, 64);
		game.load.spritesheet('planet1', 'assets/animatedPlanet1.png', 72,72, 17)
		game.load.spritesheet('planet2', 'assets/animatedPlanet2.png', 64,64)
		game.load.spritesheet('planet3', 'assets/animatedPlanet3.png', 64,64, 17)
		// audio
		game.load.audio('bg_spin', 'assets/sounds/spin_bg_music.mp3')
		game.load.audio('bg_edm', 'assets/sounds/edm_bg_music.mp3')
		game.load.audio('score', 'assets/sounds/score.wav')
		game.load.audio('kill', 'assets/sounds/Ouch.ogg')
		game.load.audio('music', 'assets/sounds/abstractionRapidAcrobatics.wav')

		// font
		game.load.bitmapFont('fontUsed', 'assets/font/ganonwhite/font.png', 'assets/font/ganonwhite/font.xml');
		game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
	},
	
	create:function(){
		
		game.state.start('mainMenu');
	}
}