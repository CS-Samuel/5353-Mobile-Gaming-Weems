var preload = function(){}

preload.prototype = {
	preload:function(){
		console.log("preload.js");
		this.game.stage.backgroundColor = BG_COLOR

		var loading_border = this.add.image(this.game.width/2,this.game.height/2,'loading_border')
		loading_border.anchor.setTo(.5,.5)
		var loading = this.add.sprite(this.game.width/2,this.game.height/2,'loading')
		loading.anchor.setTo(.5,.5)
		this.load.setPreloadSprite(loading)
		
		// game entities/world
		this.load.image('player', 'images/fly01.png')
		this.load.image('crashImage', 'images/crash.png')
		this.load.image('obstacle', 'images/upPipe.png')
		this.load.image('pause', 'images/pause.png')
		this.load.image('bg', 'images/BG.png')
		this.load.image('shield', 'images/shield.png')
		this.load.image('sawBlade', 'images/sawBlade.png')
		this.load.image('bullet', 'images/bullet.png')
		this.load.spritesheet('explosionAnimation', 'images/explosionAnimation.png', 64,  64);
		// audio
		this.load.audio('bg_spin', 'sounds/spin_bg_music.mp3')
		this.load.audio('bg_edm', 'sounds/edm_bg_music.mp3')
		this.load.audio('score', 'sounds/score.wav')
		this.load.audio('crashSound', 'sounds/crash.mp3')
		this.load.audio('music', 'sounds/abstractionRapidAcrobatics.wav')
		this.load.audio('explosion', 'sounds/explosion.mp3')

		// font
		this.game.load.bitmapFont('fontUsed', 'font/ganonwhite/font.png', 'font/ganonwhite/font.xml');

	},
	
	create:function(){
		
		this.game.state.start('mainMenu')
	}
}