const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const keys = {};
const objects = [];
const waterProjectiles = [];
const gravity = 0.4; // Gravity force
const platforms = []; // Array to hold platforms
const fires = []; //array to hold fires
var offset = 0; //tracks objects offset
const lightningSpriteImg = new Image();
lightningSpriteImg.src = 'lightning-removebg-preview.png'; // Path to your lightning image
//const fireCrackles = new Audio("./fireCrackle.mp3");

//const pouringWater = new Audio("./pouringWater.mp3");
const infoText = document.getElementById("infoText");
const deleteFromArray = function (target, array) {
    returnArray = [];
    for (i of array) {
        if (i !== target) {
            returnArray.push(i);
        }
    }
    return returnArray;
} // Function to delete an element from an array, used for waterBall elements
const instructionAlert = function () {
    alert(
        'Instructions: \n' +
        'Use A to move left, D to move right, W to jump. \n' +
        'Press Space or number keys to cycle through elements \n' +
        'Use the arrow keys to use abilities. \n \n' +
        'Ability info: \n' +
        'Wind: press up arrow in mid air to double jump \n' +
        'Water: use arrow keys to shoot water projectiles in different directions \n' +
        'Lightning: press left or right arrow keys to blink in that direction \n' +
        'Ghost: press up arrow to phase through specific walls for a short time'
    )
}
class Element {
    constructor(abilityFunction, cooldown = 0) {
        this.enabled = true;
        this.abilityFunction = abilityFunction;
        if (cooldown === 0) {
            this.hasCooldown = false;
        }
        else {
            this.hasCooldown = true;
            this.cooldown = cooldown;
        }
        // if (duration === 0){
        //     this.hasDuration = false;
        // }
        // else{
        //     this.hasDuration= true;
        //     this.duration = duration;
        // }
    }
    ability(key) {
        if (this.enabled) {
            if (this.abilityFunction(key) && this.hasCooldown) { //this line checks if the ability has a cooldown, but due to the nature of the "abilityFunction" methods, the check of the return will also run the ability, making sure that if the ability doesn't have a cooldown, the ability is still ran while also negating the cooldown check
                this.enabled = false;
                this.cooldownTimerStart();
            }
        }
    }
    cooldownTimerStart() {
        this.enabled = false;
        setTimeout(() => {
            this.enabled = true;
        }, this.cooldown);
    }
}

class DurationElement extends Element {
    constructor(activateAbilityFunction, deactivateAbilityFunction, cooldown = 0, duration = 0) {
        super(activateAbilityFunction, cooldown);
        this.deactivateAbilityFunction = deactivateAbilityFunction;
        this.active = false;
        if (duration === 0) {
            this.hasDuration = false;
        }
        else {
            this.hasDuration = true;
            this.duration = duration;
        }
    }
    ability(key) {
        if (this.enabled) {
            ; // Check if the ability is on cooldown   
            if (this.abilityFunction(key) && this.hasCooldown) {
                this.enabled = false;
                if (this.hasDuration) {
                    this.active = true;
                    this.durationTimerStart(key);
                }
            }
        }
    }
    durationTimerStart(key) {
        setTimeout(() => {
            this.cooldownTimerStart();
            this.deactivateAbilityFunction(key);
            this.active = false;
        }, this.duration);
    }
}

// class LightningElement extends Element {
//     constructor(abilityFunction={},cooldown = 0){
//         super(abilityFunction,cooldown);
//     }

// }
// class WaterElement extends Element {
//     constructor(abilityFunction={},cooldown = 0){
//         super(abilityFunction,cooldown);
//     }
// }

