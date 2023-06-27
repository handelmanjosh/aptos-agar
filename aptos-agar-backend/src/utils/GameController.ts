import { Socket } from "socket.io";
import { AIPlayer, Player, SuperPlayer } from "./Player";
import PowerUp, { CollectableSkin, DoubleFoodPowerUp, FoodPowerUp, FreezePowerUp, PlaceVirus, Recombine, SizePowerUp, SlowPowerUp, SpeedPowerUp, TripleFoodPowerUp, Virus } from "./PowerUp";
import { CheckRadialCollision, SpawnAway, locateable_distance } from "./utils";


export default class GameController {
    Players: SuperPlayer[];
    AIPlayers: AIPlayer[];
    PowerUps: PowerUp[];
    food: FoodPowerUp[];
    sockets: Socket[];
    virus: Virus[];
    globalMessages: Map<number, [string, string]>;
    constructor() {
        this.Players = [];
        this.PowerUps = [];
        this.sockets = [];
        this.AIPlayers = [];
        this.virus = [];
        this.food = [];
        this.globalMessages = new Map<number, [string, string]>();
    }
    allSubPlayers() {
        const all: Player[] = [];
        this.Players.forEach((player: SuperPlayer) => {
            all.push(...player.players);
        });
        return all;
    }
    genAIPlayer() {
        const position = SpawnAway([...this.allSubPlayers(), ...this.AIPlayers], 10, [10000, 10000]);
        const ai = new AIPlayer(position[0], position[1]);
        this.AIPlayers.push(ai);
    }
    genVirus() {
        const position = SpawnAway([...this.allSubPlayers(), ...this.AIPlayers], 10, [10000, 10000]);
        const virus = new Virus(position[0], position[1], true);
        this.virus.push(virus);
    }
    addPlayer(player: SuperPlayer) {
        this.Players.push(player);
    }
    remove(socket: Socket) {
        const index = this.Players.findIndex((player: SuperPlayer) => player.id === socket.id);
        this.Players.splice(index, 1);
        const index2 = this.sockets.findIndex((socket1: Socket) => socket1.id === socket.id);
        this.sockets.splice(index2, 1);
    }
    genFood() {
        const position = [Math.random() * 10000, Math.random() * 10000];
        const f = new FoodPowerUp(position[0], position[1]);
        this.food.push(f);
    }
    genPowerUp() {
        const loc = [Math.random() * 10000, Math.random() * 10000];
        const powerUp = Math.floor(Math.random() * 8);
        let power: PowerUp;
        switch (powerUp) {
            case 0:
                power = new SizePowerUp(loc[0], loc[1]);
                break;
            case 1:
                power = new SpeedPowerUp(loc[0], loc[1]);
                break;
            case 2:
                power = new PlaceVirus(loc[0], loc[1]);
                break;
            case 3:
                power = new Recombine(loc[0], loc[1]);
                break;
            case 4:
                power = new SlowPowerUp(loc[0], loc[1]);
                break;
            case 5:
                power = new TripleFoodPowerUp(loc[0], loc[1]);
                break;
            case 6:
                power = new DoubleFoodPowerUp(loc[0], loc[1]);
                break;
            default:
                power = new Recombine(loc[0], loc[1]);
                break;
        }
        this.PowerUps.push(power);
    }
    frame() {
        if (this.AIPlayers.length < 25) {
            this.genAIPlayer();
        }
        if (this.food.length < 1000) {
            this.genFood();
        }
        if (this.PowerUps.length < 50) {
            this.genPowerUp();
        }
        if (this.virus.length < 10) {
            this.genVirus();
        }
        this.virus.forEach((virus: Virus, i: number) => {
            if (virus.delete) {
                this.virus.splice(i, 1);
            } else {
                this.allSubPlayers().forEach((player: Player) => {
                    CheckRadialCollision(virus, player, () => {
                        if (player.radius > virus.radius && virus.canCollide) {
                            virus.powerUp(player.parent);
                        }
                    });
                });
            }
        });
        this.Players.forEach((player: SuperPlayer, i: number) => {
            if (player.delete) {
                this.Players.splice(i, 1);
                player.kill();
            } else if (player.players.length === 0) {
                player.delete = true;
            } else {
                player.move();
            }
        });
        this.AIPlayers.forEach((ai: AIPlayer, i: number) => {
            if (ai.delete) {
                this.AIPlayers.splice(i, 1);
            } else {
                ai.move();
            }
        });
        this.PowerUps.forEach((powerUp: PowerUp, i: number) => {
            if (powerUp.delete) {
                this.PowerUps.splice(i, 1);
            } else {
                powerUp.move();
            }
        });
        this.food.forEach((food: FoodPowerUp, i: number) => {
            if (food.delete) {
                this.food.splice(i, 1);
            }
        });
        this.check();
    }
    eat(player1: Player, player2: Player) {
        const key = Date.now();
        this.globalMessages.set(key, [player1.name ?? player1.id, player2.name ?? player2.id]);
        player1.eat(player2);
        player2.delete = true;
        setTimeout(() => {
            this.globalMessages.delete(key);
        }, 1500);
    }
    check() {
        this.food.forEach((food: FoodPowerUp) => {
            [...this.allSubPlayers(), ...this.AIPlayers].forEach((player: Player | AIPlayer) => {
                CheckRadialCollision(food, player, () => {
                    food.powerUp(player);
                });
            });
        });
        [...this.allSubPlayers(), ...this.AIPlayers].forEach((player: Player | AIPlayer) => {
            [...this.allSubPlayers(), ...this.AIPlayers].forEach((player2: Player | AIPlayer) => {
                if (player.id !== player2.id && !player.delete && !player2.delete) {
                    CheckRadialCollision(player, player2, () => {
                        if (player.radius > player2.radius) {
                            this.eat(player, player2);
                        } else if (player.radius < player2.radius) {
                            this.eat(player2, player);
                        }
                    });
                }
            });
        });
        this.PowerUps.forEach((powerUp: PowerUp, i: number) => {
            if (!powerUp.delete) {
                this.allSubPlayers().forEach((player: Player) => {
                    CheckRadialCollision(powerUp, player, () => {
                        //@ts-ignore
                        if (powerUp.collect) {
                            //if collect function exists
                            //@ts-ignore
                            powerUp.collect(player.parent);
                            player.parent.onCollect(powerUp.name);
                            powerUp.delete = true;
                        } else {
                            powerUp.powerUp(player);
                            powerUp.delete = true;
                        }
                    });
                });
            }
        });
    }
    asObjectList() {
        return [
            ...this.Players,
            ...this.PowerUps,
            ...this.AIPlayers,
            ...this.food,
            ...this.virus,
        ];
    }
    asSerializeable() {
        const objects: any[] = [];
        [
            ...this.Players,
            ...this.PowerUps,
            ...this.AIPlayers,
            ...this.food,
            ...this.virus,
        ].forEach(object => {
            objects.push(object.asSerializeable());
        });
        return objects;
    }
    getRelevantObjects(objects: { x: number, y: number; radius: number, id?: string; scale?: number; }[], id: string, distance: number) {
        const me = objects.find(object => object.id && object.id === id);
        if (me) {
            distance *= me.scale ?? 1;
            const finalObjects: any = [];
            for (let i = 0; i < objects.length; i++) {
                if (locateable_distance(objects[i], me) < distance) {
                    finalObjects.push(objects[i]);
                }
            }
            return finalObjects;
        } else {
            return objects;
        }
    }
    getLeaderboard(): [string, number][] {
        const playerRadius: [string, number][] = [];
        this.Players.forEach((player: SuperPlayer) => {
            let total = 0;
            player.players.forEach((player: Player) => {
                total += player.radius ** 2 * 3.14;
            });
            playerRadius.push([player.name ?? player.id, total]);
        });
        const sorted = playerRadius.sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
        const rewards = [.05, .03, .02, .01, .005];
        for (let i = 0; i < 5 && i < sorted.length; i++) {
            const p = this.Players.find(player => player.id === sorted[i][0]);
            if (p) {
                p.trophies += rewards[i];
            }
        }
        return sorted;
    }
    getGlobalMessages() {
        return Array.from(this.globalMessages).map((value: [number, [string, string]]) => value[1]);
    }
}