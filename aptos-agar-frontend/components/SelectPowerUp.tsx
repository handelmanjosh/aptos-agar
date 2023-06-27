import { useState } from "react";
import { Minus, Plus } from "./Icons";

type SelectPowerUpProps = {
    onChange: (direction: 1 | -1) => any;
    name: string;
    max: number;
    amount: number;
};
export default function SelectPowerUp({ onChange, name, max, amount }: SelectPowerUpProps) {
    return (
        <div className="w-full aspect-square bg-red-400 flex flex-col justify-between items-center rounded-lg p-1">
            <div className={`flex flex-row justify-start w-full items-center ${max < 0 ? "text-red-600" : ""}`}>
                <p>{max}</p>
            </div>
            <p>
                {name}
            </p>
            <div className="flex flex-row justify-center items-center gap-2">
                <button onClick={() => onChange(-1)} className="w-6 aspect-square bg-red-500 rounded-full hover:brightness-90 active:brightness-75">
                    <Minus />
                </button>
                <p>{amount}</p>
                <button onClick={() => onChange(1)} className="w-6 aspect-square bg-red-500 rounded-full hover:brightness-90 active:brightness-75">
                    <Plus />
                </button>
            </div>
        </div>
    );
}