const lightningAbilityFunction = (key) => {
    var activated = true;
    let newX = player.x;
    let newY = player.y;
    let blinkDistance = 150; // Maximum distance to teleport
    const step = 10; // Step size for incremental teleportation
    let currentX = player.x;
    if (key === 'ArrowRight') {
        for (let i = 0; i <= blinkDistance; i += step) {
            const testX = player.x + i;
            const isColliding = platforms.some(platform => {
                const isAbovePlatform = newY + player.size <= platform.y;
                const isBelowPlatform = newY >= platform.y + platform.length;
                const isLeftOfPlatform = testX + player.size <= platform.x;
                const isRightOfPlatform = testX >= platform.x + platform.width;

                return !(isAbovePlatform || isBelowPlatform || isLeftOfPlatform || isRightOfPlatform);
            });
            if (isColliding) break;
            newX = testX;
        }
    } else if (key === 'ArrowLeft') {
        for (let i = 0; i <= blinkDistance; i += step) {
            const testX = player.x - i;
            const isColliding = platforms.some(platform => {
                const isAbovePlatform = newY + player.size <= platform.y;
                const isBelowPlatform = newY >= platform.y + platform.length;
                const isLeftOfPlatform = testX + player.size <= platform.x;
                const isRightOfPlatform = testX >= platform.x + platform.width;

                return !(isAbovePlatform || isBelowPlatform || isLeftOfPlatform || isRightOfPlatform);
            });
            if (isColliding) break;
            newX = testX;
        }
    } else {
        activated = false;
    }
    if (activated){
        const spriteWidth = (newX - player.x); // Width based on blink distance
        const spriteHeight = player.size * 0.8; // Adjust height to 80% of the player's size

        // Adjust the vertical position to align the image with the player
        const spriteY = player.y + (player.size - spriteHeight) / 2;
        // Ensure the image is drawn after it loads

        ctx.drawImage(lightningSpriteImg, currentX + player.size, spriteY, spriteWidth, spriteHeight);
    }

    // Update player position
    player.x = newX;
    player.y = newY;
    return activated;
};
const waterAbilityFunction = (key) => {
    var activated = false;
    if (key === 'ArrowRight') {
        player.direction = "right";
        const water = new Water(player.x, player.y, player.direction);
        waterProjectiles.push(water);
        activated = true;
    }
    if (key === 'ArrowLeft') {
        player.direction = "left";
        const water = new Water(player.x, player.y, player.direction);
        waterProjectiles.push(water);
        activated = true;
    }
    if (key === 'ArrowUp') {
        // player.direction = "up";
        player.direction = "up";
        const water = new Water(player.x, player.y, player.direction);
        waterProjectiles.push(water);
        activated = true;
    }
    if (key === "ArrowDown") {
        player.direction = "down";
        const water = new Water(player.x, player.y, player.direction);
        waterProjectiles.push(water);
        activated = true;
    }
    return activated;
}
const windAbilityFunction = (key) => {
    var activated = false;
    if (key === "ArrowUp" || key === "W" && !player.onGround) {
        player.velocityY = -10; // Jump
        activated = true;
    }
    return activated;
}
const ghostAbilityFunction = (key) => {
    var activated = false;
    if (key === "ArrowUp") {
        player.phaseable = true;
        activated = true;
    }
    return activated;
}
const ghostAbilityDeactivateFunction = () => {
    player.phaseable = false;
}
const lightningElement = new Element(lightningAbilityFunction, 1000); // 1-second cooldown
const waterElement = new Element(waterAbilityFunction);
const windElement = new Element(windAbilityFunction, 1000); // 1-second cooldown
const ghostElement = new DurationElement(ghostAbilityFunction, ghostAbilityDeactivateFunction, 1000, 2000); // 2-second duration, 1 second cooldown
const elements = [waterElement, lightningElement, windElement, ghostElement];
class VisibleObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // this.size = size;
    }
    adjustOffset(dx) {
        this.x += dx;
    }
}
class Player extends VisibleObject {
    constructor() {
        super(40, 20); // Call the parent constructor with initial position and size
        // this.x = 40;
        // this.y = 20;
        this.size = 20;
        this.speed = 5;
        this.velocityY = 0; // Vertical velocity
        this.score = 0;
        this.onGround = false;
        this.direction = "up";
        this.damageable = true;
        this.deaths = -1;
        this.elementIndex = 0;
        this.phaseable = false;
    }
    die() {
        for (var i of objects) {
            i.x += offset;
        }
        offset = 0;
        this.x = 40;
        this.y = 20;
        this.velocityY = 0;
        this.deaths = this.deaths + 1;
    }
    move(dx) {
        this.x += dx;
    }
    update() {
        if (!this.onGround) {
            this.velocityY += gravity; // Apply gravity
        }
        this.y += this.velocityY;

        // Check collisions with platforms
        this.onGround = false;
        for (const platform of platforms) {
            const isAbovePlatform = this.y + this.size <= platform.y;
            const isBelowPlatform = this.y >= platform.y + platform.length;
            const isLeftOfPlatform = this.x + this.size <= platform.x;
            const isRightOfPlatform = this.x >= platform.x + platform.width;

            // Skip collision checks for phaseable platforms if the player is phaseable
            if (platform.phaseable && this.phaseable) {
                continue;
            }

            // Check if hitting the platform from above
            if (
                !isBelowPlatform &&
                !isLeftOfPlatform &&
                !isRightOfPlatform &&
                this.velocityY >= 0 && // Ensure the player is moving downward or stationary
                this.y + this.size > platform.y && // Ensure the player is overlapping the platform
                this.y < platform.y // Ensure the player is above the platform
            ) {
                this.y = platform.y - this.size; // Place player on top of the platform
                this.velocityY = 0; // Stop falling
                this.onGround = true;

                // Move with the platform if it's a moving platform
                if (platform instanceof MovingPlatform) {
                    this.x += platform.Xspeed;
                    this.y += platform.Yspeed;
                }
                break;
            }

            // Check if hitting the platform from below
            if (
                !isAbovePlatform &&
                !isLeftOfPlatform &&
                !isRightOfPlatform &&
                this.velocityY < 0 && // Ensure the player is moving upward
                this.y < platform.y + platform.length && // Ensure the player is overlapping the platform
                this.y + this.size > platform.y // Ensure the player is below the platform
            ) {
                this.velocityY = 0; // Stop upward movement
                break; // Prevent teleportation to the bottom of the platform
            }

            // Check if hitting the platform from the left
            if (
                !isAbovePlatform &&
                !isBelowPlatform &&
                this.x + this.size > platform.x &&
                this.x < platform.x &&
                this.y + this.size > platform.y && // Ensure the player is within the platform's vertical bounds
                this.y < platform.y + platform.length
            ) {
                this.x = platform.x - this.size; // Push player to the left of the platform
            }

            // Check if hitting the platform from the right
            if (
                !isAbovePlatform &&
                !isBelowPlatform &&
                this.x < platform.x + platform.width &&
                this.x + this.size > platform.x + platform.width &&
                this.y + this.size > platform.y && // Ensure the player is within the platform's vertical bounds
                this.y < platform.y + platform.length
            ) {
                this.x = platform.x + platform.width; // Push player to the right of the platform
            }
        }
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    jump() {
        if (this.onGround) {
            this.velocityY = -10;
        }
    }
}

var targetScore = 0; // Set the target score to 0 initially
const player = new Player(); // Create a new player instance

function play() {
    let audio = new Audio('playerDeath.mp3');
    // audio.play().catch(error => console.error("Playback error:", error));
};
function jumpSound() {
    let audio = new Audio('playerJump.mp3');
    // audio.play().catch(error => console.error("Playback error:", error));
}

class Water extends VisibleObject {
    constructor(x, y, direction) {
        super(x, y); // Call the parent constructor with initial position and size
        // this.x = x;
        // this.y = y;
        this.size = 15;
        this.speed = 15;
        this.direction = direction;
        this.image = new Image();
        this.image.src = 'waterBall.png';
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
    collide(object) {
        if (
            this.x < object.x + object.size &&
            this.x + this.size > object.x &&
            this.y + this.size > object.y &&
            this.y + this.size <= object.y + object.size
        ) {
            return true;
        }
        return false;
    }
    die() {
        this.y = -60;
        this.speed = 0;
    }
    tick() {
        if (this.direction === "left") {
            this.x = this.x - this.speed;
        }
        if (this.direction === "right") {
            this.x = this.x + this.speed;
        }
        if (this.direction === "up") {
            this.y = this.y - this.speed;
        }
        if (this.direction === "down") {
            this.y = this.y + this.speed;
        }
    }

}

class Fire extends VisibleObject {
    constructor(x, y) {
        super(x, y); // Call the parent constructor with initial position and size
        // this.x = x;
        // this.y = y;
        this.size = 30;
        this.dead = false;
        this.image = new Image();
        this.image.src = 'fire.webp';
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
    die() {
        this.x = canvas.width + 20;
        this.y = -20;
        this.dead = true;
        play();
    }
    playerCollide(player) {
        if (
            this.x < player.x + player.size &&
            this.x + this.size > player.x &&
            this.y + this.size > player.y &&
            this.y + this.size <= player.y + player.size
        ) {
            return true;
        }
    }
    waterCollide(water) {
        if (
            this.x < water.x + water.size &&
            this.x + this.size > water.x &&
            this.y < water.y + water.size &&
            this.y + this.size > water.y
        ) {
            this.die();
            water.collide();
        }
    }
}

class Platform extends VisibleObject {
    constructor(x, y, width, length, color, phaseable = false) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.width = width;
        this.length = length;
        this.color = color;
        this.phaseable = phaseable;
    }
    draw() {
        if (this.phaseable && player.phaseable) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red for phaseable platforms
        }
        else {
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(this.x, this.y, this.width, this.length);
    }

}

class MovingPlatform extends Platform {
    constructor(x, y, width, length, color, Xspeed, Yspeed, XLowerBound, YLowerBound, XUpperBound, YUpperBound) {
        super(x, y, width, length, color);
        this.Xspeed = Xspeed;
        this.Yspeed = Yspeed;
        this.XLowerBound = XLowerBound;
        this.XUpperBound = XUpperBound;
        this.YLowerBound = YLowerBound;
        this.YUpperBound = YUpperBound;
    }
    update() {
        this.x += this.Xspeed;
        this.y += this.Yspeed;
        if (this.x <= this.XLowerBound || this.x >= this.XUpperBound) {
            this.Xspeed = -this.Xspeed; // Reverse direction on X-axis
        }
        if (this.y <= this.YLowerBound || this.y >= this.YUpperBound) {
            this.Yspeed = -this.Yspeed; // Reverse direction on Y-axis
        }
    }
}
objects.push(player);

const height = 20
const brown = '#964B00'; // Brown color for platforms
const red = '#FF0000'; // Red color for fire
const BGImage = new Image(1400, 850);
BGImage.src = 'forest.webp';
var currentLevel = 1; // Define a global variable to track the current level
// Ensure the title screen is displayed on page load
window.onload = function () {
    document.getElementById('titleScreen').style.display = 'flex';
    canvas.style.display = 'none';
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(BGImage, 0, 0, 1400, 850);


    // Handle player movement
    if (keys['a']) {
        player.move(-player.speed);
    }
    if (keys['d']) {
        player.move(player.speed);
    }
    if (keys['w']) {
        player.jump();
        jumpSound();
    }

    // Update and draw player
    player.update();
    player.draw();

    if (player.y >= canvas.getAttribute("height")) {
        player.die();
    }

    // Draw platforms
    for (const platform of platforms) {
        platform.draw();
        if (platform instanceof MovingPlatform) {
            platform.update();
        }
    }

    // Draw fires and check collisions
    for (var fire of fires) {
        if (!fire.dead) {
            fire.draw();
        }
        if (fire.playerCollide(player) && player.damageable) {
            player.die();
        }
    }
    if (player.x >= canvas.getAttribute("width")) {

        offset += player.speed;
        for (const object of objects) {
            // object.x -= player.speed;
            object.adjustOffset(-player.speed);
        }
    }
    if (player.x <= 0) {

        offset -= player.speed;
        for (const object of objects) {
            // object.x += player.speed;
            object.adjustOffset(player.speed);
        }
    }
    // Handle water projectiles
    for (let i = waterProjectiles.length - 1; i >= 0; i--) {
        const water = waterProjectiles[i];
        if (water.y < 0 || water.y > canvas.height || water.x < 0 || water.x > canvas.width) {
            water.die();
            waterProjectiles.splice(i, 1); // Remove the water projectile
        } else {
            water.draw();
            water.tick();
            for (const fire of fires) {
                if (water.collide(fire)) {
                    water.die();
                    waterProjectiles.splice(i, 1); // Remove the water projectile
                    player.score += 1;
                    fire.die();
                    deleteFromArray(fire, fires);
                    break;
                }
            }
            for (const platform of platforms) {
                if (
                    water.x + water.size > platform.x &&
                    water.x < platform.x + platform.width &&
                    water.y + water.size > platform.y &&
                    water.y < platform.y + platform.length
                ) {
                    water.die();
                    waterProjectiles.splice(i, 1); // Remove the water projectile
                    break;
                }
            }
        }
    }
    switch (currentLevel) {
        case 1:
            var textColor = "white";
            break;
        case 2:
            var textColor = "white";
            break;
        case 3:
            var textColor = "white";
            break;
        case 4:
            var textColor = "white";
            break;
        default:
            var textColor = "white";
            break;
    }
    ctx.fillStyle = textColor;
    ctx.font = "20px Arial";
    ctx.fillText("Level " + currentLevel, 10, 20);
    ctx.fillText("Score: " + player.score + "/" + targetScore, 10, canvas.height - 20);
    ctx.fillText("Deaths: " + player.deaths, 10, canvas.height - 40);
    ctx.fillText("Press I for instructions", 10, canvas.height - 60);
    switch (player.elementIndex) {
        case 0:
            var elementName = "Water";
            break;
        case 1:
            var elementName = "Lightning";
            break;
        case 2:
            var elementName = "Wind";
            break;
        case 3:
            var elementName = "Ghost";
            break;
        default:
            var elementName = "Unknown Element";
            break;

    }
    ctx.fillText("Current Element: " + elementName, canvas.width - 250, 20);
    if (elements[player.elementIndex].hasCooldown) {
        if (elements[player.elementIndex].enabled) {
            ctx.fillStyle = 'green';
            ctx.fillText("Status: Ready", canvas.width - 250, 40);
        }
        else {
            ctx.fillStyle = 'red';
            ctx.fillText("Status: Recharging", canvas.width - 250, 40);
        }
    }
    if (elements[player.elementIndex].hasDuration) {
        if (elements[player.elementIndex].active) {
            ctx.fillStyle = 'green';
            ctx.fillText("Status: Active", canvas.width - 250, 60);
        }
        else {
            ctx.fillStyle = 'red';
            ctx.fillText("Status: Inactive", canvas.width - 250, 60);
        }
    }
    if (player.score >= targetScore) {
        ctx.fillStyle = '#88E788';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = "50px Arial";
        ctx.fillText("You win!", canvas.width / 2 - 200, canvas.height / 2);
        ctx.fillText("Press F5 to play again", canvas.width / 2 - 200, canvas.height / 2 + 50);
        ctx.fillText("Points: " + player.score + "/" + targetScore + " Deaths: " + player.deaths, canvas.width / 2 - 200, canvas.height / 2 + 100);
        ctx.font = "20px Arial";
        ctx.fillText("These dangerous forest fires that you just put out occur all over the world, claiming lives and homes every time they happen.", canvas.width / 2 - 600, canvas.height / 2 + 150);
        ctx.fillText("We need to push for more preventative measures for these catastrophies in order to eliminate or mitigate the damages from wildfires.", canvas.width / 2 - 600, canvas.height / 2 + 180);
        ctx.fillText("Because gradual global warming and climate change is the primary cause of the increase in natural wildfires as of late, that should be our main priority.", canvas.width / 2 - 650, canvas.height / 2 + 210);
        ctx.fillText("Combatting global warming will not be easy, but we must work together to prevent this impending doom that is knocking on our door.", canvas.width / 2 - 600, canvas.height / 2 + 240);

    }
}

// Set the game loop to run at 60 frames per second
function startGameLoop() {
    const tickRate = 1000 / 60; // 60 frames per second
    setInterval(gameLoop, tickRate);
}

// Start the game loop
BGImage.onload = function () {
    startGameLoop();
};

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    elements[player.elementIndex].ability(event.key);

