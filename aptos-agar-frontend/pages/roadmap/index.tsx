import { ArrowRight } from "@/components/Icons";
import NavBar from "@/components/NavBar";
import { useState } from "react";



export default function Roadmap() {
    const [hoveredTask, setHoveredTask] = useState<any>(null);
    const tasks: { id: number, status: "Completed" | "In Progress" | "Not Started", name: string, details: string; }[] = [
        { id: 0, name: "Hackathon", status: "Completed", details: "Game won second place at Web3 Gaming Hackathon" },
        { id: 1, name: "Alpha", status: "Completed", details: "Game and integrated shop on devnet" },
        { id: 2, name: "Mainnet", status: "In Progress", details: "Game on Mainnet" },
        { id: 3, name: "Beta", status: "In Progress", details: "Public Beta on Mainnet for testing" },
        { id: 4, name: "Token Swaps", status: "Not Started", details: "Token Swaps set up for game tokens" },
        { id: 9, name: "Mainnet Launch", status: "Not Started", details: "Game launched on Mainnet" },
        { id: 8, name: "New Power Up", status: "Not Started", details: "New power up added to the game" },
        { id: 5, name: "Governance", status: "Not Started", details: "Game tokens usable for voting on new features and bug reporting" },
        { id: 6, name: "NFT skins", status: "Not Started", details: "NFT skins available for purchase in the shop" },
        { id: 11, name: "Loyalty NFT", status: "Not Started", details: "Project NFT giving weekly rewards to active players" },
        { id: 7, name: "Composable skins", status: "Not Started", details: "Skins upgradeable based upon game performance" },
        { id: 10, name: "Ranked mode", status: "Not Started", details: "Pay APT, win APT..." }
    ];

    const statusStyles = {
        "Completed": "bg-red-400 text-white",
        "In Progress": "bg-indigo-500 text-white",
        "Not Started": "bg-gray-700 text-black",
    };
    return (
        <div className="w-screen h-screen flex flex-col justify-start items-center">
            <div className="h-[10%] w-full mb-10">
                <NavBar page="roadmap" />
            </div>
            <div className="grid grid-cols-5 gap-10 place-items-center w-full px-40">
                {tasks.map((task, i: number) => (
                    <div
                        key={task.id}
                        className="border-2 rounded-lg w-full border-gray-700 p-4"
                    >
                        <div className="flex flex-row justify-between items-start">
                            <h2 className="text-2xl font-bold mb-8">{task.name}</h2>
                            <div
                                className="relative w-6 flex justify-center items-center aspect-square rounded-full bg-slate-700 hover:cursor-default"
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                            >
                                <p>{"?"}</p>
                                {hoveredTask === task.id &&
                                    <div className={`absolute bg-gray-700 z-50 flex justify-center items-center text-white py-2 px-4 w-auto rounded-full whitespace-nowrap shadow-lg top-0 h-full ${(i + 1) % 5 == 0 ? "right-full mr-2" : "left-full ml-2"}`}>
                                        {task.details}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                            <span className={`inline-block py-1 px-3 rounded-full text-sm ${statusStyles[task.status]}`}>
                                {task.status}
                            </span>
                            <div className="w-10 aspect-square">
                                <ArrowRight />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
