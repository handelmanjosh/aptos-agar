import HomeLink from "@/components/HomeLink";
import { Check } from "@/components/Icons";
import PlayButton from "@/components/PlayButton";
import SelectPowerUp from "@/components/SelectPowerUp";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useWallet } from "@/components/WalletContext";
import { getBalance } from "@/components/aptos/balance";
import { transferDouble, transferMass, transferRecombine, transferSize, transferSlow, transferSpeed, transferTriple, transferVirus } from "@/components/aptos/transfer";
import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';


let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let socket: Socket;
let mousePos: [number, number] | undefined;
let keys: string[] = [];
let hotkeys = ["q", "w", "e", "r", "t", "y", "u", "i"];
const powerUps = new Map();
let powerUpNames = ["Size", "Speed", "Slow", "PlaceVirus", "Recombine", "DoubleFood", "TripleFood"/*, "Freeze" */];
let powerUpStructNames = ["SizePowerUp", "SpeedPowerUp", "SlowPowerUp", "PlaceVirusPowerUp", "RecombinePowerUp", "DoubleFoodPowerUp", "TripleFoodPowerUp"/*, "FreezePowerUp" */];
let powerUpStructNamesToPowerUpNames = new Map<string, string>(powerUpNames.map((name: string, i: number) => [powerUpStructNames[i], name]));
for (const name of powerUpNames) {
  powerUps.set(name, 0);
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<[string, number][]>([]);
  const [globalMessages, setGlobalMessages] = useState<[string, string][]>([]);
  const [privateMessages, setPrivateMessages] = useState<string[]>([]);
  const [inGamePowerUps, setInGamePowerUps] = useState<Map<string, number>>(new Map(powerUps));
  const [showPowerUpPopUp, setShowPowerUpPopUp] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [powerUpErrorMessage, setPowerUpErrorMessage] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [trophiesWon, setTrophiesWon] = useState<number>(0);
  const [massWon, setMassWon] = useState<number>(0);
  const [selectedPowerUps, setSelectedPowerUps] = useState<Map<string, number>>(new Map(powerUps));
  const [myPowerUps, setMyPowerUps] = useState<Map<string, number>>(new Map(powerUps));

  //const [privateMessages, setPrivateMessages] = useState<[string, string][]>([]);

  const { address, publicKey, connected, connect, disconnect, sign } = useWallet();

  const getBalances = async (address: string) => {
    const powerUpDecimals = 10;
    const balances: [string, number][] = [];
    for (const name of powerUpStructNames) {
      const balance = Number(await getBalance(address, name));
      balances.push([powerUpStructNamesToPowerUpNames.get(name)!, Math.floor(balance / powerUpDecimals)]);
    }
    return balances;
  };
  useEffect(() => {
    if (address) {
      getBalances(address).then((balances: [string, number][]) => {
        console.log(balances);
        setMyPowerUps(new Map(balances));
      });
    }
  }, [address, isPlaying]);
  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      autoConnect: false
    });
    socket.connect();
    socket.on("connect", () => {
      console.log(`Connected: ${socket.id}`);
    });
    socket.on("gameState", drawState);
    socket.on("dead", endgame);
    socket.on("receiveLeaderboard", receiveLeaderboard);
    socket.on("receiveGlobalMessages", receiveGlobalMessages);
    socket.on("receiveInventory", receiveInventory);
    //socket.on("collectInGamePowerUp", collectInGamePowerUp);
    socket.on("receivePrivateMessages", receivePrivateMessages);
    socket.on("connect_error", (err) => console.error(err));
    const sendMouse = setInterval(sendMousePos, 1000 / 60);
    return () => {
      socket.disconnect();
      clearInterval(sendMouse);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", disableScroll, { passive: false });
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", touchmove, { passive: false });
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    resize();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", disableScroll);
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("touchmove", touchmove);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    };
  }, []);
  const disableScroll = (e: WheelEvent) => {
    e.preventDefault();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key == " ") {
      event.preventDefault();
      if (!keys.includes(event.key)) {
        keys.push(event.key);
      }
    }
  };
  const keyup = (event: KeyboardEvent) => {
    if (event.key == " ") {
      event.preventDefault();
      if (keys.includes(event.key)) {
        keys.splice(keys.indexOf(event.key), 1);
      }
    }
  };
  const resize = () => {
    canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  const sendMousePos = () => {
    if (mousePos) {
      socket.emit("move", { pos: mousePos, dimensions: [canvas.width, canvas.height], id: socket.id, keys });
    }
  };
  const mousemove = (event: MouseEvent) => {
    mousePos = adjustToCanvas(event.clientX, event.clientY);
  };
  const touchmove = (event: TouchEvent) => {
    mousePos = adjustToCanvas(event.touches[0].clientX, event.touches[0].clientY);
    if (mousePos) {
      event.preventDefault();
    }
  };
  const adjustToCanvas = (x: number, y: number): [number, number] | undefined => {
    const canvasRect = canvas.getBoundingClientRect();
    //console.log(x, y, window.scrollX, window.scrollY);
    const [adjX, adjY] = [x - canvasRect.left, y - canvasRect.top];
    if (adjX > 0 && adjX < canvas.width && adjY > 0 && adjY < canvas.height) {
      //console.log(canvasRect, { adjX, adjY, x, y });
      return [adjX, adjY];
    }
  };
  const drawState = (objects: any[]) => {
    const player = objects.find((object) => object.id === socket.id);
    if (player) {
      const scale = player.scale;
      paintBackground(player.x, player.y, scale);
      for (const object of objects) {
        if (object.id && object.id === socket.id) {
          drawPlayer(object, scale);
        } else if (object.id) {
          drawOtherPlayer(object, player, scale);
        } else {
          drawObject(object, player, scale);
        }
      }
    }
  };
  const originToCanvas = (x: number, y: number) => {
    return [x + canvas.width / 2, y + canvas.height / 2];
  };
  const drawPlayer = (object: any, scale: number) => {
    object.players.forEach((player: any) => {
      drawSubPlayers(player, [object.x, object.y], scale);
    });
  };
  const drawSubPlayers = (player: any, relative: [number, number], scale: number) => {
    let [relX, relY] = [player.x - relative[0], player.y - relative[1]];
    [relX, relY] = originToCanvas(relX / scale, relY / scale); //adjust distance from player by scale
    context.save();
    context.beginPath();
    context.translate(relX, relY);
    context.arc(0, 0, player.radius / scale, 0, 2 * Math.PI);
    context.fillStyle = player.color;
    context.fill();
    if (player.name) {
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "white";
      context.font = '15px Arial';
      context.fillText(player.name, 0, 0);
    }
    context.restore();
  };
  const drawOtherPlayer = (object: any, player: { x: number, y: number; }, scale: number) => {
    let [relX, relY] = [object.x - player.x, object.y - player.y];
    [relX, relY] = originToCanvas(relX / scale, relY / scale); // adjust by scale
    object.players.forEach((player: any) => {
      const [tempX, tempY] = [relX - player.x, relY - player.y]; //might have to adjust here too
      context.save();
      context.beginPath();
      context.translate(tempX, tempY);
      context.arc(0, 0, player.radius / scale, 0, 2 * Math.PI);
      context.fillStyle = player.color;
      context.fill();
      if (player.name) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.font = '15px Arial';
        context.fillText(player.name, 0, 0);
      }
      context.restore();
    });
  };
  const paintBackground = (x: number, y: number, scale: number) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, 10000, 10000);
    context.save();
    context.translate(-1 * x / scale, -1 * y / scale);
    context.beginPath();
    for (let x = canvas.width / 2; x < (10000 / scale) + canvas.width / 2; x += 100 / scale) { //scale grid distance
      context.moveTo(x, canvas.height / 2);
      context.lineTo(x, (10000 / scale) + canvas.height / 2);
    }
    for (let y = canvas.height / 2; y < (10000 / scale) + canvas.height / 2; y += 100 / scale) {
      context.moveTo(canvas.width / 2, y);
      context.lineTo((10000 / scale) + canvas.width / 2, y);
    }
    context.strokeStyle = "white";
    context.lineWidth = 0.5;
    context.stroke();
    context.strokeStyle = "red";
    context.strokeRect(canvas.width / 2, canvas.height / 2, 10000 / scale, 10000 / scale);
    context.restore();
  };
  const drawObject = (object: any, player: { x: number, y: number; }, scale: number) => {
    let [relX, relY] = [object.x - player.x, object.y - player.y];
    [relX, relY] = originToCanvas(relX / scale, relY / scale);
    context.save();
    context.beginPath();
    context.translate(relX, relY);
    if (object.square) {
      context.fillStyle = object.color;
      context.fillRect(- object.radius / scale, - object.radius / scale, object.radius / scale * 2, object.radius / scale * 2);
    } else {
      context.fillStyle = object.color;
      context.arc(0, 0, object.radius / scale, 0, 2 * Math.PI);
      context.fill();
    }
    if (object.name) {
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "white";
      context.font = '15px Arial';
      context.fillText(object.name, 0, 0);
    }
    context.restore();
  };
  const receiveLeaderboard = (leaderboard: [string, number][]) => {
    leaderboard = leaderboard.map(([name, score]) => [shorten(name), Math.round(score)]);
    setLeaderboard(leaderboard);
  };
  const receiveGlobalMessages = (messages: [string, string][]) => {
    setGlobalMessages(messages);
  };
  const receivePrivateMessages = (messages: string[]) => {
    setPrivateMessages(messages);
  };
  // const collectInGamePowerUp = (name: string) => {
  //   console.log(name);
  //   const amount = inGamePowerUps.get(name);
  //   if (amount !== undefined) {
  //     setInGamePowerUps(inGamePowerUps => {
  //       inGamePowerUps.set(name, amount + 1);
  //       return new Map(inGamePowerUps);
  //     });
  //   }
  // };
  const play = async () => {
    if (!address) {
      setErrorMessage("Please connect your wallet");
      setTimeout(() => {
        setErrorMessage("");
      }, 10000);
    } else {
      for (const [name, value] of Array.from(selectedPowerUps)) {
        if (value > 0) {
          switch (name) {
            case "Size":
              await transferSize(sign, value);
              break;
            case "Speed":
              await transferSpeed(sign, value);
              break;
            case "Slow":
              await transferSlow(sign, value);
              break;
            case "PlaceVirus":
              await transferVirus(sign, value);
              break;
            case "Recombine":
              await transferRecombine(sign, value);
              break;
            case "DoubleFood":
              await transferDouble(sign, value);
              break;
            case "TripleFood":
              await transferTriple(sign, value);
              break;
            case "Freeze":
              break;
            default:
              break;
          }
        }
      }
      socket.emit("spawn", { powerUps: Array.from(selectedPowerUps), address });
      setIsPlaying(true);
    }
  };
  const endgame = ({ trophies, mass }: { trophies: number, mass: number; }) => {
    //setTrophiesWon(trophies);
    setMassWon(mass);
    setShowResult(true);
  };
  const sendUsername = () => {
    socket.emit("username", name);
    setSuccessMessage(`Username set to ${name}`);
    setTimeout(() => {
      setSuccessMessage("");
    }, 10000);
  };
  const receiveInventory = (inventory: [string, number][]) => {
    const newPowerUps = new Map();
    for (const [name, amount] of inventory) {
      newPowerUps.set(name, amount);
    }
    setInGamePowerUps(newPowerUps);
  };
  return (
    <div className="relative w-auto h-auto">
      <canvas id="game-canvas" />
      {!isPlaying ?
        <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full">
          <div className="flex flex-col items-center justify-center py-10 px-20 xl:w-[30%] 2xl:w-[25%] bg-slate-600/60 rounded-lg gap-4">
            <p className="text-5xl font-bold">Aptos Mass</p>
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <div className="w-auto h-auto flex flex-row justify-center items-center gap-2 p-2 bg-black rounded-lg">
                <input
                  className="appearance-none outline-none bg-transparent w-full"
                  placeholder="Nickname"
                  value={name}
                  onChange={(event: any) => {
                    if (event.target.value.length < 15) {
                      setName(event.target.value);
                    }
                  }}
                />
                <div className="w-8 aspect-square bg-red-400 rounded-md hover:scale-110 hover:cursor-pointer transition-all" onClick={sendUsername}>
                  <Check />
                </div>
              </div>
              {successMessage ? <p className="text-xl text-green-600 font-bold">{successMessage}</p> : <></>}
              {errorMessage ? <p className="text-xl text-red-600 font-bold">{errorMessage}</p> : <></>}
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <label htmlFor="options" className="w-full text-left text-lg px-2">
                  Server
                </label>
                <select
                  id="options"
                  value={selectedOption}
                  onChange={(event: any) => setSelectedOption(event.target.value)}
                  className=" block w-full bg-black rounded-md outline-none text-xl p-2"
                >
                  <option value="US-East" disabled>US-East -- Coming Soon!</option>
                  <option value="US-West">US-West</option>
                  <option value="Asia-Singapore" disabled>Asia-Singapore -- Coming Soon!</option>
                  <option value="Asia-Japan" disabled>Asia-Japan -- Coming Soon!</option>
                  <option value="Europe" disabled>Europe -- Coming Soon!</option>
                  <option value="Middle East" disabled>Middle East -- Coming Soon!</option>
                  <option value="Brazil" disabled>Brazil -- Coming Soon!</option>
                </select>
              </div>
              <div className="flex flex-row justify-center items-center gap-2">
                <PlayButton onClick={play} text="Play" />
                <WalletConnectButton />
              </div>
              <div className="relative flex flex-row justify-center items-center gap-2">
                <PlayButton onClick={() => setShowPowerUpPopUp(true)} text="Choose Power Ups" />
                {showPowerUpPopUp ?
                  <div className="absolute left-full top-0 ml-2 flex flex-col justify-center items-center gap-6 w-[450px] p-2 bg-black/90 border border-white rounded shadow">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from(selectedPowerUps).map(([name, value], i) => (
                        <SelectPowerUp
                          onChange={(n: 1 | -1) => {
                            const amount = selectedPowerUps.get(name);
                            const current = myPowerUps.get(name);
                            if (amount !== undefined && current !== undefined) {
                              if (amount <= 0 && n == -1) return;
                              selectedPowerUps.set(name, amount + n);
                              myPowerUps.set(name, current - n);
                              if (current - n < 0) {
                                setPowerUpErrorMessage(`You don't have any ${name} power up`);
                              } else {
                                setPowerUpErrorMessage("");
                              }
                            }
                          }}
                          name={name}
                          amount={value}
                          max={myPowerUps.get(name)!}
                          key={i}
                        />
                      ))}
                    </div>
                    {powerUpErrorMessage !== "" ?
                      <div className="flex flex-col justify-center items-center">
                        <p className="text-xl text-red-600 font-bold">{powerUpErrorMessage}</p>
                        <HomeLink href="/shop" text="Shop" />
                      </div>
                      :
                      <PlayButton onClick={() => { setShowPowerUpPopUp(!showPowerUpPopUp); }} text="Confirm" />
                    }
                  </div>
                  :
                  <></>
                }
              </div>
              <div className="flex flex-row justify-between items-center gap-4">
                <HomeLink href="/shop" text="Shop" />
                <HomeLink href="/roadmap" text="Roadmap" />
                <HomeLink href="/about" text="About" />
              </div>
            </div>
          </div>
        </div>
        :
        <></>
      }
      {showResult ?
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-4 bg-slate-600/60 rounded-lg p-4">
            <p className="text-xl">{`$MASS won: `} <span className="text-red-400 font-bold">{massWon}</span></p>
            {/* <p className="text-xl">{`$TROPHY won: `} <span className="text-red-400 font-bold">{trophiesWon}</span></p> */}
            <button
              onClick={() => { setIsPlaying(false); setShowResult(false); }}
              className="py-2 px-4 bg-red-400 rounded-lg hover:brightness-90 active:brightness-75"
            >
              Close
            </button>
          </div>
        </div>
        :
        <></>
      }
      {isPlaying ?
        <>
          <button
            className="absolute top-0 left-0 p-1 text-sm w-auto aspect-square rounded-md m-2 bg-red-600/60 hover:brightness-90 active:brightness-75"
            onClick={() => socket.emit("quit")}
          >
            Quit
          </button>
          <div className="absolute top-0 right-0 flex flex-col justify-center w-[20%] gap-2 h-auto items-center m-2 bg-slate-600/60 p-4 rounded-lg">
            {leaderboard.map(([username, score], i) => {
              if (socket && (username === shorten(socket.id) || username === name)) {
                return (
                  <div key={i} className="flex flex-row text-xl text-yellow-400 justify-between items-center w-full">
                    <p className="">{username}</p>
                    <p className="">{score}</p>
                  </div>
                );
              } else {
                return (
                  <div key={i} className="flex flex-row text-xl justify-between items-center w-full">
                    <p className="">{username}</p>
                    <p className="">{score}</p>
                  </div>
                );
              }
            })}
          </div>
          {globalMessages.length > 0 ?
            <div className="absolute bottom-0 left-0 flex flex-col justify-center w-auto gap-2 h-auto items-center m-2 bg-slate-600/60 p-4 rounded-lg">
              {globalMessages.map(([killer, killee], i) => (
                <div key={i} className="text-xl flex flex-row justify-center items-center gap-2">
                  <p className={`text-green-600`}>{shorten(killer)}</p>
                  <p className="text-white">ate</p>
                  <p className={`text-red-600`}>{shorten(killee)}</p>
                </div>
              ))}
            </div>
            :
            <></>
          }
          <div className="absolute bottom-0 right-0 m-2 grid grid-cols-4 gap-2">
            {Array.from(inGamePowerUps).map(([name, amount]: [string, number], i: number) => (
              <div
                key={i}
                className={`rounded-full flex flex-row gap-6 justify-center items-center ${amount > 0 ? "bg-red-400" : "bg-gray-400"} border-white border py-2 px-4 hover:brightness-90 active:brightness-75`}
                onClick={() => {
                  //maybe add hotkeys later
                  if (socket && amount > 0) {
                    socket.emit("usePowerUp", name);
                  }
                }}
              >
                <div className="rounded-full w-6 flex justify-center items-center aspect-square bg-white text-black">
                  {amount}
                </div>
                <p className="text-black">{name}</p>
              </div>
            ))}
          </div>
          {privateMessages.length > 0 ?
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <div className="flex flex-col justify-center items-center gap-2 bg-slate-600/60 rounded-lg p-4">
                {privateMessages.map((message, i) => (
                  <p key={i}>{message}</p>
                ))}
              </div>
            </div>
            :
            <></>
          }
        </>
        :
        <></>
      }
    </div>
  );
}
const shorten = (s: string) => {
  if (s.length > 15) {
    return s.slice(0, 4) + "..." + s.slice(s.length - 4, s.length);
  } else {
    return s;
  }
};