    switch (event.key) {
        case ' ':
            player.elementIndex += 1;
            if (player.elementIndex >= elements.length) {
                player.elementIndex = 0;
            }
            break;
        case "i":
            instructionAlert();
            break;
        case '1':
            player.elementIndex = 0;
            break;
        case '2':
            player.elementIndex = 1;
            break;
        case '3':
            player.elementIndex = 2;
            break;
        case '4':
            player.elementIndex = 3;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function startLevel(level) {
    // Set the current level globally
    currentLevel = level;

    // Hide the title screen and show the game canvas
    document.getElementById('titleScreen').style.display = 'none';
    canvas.style.display = 'block';

    // Clear existing platforms and fires
    platforms.length = 0;
    fires.length = 0;

    // Load level-specific platforms and fires
    if (level === 1) {
        platforms.push(new Platform(50, 200, 200, height, brown));
        platforms.push(new Platform(250, 400, 75, height, brown));
        platforms.push(new Platform(225, 125, 200, 75, brown));
        platforms.push(new MovingPlatform(400, 500, 100, height, red, 3, 3, 400, 500, 600, 700)); // Moving platform
        fires.push(new Fire(100, 150));
        fires.push(new Fire(200, 300));
    } else if (level === 2) {
        fires.push(new Fire(100, 150));
        platforms.push(new Platform(50, 400, 200, height, brown));
        platforms.push(new Platform(250, 200, 75, height, brown));
    } else if (level === 3) {
        platforms.push(new Platform(50, 600, 300, height, brown));
        platforms.push(new Platform(400, 500, 150, height, brown));
        platforms.push(new Platform(700, 300, 100, height, brown));
        fires.push(new Fire(60, 550));
        fires.push(new Fire(450, 450));
        fires.push(new Fire(750, 250));
        fires.push(new Fire(800, 200));
    }
    else if (level === 4) {
        platforms.push(new Platform(50, 200, 200, height, brown));
        platforms.push(new Platform(250, 400, 75, height, brown));
        platforms.push(new Platform(450, 400, 75, height, brown));
        platforms.push(new Platform(650, 320, 20, height * 5, brown)); // tall wall
        platforms.push(new Platform(620, 450, 20, height, brown)); // small platform
        platforms.push(new Platform(480, 500, 80, height, brown));
        // Jump over wall
        platforms.push(new Platform(300, 670, 100, height, brown));
        platforms.push(new Platform(490, 630, 20, height * 2.5, brown));
        platforms.push(new Platform(600, 670, 70, height, brown));

        platforms.push(new Platform(800, 670, 70, height, brown));
        // Elevator
        platforms.push(new Platform(1070, 670, 150, height, brown));
        platforms.push(new Platform(250, 125, 20, height * 6, brown, true)); // tall wall

        for (let i = 90; i <= 90 * 4; i = i + 90) {
            platforms.push(new Platform(1100, 670 - i, 110, height, brown));
        }

        // Create fires
        fires.push(new Fire(100, 150));
        fires.push(new Fire(200, 300));
        fires.push(new Fire(700, 200));
        fires.push(new Fire(750, 200));
        fires.push(new Fire(1000, 200));
        fires.push(new Fire(1100, 100));
        fires.push(new Fire(1300, 200));
        fires.push(new Fire(300, 450));
        fires.push(new Fire(800, 450));
        fires.push(new Fire(1000, 475));
        fires.push(new Fire(500, 550));
        fires.push(new Fire(600, 600));
    }
    for (i of fires) {
        objects.push(i);
    }
    for (i of platforms) {
        objects.push(i);
    }
    // Update target score to match the number of fires
    targetScore = fires.length; // Dynamically set targetScore here

    // Start the game loop
    gameLoop();
}