// Now set up your game (most games will load a separate .js file)
var Q = Quintus()                          // Create a new engine instance
        .include("Sprites, Scenes, Input, 2D, Touch, UI") // Load any needed modules
        .setup({maximize:true})                           // Add a canvas element onto the page
        .controls()                        // Add in default controls (keyboard, buttons)
        .touch();                          // Add in touch support (for the UI)
              
var calm = 0;
        
// You can create a sub-class by extending the Q.Sprite class to create Q.Player
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {
    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      x: 575,           // You can also set additional properties that can
      y: 340,            // be overridden on object creation
    });
    
    // Add in pre-made components to get up and running quickly
    this.add('2d, platformerControls');
    
    // Write event handlers to respond hook into behaviors.
    // hit.sprite is called everytime the player collides with a sprite
    this.on("hit.sprite",function(collision) {
      // Check the collision, if it's the Tower, you win!
      if(collision.obj.isA("Tower")) {
        // Stage the endGame scene above the current stage
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        // Remove the player to prevent them from moving
        this.destroy();
      }
    });
  },

  step: function(dt) {
    if(Q.inputs['fire']){
      calm += 1;
    }else{
      calm -= 0.25
    }
    if(calm >= 100){
      calm = 100;
    }
    if(calm > 80) {
      this.p.lev = true;
      this.p.jumping = false;
      this.p.landed = 0.2;
    }
    if(calm <= 80) {
      this.p.lev = false;
    }
    if(calm <= 0){
      calm = 0;
    }
    Q.stageScene('hud', 2);

    this.p.gravityY = 980 * (1 - (calm/150));
  }
});

// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Tower", {
  init: function(p) {
    this._super(p, { sheet: 'tower' });
  }
});

// Create the Enemy class to add in some baddies
Q.Sprite.extend("Enemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100 });
    
    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce');
    
    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
        Q.stageScene("endGame",1, { label: "You Died" }); 
        collision.obj.destroy();
      }
    });
    
    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  }
});


// Create the EnemyFloat class to add in some baddies
Q.Sprite.extend("FloatEnemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100 });
    this.permaY = this.p.y

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce');
    
    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
        Q.stageScene("endGame",1, { label: "You Died" }); 
        collision.obj.destroy();
      }
    });
    
    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  },
  step: function (dt) {
    // this.p._super(dt);
    this.p.y = this.permaY - dt * this.p.vy;
  }
});



// Create a new scene called level 1
Q.scene("level1",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level.json',
                             sheet:     'tiles' }));
                             
  // Create the player and add him to the stage
  var player = stage.insert(new Q.Player());
  
  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  
  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 700, y: 200 }));
  stage.insert(new Q.Enemy({ x: 800, y: 200 }));
  stage.insert(new Q.Enemy({ x: 450, y: 390 }));

  for(var c = 0; c < 8; c++){
    stage.insert(new Q.FloatEnemy({ x: (Math.random() * 32 * 4) + 224, y: 624 - (c * 32)}));
  }
  // stage.insert(new Q.FloatEnemy({ x: 330, y: 424 }));
  // stage.insert(new Q.FloatEnemy({ x: 350, y: 456 }));
  // stage.insert(new Q.FloatEnemy({ x: 210, y: 490 }));
  // stage.insert(new Q.FloatEnemy({ x: 250, y: 522 }));
  // stage.insert(new Q.FloatEnemy({ x: 390, y: 554 }));
  // stage.insert(new Q.FloatEnemy({ x: 300, y: y - yup }));
  // stage.insert(new Q.FloatEnemy({ x: 220, y: 640 }));
  // stage.insert(new Q.FloatEnemy({ x: 220, y: 608 }));
  
  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 180, y: 275 }));

  stage.insert(new Q.UI.Text({x:player.x-50, y:player.y-50, label: "Calm: " + calm}));
});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));

  var strength = container.insert(new Q.UI.Text({x:50, y: 20,
    label: "Calm: " + parseInt(calm + "") + '%', color: "black" }));

  container.fit(20);
});

// To display a game over / game won popup box, 
// create a endGame scene that takes in a `label` option
// to control the displayed message.
Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
    Q.stageScene('hud', 2);
  });
  
  // Expand the container to visibily fit it's contents
  container.fit(20);
});

// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
Q.load("sprites.png, sprites.json, level.json, tiles.png",
  // The callback will be triggered when everything is loaded
  function() {
    // Sprites sheets can be created manually
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    
    // Or from a .json asset that defines sprite locations
    Q.compileSheets("sprites.png","sprites.json");
    
    // Finally, call stageScene to run the game
    Q.stageScene("level1");
    Q.stageScene("hud", 2);
  }
);
