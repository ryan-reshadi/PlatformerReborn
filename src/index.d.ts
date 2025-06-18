declare class VisibleObject {
    x: number;
    y: number;
    constructor(x: number, y: number);
    adjustOffset(dx: number): void;
}
export { VisibleObject };

declare class BackGround extends VisibleObject {
    image: HTMLImageElement;
    constructor(src: string);
    draw(): void;
}
export { BackGround };

declare class Player extends VisibleObject {
    startingPosition: { x: number, y: number };
    size: number;
    speed: number;
    velocityY: number;
    score: number;
    onGround: boolean;
    direction: string;
    damageable: boolean;
    deaths: number;
    elementIndex: number;
    phaseable: boolean;
    constructor(startingPosition: { x: number, y: number });
    setStartingPosition(startingPosition: { x: number, y: number }, sendPlayer?: boolean): void;
    die(): void;
    move(dx: number): void;
    update(): void;
    draw(): void;
    jump(): void;
}
export { Player };

declare class Ability {
    player: Player;
    ready: boolean;
    constructor(player: Player);
    tick(): void;
}
export { Ability };

declare class CooldownAbility extends Ability {
    cooldownTime: number;
    cooldownTimeRemaining: number;
    cooldownInterval: ReturnType<typeof setInterval> | null;
    constructor(player: Player, cooldownTime: number);
    tick(): void;
    cooldownTimerStart(): void;
}
export { CooldownAbility };

declare class DurationAbility extends CooldownAbility {
    duration: number;
    durationRemaining: number;
    active: boolean;
    durationInterval?: ReturnType<typeof setInterval> | null;
    constructor(player: Player, duration: number, cooldownTime: number);
    tick(): void;
    durationTimerStart(): void;
    abilityDeactivation(): void;
}
export { DurationAbility };

declare class ChargeUpAbility extends CooldownAbility {
    chargingUp: boolean;
    chargeLevel: number;
    chargeInterval: ReturnType<typeof setInterval> | null;
    maxCharge: number;
    constructor(player: Player, cooldownTime: number);
    beginCharging(): void;
    checkDischarge(key: string): void;
    discharge(): void;
}
export { ChargeUpAbility };

declare class WaterAbility extends Ability {
    constructor(player: Player);
    abilityActivation(direction: string): void;
}
export { WaterAbility };

declare class LightningAbility extends CooldownAbility {
    constructor(player: Player, cooldownTime: number);
    abilityActivation(blinkDirection: number, blinkDistance: number): void;
}
export { LightningAbility };

declare class LightningSuperAbility extends ChargeUpAbility {
    constructor(player: Player, cooldown: number);
    checkDischarge(key: string): void;
    discharge(): void;
    abilityActivation(): void;
}
export { LightningSuperAbility };

declare class WindAbility1 extends CooldownAbility {
    constructor(player: Player, cooldownTime: number);
    abilityActivation(): void;
}
export { WindAbility1 };

declare class WindAbility2 extends DurationAbility {
    constructor(player: Player, duration: number, cooldown: number);
    abilityActivation(): void;
    abilityDeactivation(): void;
}
export { WindAbility2 };

declare class GhostAbility extends DurationAbility {
    constructor(player: Player, duration: number, cooldownTime: number);
    abilityActivation(): void;
    abilityDeactivation(): void;
}
export { GhostAbility };

declare class Element {
    player: Player;
    abilities: Ability[];
    constructor(player: Player);
    keyChecker(key: string): void;
}
export { Element };

declare class WaterElement extends Element {
    constructor(player: Player);
    keyChecker(key: string): void;
}
export { WaterElement };

declare class WindElement extends Element {
    constructor(player: Player);
    keyChecker(key: string): void;
}
export { WindElement };

declare class LightningElement extends Element {
    blinkDistance: number;
    constructor(player: Player);
    keyChecker(key: string): void;
}
export { LightningElement };

declare class GhostElement extends Element {
    constructor(player: Player);
    keyChecker(key: string): void;
}
export { GhostElement };

declare class FireElement extends Element {}
export { FireElement };

declare class Water extends VisibleObject {
    size: number;
    speed: number;
    direction: string;
    image: HTMLImageElement;
    constructor(x: number, y: number, direction: string);
    draw(): void;
    collide(object: { x: number, y: number, size: number }): boolean;
    die(): void;
    tick(): void;
}
export { Water };

declare class Fire extends VisibleObject {
    size: number;
    dead: boolean;
    image: HTMLImageElement;
    constructor(x: number, y: number);
    draw(): void;
    die(): void;
    playerCollide(player: Player): boolean | undefined;
    waterCollide(water: Water): void;
}
export { Fire };

declare class Platform extends VisibleObject {
    width: number;
    length: number;
    color: string;
    phaseable: boolean;
    constructor(x: number, y: number, width: number, length: number, color: string, phaseable?: boolean);
    draw(): void;
}
export { Platform };

declare class MovingPlatform extends Platform {
    Xspeed: number;
    Yspeed: number;
    XLowerBound: number;
    XUpperBound: number;
    YLowerBound: number;
    YUpperBound: number;
    constructor(
        x: number, y: number, width: number, length: number, color: string,
        Xspeed: number, Yspeed: number,
        XLowerBound: number, YLowerBound: number, XUpperBound: number, YUpperBound: number
    );
    update(): void;
}
export { MovingPlatform };

declare function startLevel(level: number): void;
export { startLevel };
