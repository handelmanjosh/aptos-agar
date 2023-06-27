import NavBar from "@/components/NavBar";
import { useWallet } from "@/components/WalletContext";
import { getMassBalance, getTrophyBalance } from "@/components/aptos/balance";
import { abstractMint } from "@/components/aptos/mint";
import { transferMass } from "@/components/aptos/transfer";
import { HexString } from "aptos";
import { useEffect, useState } from "react";



export default function Shop() {
    const { address } = useWallet();
    const [mass, setMass] = useState<number>(0);
    const [trophy, setTrophy] = useState<number>(0);
    useEffect(() => {
        if (address) {
            getMassBalance(address).then((balance) => {
                setMass(Number(balance));
            });
            getTrophyBalance(address).then((balance) => {
                setTrophy(Number(balance));
            });
        }
    }, [address]);
    const products: { name: string, description: string, price: number, id: string; }[] = [
        {
            name: "Size Power Up",
            description: "Experience a surge in size! This power-up gives your character an instant size boost, helping you dominate smaller opponents.",
            price: 45000,
            id: "size"
        },
        {
            name: "Speed Power Up",
            description: "Boost your game speed! This power-up provides a temporary increase in speed, helping you to escape or chase down opponents.",
            price: 15000,
            id: "speed"
        },
        {
            name: "Slow Power Up",
            description: "Slow down the pace! This power-up reduces an opponent's speed, allowing for a stylish escape!",
            price: 25000,
            id: "slow"
        },
        {
            name: "Place Virus Power Up",
            description: "Set a trap! This power-up allows you to place a virus in the game field, disrupting your opponents' path.",
            price: 50000,
            id: "virus"
        },
        {
            name: "Double Food Power Up",
            description: "Double your nutrition! This power-up gives double points for every food item your character consumes for a limited time.",
            price: 50000,
            id: "double"
        },
        {
            name: "Triple Food Power Up",
            description: "Triple your nutrition! This power-up gives triple points for every food item your character consumes for a limited time.",
            price: 90000,
            id: "triple"
        },
        {
            name: "Recombine Power Up",
            description: "Bounce back from dispersion! This power-up allows your character to instantly recombine after being split.",
            price: 40000,
            id: "recombine"
        },
    ];

    return (
        <div className="w-screen h-screen flex flex-col justify-start items-center">
            <div className="h-[10%] w-full">
                <NavBar page="shop" />
            </div>
            <div className="w-full h-[10%] flex flex-row justify-between items-center px-10">
                <div className="bg-red-400 p-4 rounded-lg">
                    {`${mass} $MASS`}
                </div>
                <p className="text-5xl font-bold">Shop</p>
                <div className="bg-red-400 p-4 rounded-lg">
                    {`${trophy} $TROPHY`}
                </div>
            </div>
            <div className="w-full grid grid-cols-4 grid-rows-2 place-items-center items-center gap-10 px-10">
                {products.map((product, i: number) => (
                    <ProductCard key={i} {...product} mass={mass} />
                ))}
            </div>
        </div>
    );
}

type ProductProps = {
    name: string;
    description: string;
    price: number;
    id: string;
    mass: number;
};
const ProductCard = ({ name, description, price, id, mass }: ProductProps) => {
    const [quantity, setQuantity] = useState(1);
    const { address, sign } = useWallet();
    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    const buy = async (quantity: number, price: number, id: string) => {
        await transferMass(sign, price);
        await abstractMint(new HexString(address), quantity, id);
    };
    return (
        <div className=" border-2 bg-slate-800 gap-4 w-full h-full border-white rounded flex flex-col justify-center items-center overflow-hidden shadow-lg text-white m-5">
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{name}</div>
                <p className="text-gray-300 text-base">{description}</p>
            </div>
            <div className=" w-full flex items-center justify-center">
                <span className="w-[50%] text-2xl flex items-center justify-center bg-red-400 rounded-full px-3 py-1 font-semibold text-white">
                    {price * quantity}
                </span>
            </div>
            <div className="">
                <button onClick={handleDecrease} className="bg-red-400 hover:brightness-90 active:brightness-75 text-white font-bold py-2 px-4 rounded-l">
                    -
                </button>
                <span className="border-2 border-red-400 px-4 py-2">{quantity}</span>
                <button onClick={handleIncrease} className="bg-red-400 hover:brightness-90 active:brightness-75 text-white font-bold py-2 px-4 rounded-r">
                    +
                </button>
            </div>
            <div className="flex flex-row justify-center items-center">
                <button
                    className={`py-4 px-8 text-xl rounded-lg ${mass < price * quantity ? "bg-gray-500" : "bg-red-400 hover:brightness-90 active:brightness-75"}`}
                    onClick={() => buy(quantity, price, id)}
                    disabled={mass < price * quantity}
                >
                    Purchase
                </button>
            </div>
        </div>
    );
};