const canvas = document.getElementById('myCanvas');

const ctx = canvas.getContext('2d');
const keys = {};
const objects = [];
const waterProjectiles = [];
const gravity = 0.4; // Gravity force
const platforms = []; // Array to hold platforms
const fires = []; //array to hold fires
var enemies = []; //array to hold enemies
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

export class VisibleObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // this.size = size;
    }
    adjustOffset(dx) {
        this.x += dx;
    }
}
export class BackGround extends VisibleObject {
    constructor(src){
        super(0,0);
        this.image = new Image();
        this.image.src = src;
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, canvas.width, canvas.height);
        // ctx.drawImage(this.image, this.x, this.y, this.image.width, canvas.height);
    }
}
var background = new BackGround('forest.webp'); // Create a new background instance
export class Player extends VisibleObject {
    constructor(startingPosition) {
        super(startingPosition.x, startingPosition.y); // Call the parent constructor with initial position and size
        this.startingPosition = startingPosition; // Starting position of the player
        // this.x = 40;
        // this.y = 20;
        this.size = 20;
        this.speed = 5;
        this.velocityY = 0; // Vertical velocity
        this.score = 0;
        this.onGround = false;
        this.direction = "up";
        this.damageable = true;
        this.deaths = 0;
        this.elementIndex = 0;
        this.phaseable = false;
    }
    setStartingPosition(startingPosition, sendPlayer = false) {
        this.startingPosition = startingPosition;
        if (sendPlayer) {
            this.x = startingPosition.x;
            this.y = startingPosition.y;
        }
    }
    die() {
        for (var i of objects) {
            i.x += offset;
        }
        offset = 0;
        this.x = this.startingPosition.x;
        this.y = this.startingPosition.y;
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
export class Ability {
    constructor(player) {
        this.player = player;
        this.ready = true;
    }
    tick() { }
}
export class CooldownAbility extends Ability {
    constructor(player, cooldownTime) {
        super(player);
        this.cooldownTime = cooldownTime;
        this.cooldownTimeRemaining = 0;
        this.cooldownInterval = null; // Initialize cooldown interval ID
    }
    tick() {
        if (this.cooldownTimeRemaining <= 0) {
            this.ready = true;
        }
    }
    cooldownTimerStart() {
        this.cooldownTimeRemaining = this.cooldownTime;
        this.ready = false; // Set ready to false when the ability is activated
        // Clear any existing interval to prevent multiple intervals
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }

        // Start a new interval
        this.cooldownInterval = setInterval(() => {
            this.cooldownTimeRemaining -= 100; // Decrement by 100ms
            if (this.cooldownTimeRemaining <= 0) {
                this.cooldownTimeRemaining = 0; // Ensure it doesn't go negative
                clearInterval(this.cooldownInterval); // Stop the interval
                this.cooldownInterval = null; // Reset the interval ID
            }
        }, 100); // Run every 100ms
    }
}
export class DurationAbility extends CooldownAbility {
    constructor(player, duration, cooldownTime) {
        super(player);
        this.cooldownTime = cooldownTime;
        this.cooldownTimeRemaining = 0;
        this.duration = duration;
        this.durationRemaining = 0;
        this.active = false;
    }
    tick() {
        if (this.durationRemaining <= 0 && this.cooldownTimeRemaining <= 0) {
            this.ready = true;
        }
        if (this.active && this.durationRemaining <= 0) {
            this.abilityDeactivation();
            this.active = false;
            this.cooldownTimerStart();
        }
    }
    durationTimerStart() {
        this.ready = false; // Set ready to false when the ability is activated
        this.active = true;
        this.durationRemaining = this.duration;

        // Clear any existing interval to prevent multiple intervals
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }

        // Start a new interval
        this.durationInterval = setInterval(() => {
            this.durationRemaining -= 100; // Decrement by 100ms
            if (this.durationRemaining <= 0) {
                this.durationRemaining = 0; // Ensure it doesn't go negative
                clearInterval(this.durationInterval); // Stop the interval
                this.durationInterval = null; // Reset the interval ID
            }
        }, 100);
    }
    abilityDeactivation() { }
}

