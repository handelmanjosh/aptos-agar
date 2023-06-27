import { Player, SuperPlayer } from "./Player";
import { findNearestPlayer, getRandomColor, randomBetween } from "./utils";
export const inventoryPowerUps: string[] = ["Size", "Speed", "PlaceVirus", "Recombine", "Slow", "DoubleFood", "TripleFood", "Freeze"];
//CHECK END OF FILE FOR CONSTRUCTORS
export default class PowerUp {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    delete!: boolean;
    name: string;
    constructor(x: number, y: number, vx: number, vy: number, radius: number, color: string, name: string) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.name = name;
        this.color = color;
    }
    powerUp(player: SuperPlayer | Player) { }
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
    asSerializeable() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            //@ts-ignore
            square: this.square
        };
    }
}

export class FoodPowerUp extends PowerUp {
    constructor(x: number, y: number) {
        super(x, y, 0, 0, randomBetween(5, 15), getRandomColor(), "FoodPowerUp");
    }
    powerUp(player: Player) {
        player.eat(this);
        this.delete = true;
    }
    move() { }
}
export class SpeedPowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "blue", "Speed");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("Speed")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        superPlayer.players.forEach((player: Player) => {
            player.parent.vMaxDelta = 5;
            setTimeout(() => {
                player.parent.vMaxDelta = 0;
            }, 10000);
        });
    }
    move() { }
}

export class SizePowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "red", "Size");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("Size")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        const totalFood = 100;
        const indivFood = totalFood / superPlayer.players.length;
        superPlayer.players.forEach((player: Player) => {
            player.eat({ radius: indivFood });
        });
    }
}

export class CollectableSkin extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "green", "CollectableSkinPowerUp");
        this.square = true;
    }
    powerUp(player: Player) {
        //todo: implement this function
    }
}

export class Virus extends PowerUp {
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    canCollide: boolean;
    psuedofriction: number;
    constructor(x: number, y: number, canCollide: boolean) {
        super(x, y, 0, 0, 40, "green", "Virus");
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.psuedofriction = .05;
        this.canCollide = canCollide;
    }
    powerUp(player: SuperPlayer) {
        this.delete = true;
        player.split();
        player.split();
        //todo: improve
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.ax;
        this.vy += this.ay;
        if (Math.abs(this.ax) < 2 * this.psuedofriction) {
            this.ay = 0;
        }
        if (Math.abs(this.ay) < 2 * this.psuedofriction) {
            this.ay = 0;
        }
        this.ay = this.ay < 0 ? this.ay + this.psuedofriction : this.ay - this.psuedofriction;
        this.ax = this.ax < 0 ? this.ax + this.psuedofriction : this.ax - this.psuedofriction;
    }
}
export class PlaceVirus extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "purple", "PlaceVirus");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("PlaceVirus")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        const virus = new Virus(superPlayer.x, superPlayer.y, false);
        virus.ax = -superPlayer.vx;
        virus.ay = -superPlayer.vy;
        superPlayer.game.virus.push(virus);
        setTimeout(() => {
            virus.canCollide = true;
        }, 500);

    }
}

export class Recombine extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "orange", "Recombine");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("Recombine")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        let totalArea = 0;
        superPlayer.players.forEach((player: Player) => {
            totalArea += Math.PI * player.radius ** 2;
        });
        const newRadius = Math.sqrt(totalArea / Math.PI);
        const newPlayer = new Player(superPlayer.x, superPlayer.y, 10, superPlayer.id, superPlayer.color, superPlayer);
        newPlayer.radius = newRadius;
        superPlayer.players = [newPlayer];
    }
    move() { }
}

export class SlowPowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "yellow", "Slow");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("Slow")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        const player = findNearestPlayer(superPlayer, superPlayer.game);
        if (player) {
            player.players.forEach((player: Player) => {
                player.vMax /= 2;
            });
            setTimeout(() => {
                player.players.forEach((player: Player) => {
                    player.vMax *= 2;
                });
            }, 10000);
        } else {
            superPlayer.inventory.get("Slow")!.push(this);
        }
    }
}

export class DoubleFoodPowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "pink", "DoubleFood");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("DoubleFood")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        if (superPlayer.eatMultiplier === 1) {
            superPlayer.eatMultiplier = 2;
            setTimeout(() => {
                superPlayer.eatMultiplier = 1;
            }, 10000);
        } else {
            superPlayer.inventory.get("DoubleFood")!.push(this);
        }
    }
}

export class TripleFoodPowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "magenta", "TripleFood");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("TripleFood")!.push(this);
    }
    powerUp(superPlayer: SuperPlayer) {
        if (superPlayer.eatMultiplier === 1) {
            superPlayer.eatMultiplier = 3;
            setTimeout(() => {
                superPlayer.eatMultiplier = 1;
            }, 10000);
        } else {
            superPlayer.inventory.get("TripleFood")!.push(this);
        }
    }
}

export class FreezePowerUp extends PowerUp {
    square: boolean;
    constructor(x: number, y: number) {
        super(x, y, 0, 0, 15, "light blue", "Freeze");
        this.square = true;
    }
    collect(player: SuperPlayer) {
        player.inventory.get("Freeze")!.push(this);
    }

    //unimplemented in game
}


export const inventoryPowerUpsContructors = [SizePowerUp, SpeedPowerUp, PlaceVirus, Recombine, SlowPowerUp, DoubleFoodPowerUp, TripleFoodPowerUp, FreezePowerUp];