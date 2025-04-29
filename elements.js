import { Ability, CooldownAbility, DurationAbility } from './abilities.js';
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
        this.abilities = [new CooldownAbility(player, 1000)]; // 1-second cooldown
    }
    
    keyChecker(key) {
        if (this.ready && key === "ArrowUp" && !player.onGround) {
            this.abilityActivation();
            this.ready = false;
        }
    }
}
export class LightningElement extends Element {
    constructor(player,blinkDistance) {
        super(player);
        this.blinkDistance = blinkDistance;
        this.abilities = [new LightningAbility(player, 1000)]; // 1-second cooldown
    }
    keyChecker(key) {
        if (this.ready) {
            if (key === 'ArrowRight') {
                this.abilityActivation(1);
            }
            if (key === 'ArrowLeft') {
                this.abilityActivation(-1);
            }
        }
    }
}
export class GhostElement extends Element {
    constructor(player) {
        super(player);
    }
    keyChecker(key) {
        if (this.ready && key === "ArrowUp") {
            this.abilityActivation();
        }
    }
}
export class FireElement extends Element { }