export class ChargeUpAbility extends CooldownAbility {
    constructor(player, cooldownTime) {
        super(player, cooldownTime);
        this.chargingUp = false;
        this.chargeLevel = 0;
        this.chargeInterval = null;
        this.maxCharge = 5;
    }
    beginCharging() {
        // If an interval is running, return
        if (this.chargeInterval != null) {
            return;
        }
        this.chargingUp = true; // Set chargingUp to true
        // Start a new interval
        this.chargeInterval = setInterval(() => {
            if (this.chargeLevel < this.maxCharge) {
                this.chargeLevel += 0.1; // Increment by 0.1 every second
                // console.log("Charge Coefficient:", this.chargeCoefficient); // Debugging output
            } else {
                this.chargeLevel = this.maxCharge; // Cap at maxCoefficient
                clearInterval(this.chargeInterval); // Stop the interval
                this.chargeInterval = null; // Reset the interval ID
            }
        }, 100); // Run every 100ms (0.1 seconds)
    }
    checkDischarge(key) {
    }
    discharge(){}
}
export class WaterAbility extends Ability {
    constructor(player) {
        super(player);
    }
    abilityActivation(direction) {
        const water = new Water(this.player.x, this.player.y, direction);
        waterProjectiles.push(water);
    }
}
export class LightningAbility extends CooldownAbility {
    constructor(player, cooldownTime) {
        super(player, cooldownTime);
    }
    abilityActivation(blinkDirection, blinkDistance) {
        let newX = this.player.x;
        let newY = this.player.y;
        const step = 10;
        let currentX = this.player.x;
        for (let i = 0; i <= blinkDistance; i += step) {
            const testX = this.player.x + (blinkDirection * i);
            const isColliding = platforms.some(platform => {
                const isAbovePlatform = newY + this.player.size <= platform.y;
                const isBelowPlatform = newY >= platform.y + platform.length;
                const isLeftOfPlatform = testX + this.player.size <= platform.x;
                const isRightOfPlatform = testX >= platform.x + platform.width;

                return !(isAbovePlatform || isBelowPlatform || isLeftOfPlatform || isRightOfPlatform);
            });
            if (isColliding) break;
            newX = testX;
        }
        const spriteWidth = (newX - this.player.x); // Width based on blink distance
        const spriteHeight = this.player.size * 0.8; // Adjust height to 80% of the player's size

        // Adjust the vertical position to align the image with the player
        const spriteY = this.player.y + (this.player.size - spriteHeight) / 2;
        // Ensure the image is drawn after it loads

        ctx.drawImage(lightningSpriteImg, currentX + this.player.size, spriteY, spriteWidth, spriteHeight);
        this.player.x = newX;
        this.player.y = newY;
        this.cooldownTimerStart();
    }
}
export class LightningSuperAbility extends ChargeUpAbility {
    constructor(player, cooldown) {
        super(player, cooldown); // 1-second cooldown
    }
    checkDischarge(key) {
        if (this.ready && key === "r") {
            this.abilityActivation();
            this.discharge();
        }
    }
    discharge() {
        this.chargingUp = false;
        this.chargeLevel = 0;
        clearInterval(this.chargeInterval); // Stop the interval
        this.chargeInterval = null; // Reset the interval ID

        this.cooldownTimerStart(); // Start cooldown after discharge

    }
    abilityActivation() {

    }
}
export class WindAbility1 extends CooldownAbility {
    constructor(player, cooldownTime) {
        super(player, cooldownTime); // 1-second cooldown
    }
    abilityActivation() {
        this.player.velocityY = -10;
        this.cooldownTimerStart();
    }

}
export class WindAbility2 extends DurationAbility {
    constructor(player, duration, cooldown) {
        super(player, duration, cooldown); // 5-second duration, 3-second cooldown
    }
    abilityActivation() {
        this.player.speed = 10;
        this.durationTimerStart();
    }
    abilityDeactivation() {
        this.player.speed = 5;
        this.cooldownTimerStart(); // Start cooldown after deactivation
    }
}
export class GhostAbility extends DurationAbility {
    constructor(player, duration, cooldownTime) {
        super(player, duration, cooldownTime); // 10-second cooldown, 2-second duration
    }
    abilityActivation() {
        this.player.phaseable = true;
        this.durationTimerStart();
    }
    abilityDeactivation() {
        this.player.phaseable = false;
    }
}
export class Element {
    constructor(player) {
        this.player = player;
        this.abilities = [];
    }
    keyChecker(key) {

    }
}
export class WaterElement extends Element {
    constructor(player) {
        super(player);
        this.abilities = [new WaterAbility(player)];
    }
    keyChecker(key) {
        if (key === 'ArrowRight') {
            this.abilities[0].abilityActivation("right");
        }
        if (key === 'ArrowLeft') {
            this.abilities[0].abilityActivation("left");
        }
        if (key === 'ArrowUp') {
            // player.direction = "up";
            this.abilities[0].abilityActivation("up");
        }
        if (key === "ArrowDown") {
            this.abilities[0].abilityActivation("down");
        }
    }
}

