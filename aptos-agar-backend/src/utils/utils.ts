import GameController from "./GameController";
import { SuperPlayer } from "./Player";


type Locateable = {
    x: number,
    y: number,
};
type Collideable = {
    x: number,
    y: number,
    radius: number;
};
export const array_distance = (a: number[], b: number[]): number => {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};
export const locateable_distance = (l1: Locateable, l2: Locateable): number => {
    return Math.sqrt((l1.x - l2.x) ** 2 + (l1.y - l2.y) ** 2);
};

export function CheckRadialCollision(c1: Collideable, c2: Collideable, onCollision: () => any) {
    const distance = locateable_distance(c1, c2);
    if (distance < c1.radius || distance < c2.radius) {
        onCollision();
    }
}
//checks if c1 covered c2
export function CheckCover(c1: Collideable, c2: Collideable, onCover: () => any) {
    const [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
    const angle = Math.atan2(dy, dx);
    const xDelta = c2.x + (Math.cos(angle) * c2.radius);
    const yDelta = c2.y + (Math.sin(angle) * c2.radius);
    const newC2 = { x: c2.x + xDelta, y: c2.y + yDelta, radius: c2.radius };
    const distance = locateable_distance(c1, newC2);

    if (distance < c1.radius) {
        onCover();
    }
}

const genCoordsInRange = (range: [number, number]) => [Math.random() * range[0], Math.random() * range[1]];
export function SpawnAway(locateables: Collideable[], radius: number, range: [number, number]) {
    let [x, y] = genCoordsInRange(range);
    if (!locateables || locateables.length == 0) return [x, y];
    let times = 0;
    while (true) {
        let failed = false;
        for (const locateable of locateables) {
            let miniFailed = false;
            CheckRadialCollision(locateable, { x, y, radius }, () => miniFailed = true);
            if (miniFailed) {
                failed = true;
                break;
            }
        }
        [x, y] = genCoordsInRange(range);
        if (!failed) {
            break;
        }
        times++;
        if (times > 50) {
            console.error("Could not find valid area");
            break;
        }
    }
    return [x, y];
}
export const randomBetween = (a: number, b: number) => {
    return a + Math.random() * (b - a);
};
const colors = ["red", "blue", "green", "purple", "orange", "pink", "white", "cyan", "yellow", "brown"];
export const getRandomColor = (): string => {
    return colors[Math.floor(Math.random() * colors.length)];
};


export function findNearestPlayer(player: SuperPlayer, game: GameController): SuperPlayer | undefined {
    let minDist = Infinity;
    let result: SuperPlayer | undefined = undefined;
    for (const player1 of game.Players) {
        const distance = locateable_distance(player, player1);
        if (distance < minDist) {
            minDist = distance;
            result = player1;
        }
    }
    return result;
}