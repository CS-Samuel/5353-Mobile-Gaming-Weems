/**
 * Generated from the Phaser Sandbox
 *
 * //phaser.io/sandbox/CrtqUQIr
 *
 * This source requires Phaser 2.6.2
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.baseURL = 'http://examples.phaser.io/';
    game.load.crossOrigin = 'anonymous';
    game.load.image('phaser', 'assets/sprites/phaser-dude.png');
    game.load.tilemap('map', 'assets/tilemaps/csv/catastrophi_level2.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/tilemaps/tiles/catastrophi_tiles_16.png');
    game.load.image('player', 'assets/sprites/tinycar.png');

}

var map;
var layer;
var cursors;
var player;
var renderTexture;
var renderSprite;
var renderBitmap;
var help;
var zoom;
var mapSize = 400;

var renderType;

function create() {

    renderType = "renderTexture" // slightly buggy to start, off-map area doesn't render black
    //renderType = "bitmapData"
   

    game.physics.startSystem(Phaser.Physics.P2JS);

    //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
    map = game.add.tilemap('map', 16, 16);
 
    //  Now add in the tileset
    map.addTilesetImage('tiles');
   
    //  Create our layer
    layer = map.createLayer(0);
 
    //  Resize the world
    layer.resizeWorld();
 
    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(54, 83);
 
    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    game.physics.p2.convertTilemap(map, layer);
 
    //  Player
    player = game.add.sprite(48, 48, 'player');
  
    game.physics.p2.enable(player);
    player.body.rotation  = Math.PI;
   
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);
 
    game.camera.follow(player);
 
    //  Allow cursors to scroll around the map
    cursors = game.input.keyboard.createCursorKeys();
 
    help = game.add.text(16, 16, 'Arrows to move', { font: '14px Arial', fill: '#ffffff' });
    help.fixedToCamera = true;
   
    zoom = 0.5
   
    //renderTexture=game.add.renderTexture(200,200,"rt")
    //renderTexture.resolution=0.5
 
    renderGroup = game.add.group()
    
    var bg = game.add.graphics(0,0)
    bg.beginFill(0,1)
    bg.lineStyle(2, 0xFF0000, 1);
    bg.drawCircle(0,0,mapSize/2,mapSize/2)
    bg.endFill();
    renderGroup.add(bg)    
    
    if(renderType == "renderTexture") {
        renderTexture=game.add.renderTexture(mapSize,mapSize,"rt") // render()ing seems to have changed
        renderSprite=game.add.sprite(0,0,renderTexture)
    } else if(renderType=="bitmapData") {
        renderBitmap=game.add.bitmapData(mapSize,mapSize,"rt") 
        renderSprite=game.add.sprite(0,0,renderBitmap)
    }
   

    
   //renderSprite.scale.set(0.25) // render()ing seems to have changed.. can't use this now
    renderSprite.width=mapSize * zoom
    renderSprite.height=mapSize * zoom
    renderSprite.anchor.set(0.5)
  
    renderGroup.add(renderSprite)
   
    var mask = game.add.graphics(0, 0);
    //mask.lineStyle(2, 0xFF0000, 1);
    mask.beginFill(0xFF0000,0.1)
    mask.drawCircle(0,0,mapSize/2,mapSize/2);    
    mask.endFill()
    //mask.cacheAsBitmap=true // !!!! breaks mask in 2.4.4
    renderGroup.add(mask)
    renderSprite.mask=mask;
 
    
    var outline = game.add.graphics(0, 0);
    outline.lineStyle(2, 0xFF0000, 1);
    outline.drawCircle(0,0,mapSize/2,mapSize/2);    
    outline.endFill()
    renderGroup.add(outline)
 
    // renderGroup.x=650 /// !!!! needs camera offset now since fixed to camera
    // renderGroup.y=150
    renderGroup.cameraOffset.x=650
    renderGroup.cameraOffset.y=150
    renderGroup.fixedToCamera=true

}

function update() {
    
    if (cursors.left.isDown)
    {
        player.body.rotateLeft(100);
    }
    else if (cursors.right.isDown)
    {
        player.body.rotateRight(100);
    }
    else
    {
        player.body.setZeroRotation();
    }
 
    if (cursors.up.isDown)
    {
        player.body.thrust(400);
    }
    else if (cursors.down.isDown)
    {
        player.body.reverse(400);
    }
 
    
 
    w = layer.width
    h = layer.height
   
    
   
    var area = {x:Math.max(0,player.x-game.camera.x)-mapSize/2,y:Math.max(0,player.y-game.camera.y)-mapSize/2,width:mapSize,height:mapSize}
    // var area = {x:player.x-game.camera.x-mapSize/2,y:player.y-game.camera.y-mapSize/2,width:mapSize,height:mapSize}
    
    
    var translateX=0;
    var translateY=0;
    
    /*
    var dx = (player.x-game.camera.x)-mapSize/2
    var dy = (player.y-game.camera.y)-mapSize/2
    if(dx < 0) { translateX =Math.abs(dx) }
    if(dy < 0) { translateY = Math.abs(dy) }
    */

    
    if(renderType == "renderTexture") {
        // crop layer for render
        layer.setFrame(area)
        m = new Phaser.Matrix()
        
        m.translate(translateX, translateY)
        renderTexture.render(layer, m, true)
        // reset layer to original dimensions
        layer.setFrame({x:0, y:0, width:w, height:h})
        
    } else if (renderType=="bitmapData") {
        renderBitmap.clear();
        renderBitmap.copyRect(layer, area, 0,0, 1)
        
    }

    renderSprite.angle=-player.angle
}

function render() {

}
