export class Ability {
    constructor() {
        this.ready = true;
    }
    tick(){}
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
export class WaterAbility extends Ability {
    constructor(player) {
        super(player);
    }
    abilityActivation(direction) {
        const water = new Water(this.player.x, this.player.y, direction);
        waterProjectiles.push(water);
    }
}
export class LightningAbility extends Ability {
    constructor(player) {
        super(player);
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
        player.x = newX;
        player.y = newY;
        this.cooldownTimerStart();
    }
}
export class WindAbility1 extends CooldownAbility {
    constructor(player){
        super(player, 1000); // 1-second cooldown
    }
    abilityActivation(){
        this.player.velocityY -= 10;
        this.cooldownTimerStart();
    }

}
export class WindAbility2 extends DurationAbility {
    constructor(player){
        super(player, 1000, 2000); // 1-second duration, 2-second cooldown
    }
    abilityActivation(){
        this.player.speed = 10;
    }
    abilityDeactivation(){
        this.player.speed = 5;
        this.cooldownTimerStart(); // Start cooldown after deactivation
    }
}
export class GhostAbility extends DurationAbility {
    constructor(player,duration, cooldownTime) {
        super(player,duration, cooldownTime); // 10-second cooldown, 2-second duration
    }
    abilityActivation() {
        this.player.phaseable = true;
        this.durationTimerStart();
    }
    abilityDeactivation() {
        this.player.phaseable = false;
    }
}