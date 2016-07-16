const ROW_HEIGHT = 83;
const COL_WIDTH = 101;
const TOP_PADDING = 20;

var global = this;

// This object record some game data.
var Game = {
    score: 0,
    life: 3,
    role: [ "boy", "girl"],
    roleImg: [],
    roleId: 0,
    allEnemies:[],
    player: "",
    stop: false,
    init: function() {
        this.createPlayer();
        this.createEnemies();
    },

    // This function add the role chosen by player to the game.
    createPlayer: function() {
        var playerSprite = "images/char-" + this.role[this.roleId] + ".png";
        if (Game.role[Game.roleId] === "boy")
            this.player = new Player(playerSprite, 2, 5, 0.5, 2);
        else if (Game.role[Game.roleId] === "girl")
            this.player = new Player(playerSprite, 2, 5, 1, 1);

    },

    // This function create enemy and add it to the game,
    // set enemy speed, position, and number here.
    createEnemies: function() {
        var enemySprite = "images/enemy-bug.png";
        this.allEnemies = [];
        this.allEnemies.push(new Enemy(enemySprite, 1, 1, 200));
        this.allEnemies.push(new Enemy(enemySprite, 1, 2, 500));
        this.allEnemies.push(new Enemy(enemySprite, 1, 3, 400));
    }

}

// Superclass for all the creatures in the game.
var Character = function(sprite, col, row) {
    this.sprite = sprite;
    this.x = col * COL_WIDTH;
    this.y = row * ROW_HEIGHT - TOP_PADDING;
    this.col = col;
    this.row = row;
}

// This function return the current row the character locate at.
Character.prototype.getRow = function() {
    return Math.floor((this.y + 20) / 83);
}

// This function return the current column the character locate at.
Character.prototype.getCol = function() {
    return Math.floor(this.x / 101);
}

// This function draw the character on the canvas
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Enemies our player must avoid
var Enemy = function(sprite, col, row, speed) {
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
    this.row = this.getRow();
    this.col = this.getCol();
};

var Player = function(sprite, x, y, pace, life) {
    Character.call(this, sprite, x, y);
    this.pace = pace;
    this.life = life;
    this.invincible = false;
    this.invincibleTime = 0;
}
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

// This function updated the player's position
Player.prototype.update = function() {
    if(this.invincible){
        if(Date.now() - this.invincibleTime > 1000) {
            this.invincible = false;
        }
    }
}

// This function is invoked when player hit by enemy,
// it sets player to ivincible and minus a life.
Player.prototype.attacked = function() {
    if (!this.invincible) {
        this.invincible = true;
        this.invincibleTime = Date.now();
        this.life -= 1;
    }
}

// This function defines how player character react with control buttons.
Player.prototype.handleInput = function(key) {
    if (key === 'up') 
        this.y -= ROW_HEIGHT * this.pace;
    else if(key === 'right')
        this.x += COL_WIDTH * this.pace;
    else if(key === 'down')
        this.y += ROW_HEIGHT * this.pace;
    else if(key === 'left')
        this.x -= COL_WIDTH * this.pace;
    this.col = this.getCol();
    this.row = this.getRow();
}