export class WindElement extends Element {
    constructor(player) {
        super(player);
        this.abilities = [new WindAbility1(player, 1000), new WindAbility2(player, 5000, 3000)]; // 1-second cooldown
    }

    keyChecker(key) {
        if (this.abilities[0].ready && key === "ArrowUp" && !player.onGround) {
            this.abilities[0].abilityActivation();
            this.abilities[0].ready = false;
        }
        if (this.abilities[1].ready && (key === "ArrowLeft" || key == "ArrowRight")) {
            this.abilities[1].abilityActivation();
            this.abilities[0].ready = false;
        }
    }
}
export class LightningElement extends Element {
    constructor(player) {
        super(player);
        this.blinkDistance = 150; // Blink distance in pixels
        this.abilities = [new LightningAbility(player, 1000), new LightningSuperAbility(player, 10000)]; // 1-second cooldown
    }
    keyChecker(key) {
        if (this.abilities[0].ready) {
            if (key === 'ArrowRight') {
                this.abilities[0].abilityActivation(1, this.blinkDistance);
            }
            if (key === 'ArrowLeft') {
                this.abilities[0].abilityActivation(-1, this.blinkDistance);
            }
        }

        if (this.abilities[1].ready && key === "r") {
            this.abilities[1].beginCharging();
        }
    }
}
export class GhostElement extends Element {
    constructor(player,) {
        super(player);
        this.abilities = [new GhostAbility(player, 10000, 2000)]; // 1-second cooldown
    }
    keyChecker(key) {
        if (this.abilities[0].ready && key === "ArrowUp") {
            this.abilities[0].abilityActivation();
        }
    }
}
export class FireElement extends Element { }



const lightningElement = new LightningElement(player); // 1-second cooldown, 150 px blink distance
const waterElement = new WaterElement(player);
const windElement = new WindElement(player); // 1-second cooldown
const ghostElement = new GhostElement(player); // 2-second duration, 1 second cooldown
const elements = [waterElement, lightningElement, windElement, ghostElement];

var targetScore = 0; // Set the target score to 0 initially

function play() {
    let audio = new Audio('playerDeath.mp3');
    // audio.play().catch(error => console.error("Playback error:", error));
};
function jumpSound() {
    let audio = new Audio('playerJump.mp3');
    // audio.play().catch(error => console.error("Playback error:", error));
}

