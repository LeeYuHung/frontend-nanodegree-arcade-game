const ROW_HEIGHT = 83;
const COL_WIDTH = 101;
const TOP_PADDING = 20;

var global = this, canvas, ctx;

var Game = {
    score: 0,
    life: 3,
    role: [ "boy", "girl"],
    roleId: 0,
    allEnemies:[],
    player: "",
    pause: false,
    init: function() {
        canvas = document.createElement('canvas');
        canvas.width = 505;
        canvas.height = 606;
        document.body.appendChild(canvas);
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");
        ctx.textAlign = "center";
        ctx.font = "20pt Arial";  
        this.loadEntry();
    },
    bindEntryControl: function() {
        document.addEventListener('keyup',this.entryControl);
    },
    entryControl: function(e) {
        if (e.keyCode === 39 || e.keyCode === 37) {
            Game.roleId  = (Game.roleId + 1) % 2;
            Game.showRoleDescription(Game.role[Game.roleId]);
        }
        if (e.keyCode === 13) {
            Game.start();
        }
    },
    bindGameControl: function() {
        document.addEventListener('keyup', this.gameControl);
    },
    gameControl: function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        Game.player.handleInput(allowedKeys[e.keyCode]);
    },
    start: function() {
        document.removeEventListener('keyup', this.entryControl);
        this.bindGameControl();
        this.createPlayer();
        this.createEnemies();
        Game.pause = false;
        Engine(Game);
    },
    createPlayer: function() {
        var playerSprite = "images/char-" + this.role[this.roleId] + ".png";
        if (Game.role[Game.roleId] === "boy")
            this.player = new Player(playerSprite, 2, 5, 0.5, 2);
        else if (Game.role[Game.roleId] === "girl")
            this.player = new Player(playerSprite, 2, 5, 1, 1);

    },
    createEnemies: function() {
        var enemySprite = "images/enemy-bug.png";
        this.allEnemies.push(new Enemy(enemySprite, 1, 1, 200));
        this.allEnemies.push(new Enemy(enemySprite, 1, 2, 500));
        this.allEnemies.push(new Enemy(enemySprite, 1, 3, 400));
    },
    loadEntry: function() {
        imageBoy = new Image();
        imageBoy.src = "images/char-boy.png";
        imageGirl = new Image();
        imageGirl.src = "images/char-girl.png"

        this.bindEntryControl();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.onload = function() {
            Game.showRoleDescription(Game.role[0]);
        }
    },
    showRoleDescription: function() {
        var role_description = document.getElementById(this.role[this.roleId] + "-description").text;
        var posX = canvas.width * (this.roleId + 1) / 4, 
            posY = 310;
        this.clearRoleDescription();
        ctx.drawImage(imageBoy, canvas.width / 4, 250);
        ctx.drawImage(imageGirl, canvas.width * 2 / 4, 250);
        ctx.strokeRect(posX, posY, COL_WIDTH, ROW_HEIGHT);
        ctx.fillText(role_description, canvas.width / 2, 100);
    },
    clearRoleDescription: function() {
        var posX = canvas.width / 4 - 1, 
            posY = 309;
        ctx.clearRect(posX, posY, COL_WIDTH + 10, ROW_HEIGHT + 10);
        ctx.clearRect(posX * 2, posY, COL_WIDTH + 10, ROW_HEIGHT + 10);
        ctx.clearRect(0, 0, 500, 200);
    },
    end: function(result) {
        this.pause = true;
        ctx.fillText("You " + result + "!", canvas.width / 2, 40);
    },

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
    this.row = this.getRow();
    this.col = this.getCol();
};

// Draw the enemy on the screen, required method for game

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite, x, y, pace, life) {
    Character.call(this, sprite, x, y);
    this.pace = pace;
    this.life = life;
    this.invincible = false;
    this.invincibleTime = 0;
}
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
    if(this.invincible){
        if(Date.now() - this.invincibleTime > 1000) {
            this.invincible = false;
        }
    }
}
Player.prototype.attacked = function() {
    if (!this.invincible) {
        this.invincible = true;
        this.invincibleTime = Date.now();
        this.life -= 1;
    }
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
    this.col = this.getCol();
    this.row = this.getRow();
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
/*
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
*/