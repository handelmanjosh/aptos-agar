import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import GameController from './utils/GameController';
import { SpawnAway } from './utils/utils';
import { SuperPlayer } from './utils/Player';

require("dotenv").config();


const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    //todo: lock down origin
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE"]
    }
});

// const port = process.env.ENVIRONMENT === "development" ? 3005 : (Number(process.env.PORT) || 3000);
const port = Number(process.env.PORT) || 3000;
async function main() {
    const games: Map<string, GameController> = new Map<string, GameController>();
    const vMax = 10;
    const generateRandomGameId = () => String(Math.floor(Math.random() * 1000000));
    const findRoom = (socket: Socket) => {
        //const player: Player = genPlayer(socket);
        for (const game of games) {
            if (game[1].Players.length < 10) {
                game[1].sockets.push(socket);
                return game[0];
            }
        }
        const id = generateRandomGameId();
        const gameController = new GameController();
        gameController.sockets.push(socket);
        games.set(id, gameController);
        return id;
    };
    let i = 0;
    let key: string | undefined;
    let username: string | undefined;
    const interval = setInterval(() => {
        for (const game of Array.from(games)) {
            game[1].frame();
            const gameObjects = game[1].asSerializeable();
            game[1].sockets.forEach((socket: Socket) => {
                const obj = game[1].getRelevantObjects(gameObjects, socket.id, 1000);
                const me = game[1].Players.find(player => player.id == socket.id);
                socket.emit("gameState", obj);
                if (me) {
                    socket.emit("receiveInventory", me.serializeInventory());
                    socket.emit("receivePrivateMessages", me.getMessages());
                }
            });
            io.to(game[0]).emit("receiveLeaderboard", game[1].getLeaderboard());
            io.to(game[0]).emit("receiveGlobalMessages", game[1].getGlobalMessages());
        }
        i++;
    }, 1000 / 60);
    io.on("connection", (socket: Socket) => {
        console.log("New user connected");
        let gameId: string = findRoom(socket);
        socket.join(gameId);
        socket.on("move", (data: { pos: [number, number]; dimensions: [number, number], id: string, keys: string[]; }) => {
            if (data.id) {
                const game = games.get(gameId)!;
                const player = game.Players.find(player => player.id == data.id);
                if (player) {
                    const [x, y] = data.pos;
                    const [width, height] = data.dimensions;
                    player.updateVelocity(x, y, width, height);
                    if (data.keys) {
                        for (const key of data.keys) {
                            if (key == " ") {
                                player.split();
                            }
                        }
                    }
                }
            }
        });
        socket.on("usePowerUp", name => {
            const game = games.get(gameId);
            const player = game?.Players.find(player => player.id == socket.id);
            if (player) {
                player.usePowerUp(name);
            }
        });
        socket.on("spawn", ({ powerUps, address }: { powerUps: [string, number][], address: string; }) => {
            let game = games.get(gameId)!;
            const [x, y] = SpawnAway(game?.allSubPlayers() || [], 10, [10000, 10000]);
            const player = new SuperPlayer(x, y, vMax, socket.id,
                (name: string) => {
                    socket.emit("collectInGamePowerUp", name);
                },
                //use 3.14 for simplicity
                (n: number) => socket.emit("massIncrease", n ** 2 * 3.14),
                () => socket,
                address,
                game,
            );
            if (key) {
                player.key = key;
            }
            if (username) {
                player.setName(username);
            }
            if (powerUps) {
                for (const powerUp of powerUps) {
                    player.addPowerUps(powerUp);
                }
            }
            if (game) {
                game.addPlayer(player);
            } else {
                gameId = findRoom(socket);
                game = games.get(gameId)!;
                game.addPlayer(player);
                player.game = game;
            }
        });
        socket.on("username", (newUsername: string) => {
            username = newUsername;
        });
        socket.on("disconnect", () => {
            const game = games.get(gameId);
            if (game) {
                game.remove(socket);
                if (game.sockets.length == 0) {
                    console.log(`Deleted game ${gameId}`);
                    games.delete(gameId);
                }
            }
            console.log(`${socket.id} disconnected`);
        });
        socket.on("quit", () => {
            const game = games.get(gameId);
            const player = game?.Players.find(player => player.id == socket.id);
            if (player) {
                player.delete = true;
            }
        });
    });
}

main();

httpServer.listen(port, `0.0.0.0`, () => {
    console.log(`Server listening on port ${port}`);
});