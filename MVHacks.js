const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const keys = {};
const objects = [];
const waterProjectiles = [];
const gravity = 0.4; // Gravity force
const platforms = []; // Array to hold platforms
const fires = []; //array to hold fires
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

const Player = {
    x: 40,
    y: 20,
    size: 20,
    speed: 5,
    velocityY: 0, // Vertical velocity
    score: 0,
    onGround: false,
    direction: "up",
    damageable: true,
    deaths: 0,
    die: function () {
        Player.x = 40;
        Player.y = 20;
        Player.velocityY = 0;
        Player.deaths = Player.deaths + 1;

    },
    move: function (dx) {
        this.x += dx;
    },
    update: function (fire) {
        if (!this.onGround) {
            this.velocityY += gravity; // Apply gravity
        }
        this.y += this.velocityY;

        // Check collisions with platforms
        this.onGround = false;
        for (const platform of platforms) {
            if (
                this.x < platform.x + platform.width &&
                this.x + this.size > platform.x &&
                this.y + this.size > platform.y &&
                this.y + this.size <= platform.y + platform.length
            ) {
                this.y = platform.y - this.size; // Place player on top of the platform
                this.velocityY = 0; // Stop falling
                this.onGround = true;
                break;
            }
        }
    },
    draw: function () {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    },
    jump: function () {
        if (this.onGround) {
            this.velocityY = -10;
        }
    }
};

// player1 = new Player();
// water1 = new Water(Player);
// water1.x= 20;
// console.log(water1.x);
function play() {
    let audio = new Audio('playerDeath.mp3');
    audio.play().catch(error => console.error("Playback error:", error));
};
function jumpSound() {
    let audio = new Audio('playerJump.mp3');
    audio.play().catch(error => console.error("Playback error:", error));
}


function Water(x, y, direction) {
    this.x = x;
    this.y = y;
    this.speed = 15;
    this.size = 15;
    this.direction = direction;
    this.draw = function () {
        const image = new Image();
        image.src = 'waterBall.webp';
        ctx.drawImage(image, this.x, this.y, this.size, this.size);
    }
    this.collide = function (object) {
        if (
            this.x < object.x + object.size &&
            this.x + this.size > object.x &&
            this.y + this.size > object.y &&
            this.y + this.size <= object.y + object.size
        ) {

            return true;
        }
    },
        this.die = function () {
            this.y = -60;
            this.speed = 0;
        }
    this.tick = function () {
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
function Fire(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.dead = false;
    this.draw = function () {
        const image = new Image();
        image.src = 'fire.webp';
        ctx.drawImage(image, x, y, this.size, this.size);
    },
        this.die = function () {
            this.x = canvas.width + 20;
            this.y = -20;
            this.dead = true;
            play();
        }
    this.playerCollide = function (player) {
        if (
            this.x < player.x + player.size &&
            this.x + this.size > player.x &&
            this.y + this.size > player.y &&
            this.y + this.size <= player.y + player.size
        ) {
            return true;
        }
    }
    this.waterCollide = function (water) {
        if (
            this.x < water.x + water.size &&
            this.x + this.size > water.x &&
            this.y + this.size > water.y &&
            this.y + this.size <= water.y + water.size
        ) {
            this.die();
            water.collide();
        }
    }
}

function Platform(x, y, width, length, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.length = length;
    this.color = color;
    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.length);
    };
}
objects.push(Player);

const height = 20
const brown = '#964B00'
// Create platforms
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


const targetScore = fires.length;

for (const fire of fires) {
    objects.push(fire);
}
for (const platform in platforms) {
    objects.push(platform);
}
const BGImage = new Image(1400, 850);
BGImage.src = 'forest.webp';


function gameLoop() {
    ctx.clearRect(0, 0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(BGImage, 0, 0, 1400, 850);

    // Handle player movement
    if (keys['a']) {
        Player.move(-Player.speed);
    }
    if (keys['d']) {
        Player.move(Player.speed);
    }
    if (keys['w']) {
        Player.jump();
        jumpSound();
    }

    // Update and draw player
    Player.update();
    Player.draw();

    infoText.innerText = "Score: " + Player.score + "/" + targetScore + " Deaths: " + Player.deaths + ", A - Move left, D - Move right, W - Jump, Space - Shoot water, Arrow keys - Change direction of shooting water ";

    if (Player.y >= canvas.getAttribute("height")) {
        Player.die();
    }

    // Draw platforms
    for (const platform of platforms) {
        platform.draw();
    }

    // Draw fires and check collisions
    for (const fire of fires) {
        if (!fire.dead) {
            fire.draw();
        }
        if (fire.playerCollide(Player) && Player.damageable) {
            Player.die();
            play
        }
    }

    // Handle water projectiles
    for (const water of waterProjectiles) {
        if (this.y < 0 || this.y > canvas.getAttribute("height") || this.x < 0 || this.x > canvas.getAttribute("width")) {
            this.die();
            deleteFromArray(water, waterProjectiles);
        }
        else {
            water.draw();
            water.tick();
            for (const fire of fires) {
                if (water.collide(fire)) {
                    water.die();
                    deleteFromArray(water, waterProjectiles);
                    Player.score += 1;
                    fire.die();
                    deleteFromArray(fire, fires);
                }
            }
            for (const platform of platforms) {
                if (water.collide(platform)) {
                    water.die();
                    deleteFromArray(water, waterProjectiles);
                }
            }
        }
    }
    if (Player.score >= targetScore) {
        ctx.fillStyle = '#88E788';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = "50px Arial";
        ctx.fillText("You win!", canvas.width / 2 - 200, canvas.height / 2);
        ctx.fillText("Press F5 to play again", canvas.width / 2 - 200, canvas.height / 2 + 50);
        ctx.fillText("Points: " + Player.score + "/" + targetScore + " Deaths: " + Player.deaths, canvas.width / 2 - 200, canvas.height / 2 + 100);
        ctx.font = "20px Arial";
        ctx.fillText("These dangerous forest fires that you just put out occur all over the world, claiming lives and homes every time they happen.", canvas.width / 2 - 600, canvas.height / 2 + 150);
        ctx.fillText("We need to push for more preventative measures for these catastrophies in order to eliminate or mitigate the damages from wildfires.", canvas.width / 2 - 600, canvas.height / 2 + 180);
        ctx.fillText("Because gradual global warming and climate change is the primary cause of the increase in natural wildfires as of late, that should be our main priority.", canvas.width / 2 - 650, canvas.height / 2 + 210);
        ctx.fillText("Combatting global warming will not be easy, but we must work together to prevent this impending doom that is knocking on our door.", canvas.width / 2 - 600, canvas.height / 2 + 240);

    }
    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === 'ArrowRight') {
        Player.direction = "right";
        const water = new Water(Player.x, Player.y, Player.direction);
        waterProjectiles.push(water);
    }
    if (event.key === 'ArrowLeft') {
        Player.direction = "left";
        const water = new Water(Player.x, Player.y, Player.direction);
        waterProjectiles.push(water);
    }
    if (event.key === 'ArrowUp') {
        Player.direction = "up";
        const water = new Water(Player.x, Player.y, Player.direction);
        waterProjectiles.push(water);
    }
    if (event.key === "ArrowDown") {
        Player.direction = "down";
        const water = new Water(Player.x, Player.y, Player.direction);
        waterProjectiles.push(water);
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Start the game loop
BGImage.onload = function () {
    gameLoop();
};