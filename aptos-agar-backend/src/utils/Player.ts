import { Socket } from "socket.io";
import PowerUp, { inventoryPowerUps, inventoryPowerUpsContructors } from "./PowerUp";
import { array_distance, getRandomColor } from "./utils";
import { HexString, AptosAccount } from "aptos";
import { mintDouble, mintMass, mintRecombine, mintSize, mintSlow, mintSpeed, mintTriple, mintTrophy, mintVirus } from "./aptos_mint";
import GameController from "./GameController";

const scaleByRadius = (radius: number) => {
    return 1 + radius / 1000;
};

export class SuperPlayer {
    players: Player[];
    canSplit: boolean;
    id: string;
    delete!: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    vMaxDelta: number;
    color: string;
    trophies: number;
    key?: string;
    inventory: Map<string, PowerUp[]>;
    onCollect: (name: string) => any;
    sendEat: (n: number) => any;
    kill: () => any;
    name?: string;
    scale: number;
    publicKey: string;
    game: GameController;
    eatMultiplier: number;
    individualMessages: Map<number, string>;
    constructor(x: number, y: number, vMax: number, id: string, onCollect: (name: string) => any, sendEat: (n: number) => any, getSocket: () => Socket, publicKey: string, game: GameController) {
        //add ondeath event that sends a message to the client saying that the player died
        this.players = [];
        this.game = game;
        this.id = id;
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.vx = 0;
        this.vMaxDelta = 0;
        this.publicKey = publicKey;
        this.color = getRandomColor();
        this.eatMultiplier = 1;
        this.individualMessages = new Map();
        this.inventory = new Map<string, PowerUp[]>();
        for (const item of inventoryPowerUps) {
            this.inventory.set(item, []);
        }
        const player = new Player(x, y, vMax, id, this.color, this);
        this.players.push(player);
        this.canSplit = true;
        this.trophies = 0;
        this.scale = 1;
        this.onCollect = onCollect;
        this.sendEat = (radius: number) => {
            sendEat(radius);
            const totalRadius = this.getTotalEffectiveRadius();
            this.scale = scaleByRadius(totalRadius);
        };
        this.kill = async () => {
            //fix issue mass decimals
            const mass = Math.round(this.getTotalMass() / 100);
            const trophies = Math.round(this.trophies);
            getSocket().emit("dead", { mass: mass / 10, powerUps: this.serializeInventory(), trophies });
            for (const [name, number] of this.serializeInventory()) {
                if (number > 0) {
                    // ["Size", "Speed", "Place Virus", "Recombine", "Freeze", "Double Food", "Triple Food", "Slow"]
                    switch (name) {
                        case "Size":
                            await mintSize(new HexString(this.publicKey), number);
                            break;
                        case "Speed":
                            await mintSpeed(new HexString(this.publicKey), number);
                            break;
                        case "Place Virus":
                            await mintVirus(new HexString(this.publicKey), number);
                            break;
                        case "Recombine":
                            await mintRecombine(new HexString(this.publicKey), number);
                            break;
                        case "Freeze":
                            break;
                        case "Double Food":
                            await mintDouble(new HexString(this.publicKey), number);
                            break;
                        case "Triple Food":
                            await mintTriple(new HexString(this.publicKey), number);
                            break;
                        case "Slow":
                            await mintSlow(new HexString(this.publicKey), number);
                            break;
                    }
                }
            }
            //await mintTrophy(new HexString(this.publicKey), Math.floor(trophies));
            await mintMass(new HexString(this.publicKey), mass);
        };
    }
    getMessages() {
        return Array.from(this.individualMessages).map((value: [number, string]) => value[1]);
    }
    setName(name: string): undefined {
        this.name = name;
        this.players.forEach((player: Player) => player.name = name);
    }
    getTotalEffectiveRadius(): number {
        return Math.sqrt(this.players.reduce((acc: number, current: Player) => acc + current.radius ** 2 * Math.PI, 0) / Math.PI);
    }
    getTotalMass() {
        //use 3.14 for simplicity
        return this.players.reduce((acc: number, current: Player) => acc + (current.radius ** 2 * 3.14), 0);
    }
    addPowerUps(powerUps: [string, number]) {
        const name = inventoryPowerUps.indexOf(powerUps[0]);
        const constructor = inventoryPowerUpsContructors[name];
        for (let i = 0; i < powerUps[1]; i++) {
            this.inventory.get(powerUps[0])!.push(new constructor(0, 0));
        }
    }
    serializeInventory(): [string, number][] {
        return Array.from(this.inventory).map((value: [string, PowerUp[]]) => {
            return [value[0], value[1].length];
        });
    }
    usePowerUp(name: string) {
        let available = this.inventory.get(name);
        if (available && available.length > 0) {
            console.log("used power up: " + name);
            const powerUp = available.pop()!;
            powerUp.powerUp(this);
        }
    }
    split() {
        if (this.canSplit) {
            this.canSplit = false;
            console.log("split");
            const newPlayers: Player[] = [];
            for (const player of this.players) {
                const players = player.split(this);
                newPlayers.push(...players);
            }
            this.players = newPlayers;
            setTimeout(() => {
                this.canSplit = true;
            }, 500);
        }
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > 10000) this.x = 10000;
        if (this.y > 10000) this.y = 10000;
        this.players.forEach((player: Player, i: number) => {
            if (player.delete) {
                this.players.splice(i, 1);
            } else {
                player.move();
            }
        });
    }
    asSerializeable() {
        return {
            x: this.x,
            y: this.y,
            id: this.id,
            players: this.players.map(player => player.asSerializeable()),
            scale: this.scale,
        };
    }
    updateVelocity(x: number, y: number, width: number, height: number) {
        let playerPos = [width / 2, height / 2];
        // this.setAngle(x, y, width, height);
        let xDiff = x - playerPos[0];
        let yDiff = y - playerPos[1];

        const { radius } = this.players.length > 0 ? this.players.reduce((prev, current) => (prev.radius > current.radius) ? prev : current) : { radius: 10 };

        let maxDiff = radius * 3;

        let rx = xDiff / maxDiff;
        let ry = yDiff / maxDiff;

        if (rx > 1) rx = 1;
        if (rx < -1) rx = -1;
        if (ry > 1) ry = 1;
        if (ry < -1) ry = -1;
        let { vMax } = this.players.length > 0 ? this.players.reduce((prev, current) => (prev.vMax > current.vMax) ? current : prev) : { vMax: 10 };
        vMax += this.vMaxDelta;
        this.vx = vMax * rx;
        this.vy = vMax * ry;
        this.players.forEach(player => {
            player.vx = this.vx;
            player.vy = this.vy;
        });
    }
}
export class Player {
    x: number;
    y: number;
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    psuedofriction: number;
    vMax: number;
    radius: number;
    color: string;
    id: string;
    delete!: boolean;
    parent: SuperPlayer;
    name?: string;
    constructor(x: number, y: number, vMax: number, id: string, color: string, parent: SuperPlayer) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.vMax = vMax;
        this.radius = 10;
        this.id = id;
        this.parent = parent;
        this.color = color;
        this.ax = 0;
        this.ay = 0;
        this.psuedofriction = .1;
    }
    split(controller: SuperPlayer): Player[] {
        if (this.radius < 30) return [this];
        const angle = Math.atan2(controller.vy, controller.vx);

        const newPlayer = new Player(this.x, this.y, this.vMax, this.id, this.parent.color, this.parent);
        const mass = this.radius ** 2 * 3.14 / 2;
        newPlayer.radius = Math.sqrt(mass / 3.14);
        newPlayer.ax = Math.cos(angle) * 2;
        newPlayer.ay = Math.sin(angle) * 2;
        this.radius = Math.sqrt(mass / 3.14);
        this.ax = -Math.cos(angle) * 2;
        this.ay = -Math.sin(angle) * 2;

        return [newPlayer, this];
    }
    eat(obj: { radius: number; }) {
        if (this.parent) {
            obj.radius *= this.parent.eatMultiplier;
            this.parent.sendEat(obj.radius);
        }
        const objArea = Math.PI * obj.radius ** 2;
        const newArea = Math.PI * this.radius ** 2 + objArea;

        const newRadius = Math.sqrt(newArea / Math.PI);
        const radiusDelta = (newRadius - this.radius) / 10;
        let i = 0;

        const interval = setInterval(() => {
            this.radius += radiusDelta;
            i++;
            if (i > 10) {
                clearInterval(interval);
            }
        }, 10);
    }
    move() {
        this.x += this.vx + this.ax;
        this.y += this.vy + this.ay;
        this.ax = this.ax < 0 ? this.ax + this.psuedofriction : this.ax - this.psuedofriction;
        this.ay = this.ay < 0 ? this.ay + this.psuedofriction : this.ay - this.psuedofriction;
        if (Math.abs(this.ay) < 0.5) this.ay = 0;
        if (Math.abs(this.ax) < 0.5) this.ax = 0;

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > 10000) this.x = 10000;
        if (this.y > 10000) this.y = 10000;
    }
    asSerializeable() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            id: this.id,
            color: this.color,
            name: this.name,
        };
    }
}

const aiNames = ["Betsy", "Gertrude", "Bobby", "Donald", "Marcus Aurelius", "Bob", "Cathy", "Karen", "Shawn", "Satoshi"];
export class AIPlayer extends Player {
    target: [number, number] | undefined;
    constructor(x: number, y: number) {
        //@ts-ignore
        super(x, y, 10, undefined, getRandomColor(), undefined);
        this.name = aiNames[Math.floor(Math.random() * aiNames.length)];
    }
    move() {
        if (this.target) {
            this.x += this.vx;
            this.y += this.vy;
            const distance = array_distance(this.target, [this.x, this.y]);
            if (distance < 5) {
                this.target = undefined;
            }
        } else {
            this.target = [Math.random() * 10000, Math.random() * 10000];
            const [dx, dy] = [this.target[0] - this.x, this.target[1] - this.y];
            const angle = Math.atan2(dy, dx);
            this.vx = this.vMax * Math.cos(angle);
            this.vy = this.vMax * Math.sin(angle);
        }
    }
}
const options = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ";
const generateRandomId = (): string => {
    let result = "";
    for (let i = 0; i < 10; i++) {
        result += options[Math.floor(Math.random() * options.length)];
    }
    return result;
};
