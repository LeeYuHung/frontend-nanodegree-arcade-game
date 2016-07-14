const ROW_HEIGHT = 83;
const COL_WIDTH = 101;
const TOP_PADDING = 20;

var Game = {
    score: 0,
    life: 3,
    role: "boy",
    canvas: "",
    ctx: "",
    init: function() {
        var canvas = document.createElement('canvas');
        canvas.width = 505;
        canvas.height = 606;
        document.body.appendChild(canvas);
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.loadEntry();
    },
    bind: function() {

    },
    start: function() {
        this.loadEntry();
    },
    loadEntry: function() {
       
        image = new Image();
        image.src = "images/char-boy.png";
        
        image.onload = function() {
            Game.ctx.drawImage(image, 120, 250);
            Game.ctx.drawImage(image, Game.canvas.width - 120 - image.width, 250);
            Game.showRoleDescription("role");  
        }
    },
    showRoleDescription: function(role) {
       
    }
}

Game.init();

var Character = function(sprite, col, row) {
    this.sprite = sprite;
    this.x = col * COL_WIDTH;
    this.y = row * ROW_HEIGHT - TOP_PADDING;
    this.col = col;
    this.row = row;
}
Character.prototype.getRow = function() {
    return Math.floor((this.y + 20) / 83);
}
Character.prototype.getCol = function() {
    return Math.floor(this.x / 101);
}
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Enemies our player must avoid
var Enemy = function(sprite, col, row, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    Character.call(this, sprite, col, row);
    this.speed = speed;
};

Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if(this.x > canvas.width)
        this.x = 0;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite, x, y, pace) {
    Character.call(this, sprite, x, y);
    this.pace = pace;
}
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {

}

Player.prototype.handleInput = function(key) {
    if (key === 'up') 
        this.y -= ROW_HEIGHT * this.pace;
    else if(key === 'right')
        this.x += COL_WIDTH * this.pace;
    else if(key === 'down')
        this.y += ROW_HEIGHT * this.pace;
    else if(key === 'left')
        this.x -= COL_WIDTH * this.pace;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var playerSprite = "images/char-boy.png", enemySprite = "images/enemy-bug.png";
var allEnemies = [], player = new Player(playerSprite, 2, 5, 1);
    allEnemies.push(new Enemy(enemySprite, 1, 1, 200));
    allEnemies.push(new Enemy(enemySprite, 1, 2, 500));
    allEnemies.push(new Enemy(enemySprite, 1, 3, 400));


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});