export class Water extends VisibleObject {
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

export class Fire extends VisibleObject {
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

export class Platform extends VisibleObject {
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

export class MovingPlatform extends Platform {
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

const height = 20;
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
    background.draw();


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
    ctx.fillText("Current Element: " + elementName, canvas.width - 300, 20);
    // if (elements[player.elementIndex] instanceof CooldownElement) {
    //     if (elements[player.elementIndex].cooldownTimeRemaining <= 0) {
    //         ctx.fillStyle = 'green';
    //         ctx.fillText("Status: Ready", canvas.width - 250, 40);
    //     }
    //     else {
    //         ctx.fillStyle = 'red';
    //         ctx.fillText("Status: Recharging - " + elements[player.elementIndex].cooldownTimeRemaining / 1000, canvas.width - 250, 40);
    //     }
    // }
    // if (elements[player.elementIndex] instanceof DurationElement) {
    //     if (elements[player.elementIndex].active) {
    //         ctx.fillStyle = 'green';
    //         ctx.fillText("Status: Active - " + elements[player.elementIndex].durationRemaining / 1000, canvas.width - 250, 60);
    //     }
    //     else {
    //         ctx.fillStyle = 'red';
    //         ctx.fillText("Status: Inactive", canvas.width - 250, 60);
    //     }
    // }
    abilityCount = 0;
    for (var ability of elements[player.elementIndex].abilities) {
        if (ability instanceof CooldownAbility) {
            if (ability.cooldownTimeRemaining <= 0) {
                ctx.fillStyle = 'green';
                ctx.fillText("Ability " + (abilityCount + 1) + " Status: Ready", canvas.width - 300, 40 + (abilityCount * 20));
            }
            else {
                ctx.fillStyle = 'red';
                ctx.fillText("Ability " + (abilityCount + 1) + " Status: Recharging - " + ability.cooldownTimeRemaining / 1000, canvas.width - 300, 40 + (abilityCount * 20));
            }

        }
        if (ability instanceof DurationAbility) {
            if (ability.active) {
                ctx.fillStyle = 'green';
                ctx.fillText("Ability " + (abilityCount + 1) + " Status: Active - " + ability.durationRemaining / 1000, canvas.width - 300, 60 + (abilityCount * 20));
            }
            else {
                ctx.fillStyle = 'red';
                ctx.fillText("Ability " + (abilityCount + 1) + " Status: Inactive", canvas.width - 300, 40 + (abilityCount * 20 + 20));
            }
        }
        if (ability instanceof ChargeUpAbility) {
            if (ability.chargingUp) {
                ctx.fillStyle = 'yellow';
                ctx.fillText("Ability " + (abilityCount + 1) + " Status: Charging - " + Math.round(ability.chargeLevel*100/ability.maxCharge) +"%", canvas.width - 300, 60 + (abilityCount * 20));
            }}
            else{

            }
        abilityCount += 1;
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
    for (var element of elements) {
        for (var ability of element.abilities) {
            ability.tick();
        }
    }
}

// Set the game loop to run at 60 frames per second
function startGameLoop() {
    var tickRate = 1000 / 60; // 60 frames per second
    setInterval(gameLoop, tickRate);
}

// Start the game loop
BGImage.onload = function () {
    startGameLoop();
};

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    // elements[player.elementIndex].keyHandler(event.key);
    elements[player.elementIndex].keyChecker(event.key);

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
    if (elements[player.elementIndex].abilities[1] instanceof ChargeUpAbility){
        elements[player.elementIndex].abilities[1].checkDischarge(event.key);
    }
    switch (player.elementIndex) {
        case 0:
            break;
        case 1:
            elements[player.elementIndex].abilities[1].checkDischarge(event.key);
            break;
        default:
            break;
    }
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
        player.setStartingPosition({ x: 50, y: 20 }, true); // Reset player starting position
        platforms.push(new Platform(50, 200, 200, height, brown));
        platforms.push(new Platform(250, 400, 75, height, brown));
        platforms.push(new Platform(225, 125, 200, 75, brown));
        platforms.push(new MovingPlatform(400, 500, 100, height, red, 3, 3, 400, 500, 600, 700)); // Moving platform
        fires.push(new Fire(100, 150));
        fires.push(new Fire(200, 300));
        background = new BackGround('forest.webp'); // Create a new background instance
    } else if (level === 2) {
        player.setStartingPosition({ x: 50, y: 20 }, true); // Reset player starting position
        fires.push(new Fire(100, 150));
        platforms.push(new Platform(50, 400, 200, height, brown));
        platforms.push(new Platform(250, 200, 75, height, brown));
        background = new BackGround('forest.webp'); // Create a new background instance
    } else if (level === 3) {
        player.setStartingPosition({ x: 50, y: 20 }, true); // Reset player starting position
        platforms.push(new Platform(50, 600, 300, height, brown));
        platforms.push(new Platform(400, 500, 150, height, brown));
        platforms.push(new Platform(700, 300, 100, height, brown));
        fires.push(new Fire(60, 550));
        fires.push(new Fire(450, 450));
        fires.push(new Fire(750, 250));
        fires.push(new Fire(800, 200));
        background = new BackGround('forest.webp'); // Create a new background instance
    }
    else if (level === 4) {
        player.setStartingPosition({ x: 50, y: 20 }, true); // Reset player starting position
        // platforms.push(new Platform(0,0, 1400, 700, brown));
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
        platforms.push(new Platform(250, 125, 300, height * 6, brown, true)); // tall wall

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
        background = new BackGround('forest.webp'); // Create a new background instance
    }
    for (i of fires) {
        objects.push(i);
    }
    for (i of platforms) {
        objects.push(i);
    }
    // Update target score to match the number of fires
    targetScore = fires.length; // Dynamically set targetScore here
    setTimeout(() => {
        player.deaths = 0;
    }, 200); // Delay for 1 second before setting player deaths to avoid issues where player would hit bottom random number of times
    // Start the game loop
    gameLoop();
}