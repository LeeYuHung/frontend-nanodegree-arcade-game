/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.ssas
 */

var Engine = function() {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var lasttime,
        doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d');

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
    ctx.textAlign = "center";
    ctx.font = "20pt Arial";

    // This function load the entry page.
    function loadEntry() {
        document.addEventListener('keyup',entryControl);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        showRoleDescription(Game.role[0]);
    }

    // This function defines the control buttons in entry page.
    function entryControl(e) {
        if (e.keyCode === 39 || e.keyCode === 37) {
            Game.roleId  = (Game.roleId + 1) % 2;
            showRoleDescription();
        }
        if (e.keyCode === 13) {
            document.removeEventListener('keyup', this.entryControl);
            gameStart();
        }
    }

    // This function starts the game.
    function gameStart() {
        document.removeEventListener('keyup', entryControl);
        document.addEventListener('keyup', gameControl);
        Game.init();
        Game.stop = false;
        main();
    }

    // This function defines the control buttons in the game.
    function gameControl(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        Game.player.handleInput(allowedKeys[e.keyCode]);
    }

    // This function will show the role description and put a box around the selected role.
    function showRoleDescription() {
        var role_description = document.getElementById(Game.role[Game.roleId] +
                               "-description").text;
        var posX = canvas.width * (Game.roleId + 1) / 4, 
            posY = 310;
        clearRoleDescription();
        ctx.drawImage(Resources.get('images/char-boy.png'), canvas.width / 4, 250);
        ctx.drawImage(Resources.get('images/char-girl.png'), canvas.width * 2 / 4, 250);
        ctx.strokeRect(posX, posY, COL_WIDTH, ROW_HEIGHT);
        ctx.fillText(role_description, canvas.width / 2, 100);
    }

    // This function clear the role description shows on the page
    function clearRoleDescription() {
        var posX = canvas.width / 4 - 1, 
            posY = 309;
        ctx.clearRect(posX, posY, COL_WIDTH + 10, ROW_HEIGHT + 10);
        ctx.clearRect(posX * 2, posY, COL_WIDTH + 10, ROW_HEIGHT + 10);
        ctx.clearRect(0, 0, 500, 200);
    }

    // This function stop the game and output the game result also it bind the reset button
    function gameOver(result) {
        Game.stop = true;
        ctx.fillText("You " + result + "!", canvas.width / 2, 40);
        document.addEventListener('keyup', reset);
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();
        checkGameEnd();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if(!Game.stop)
            window.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //reset();
        lastTime = Date.now();
        loadEntry();
    }

    // this function check if the game is end.
    function checkGameEnd() {
        if (checkReachGoal())
            gameOver("win");
        if (Game.player.life == 0)
            gameOver("lose");
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (checkCollisions())
            Game.player.attacked();
    }

    // This function check if player has reached the goal.
    function checkReachGoal() {
        if (Game.player.row === 0)
            return true;
    }

    // This function check if player is hit by enemy.
    function checkCollisions() {
        var collision = false;
        Game.allEnemies.forEach(function(enemy) {
            if (enemy.row === Game.player.row &&
                enemy.col === Game.player.col) {
                collision = true;
            }
        });
        return collision;
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        Game.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        Game.player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col, image;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        ctx.clearRect(0 , 0, canvas.width, 50);
        for(var i = 0; i < Game.player.life; i++) {
            image = Resources.get('images/Heart.png');
            ctx.drawImage(image, canvas.width - (30 * i) - 45, 0, image.width / 3, image.height / 3);
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        Game.allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        if (Game.player.invincible)
            ctx.globalAlpha = 0.5
        Game.player.render();
        ctx.globalAlpha = 1;
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset(e) {
        if (e.keyCode === 13){
            document.removeEventListener('keyup', reset);
            document.removeEventListener('keyup', gameControl);
            document.removeEventListener('keyup', entryControl);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // game.showRoleDescription(Game.role[0]);
            loadEntry();
            Game.stop = false;
        }
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-girl.png',
        'images/Heart.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.canvas = canvas;
}; //(this);

window.onload = function() {
    Engine(Game);
}
