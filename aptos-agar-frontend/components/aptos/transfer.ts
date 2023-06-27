import { AptosAccount, AptosClient, TxnBuilderTypes, MaybeHexString, HexString, FaucetClient } from "aptos";
import { getBalance } from "./balance";

const NODE_URL = process.env.NEXT_PUBLIC_ENVIRONMENT == "development" ? "https://fullnode.devnet.aptoslabs.com" : "https://fullnode.mainnet.aptoslabs.com";

const client = new AptosClient(NODE_URL);
const COIN = "0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2"; //coin account public key

async function abstractTransfer(signAndSubmitTransaction: (t: any) => any, amount: number, name: string) {
    console.log(await getBalance("0x9986beeb77fcfaf5bb57cd22ab67b415c693063b29e6f52503e8572bc9568330", "SizePowerUp"));
    console.log(name);
    const transaction = {
        arguments: [COIN, amount],
        function: `${COIN}::agar::transfer_${name}`,
        type: 'entry_function_payload',
        type_arguments: [],
    };
    const pendingTxn = await signAndSubmitTransaction(transaction);
    if (pendingTxn) {
        const txnHash = pendingTxn.hash;
        await client.waitForTransaction(txnHash, { checkSuccess: true });
    }
    return "";
}

export async function transferMass(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "mass");
}
export async function transferSize(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "size");
}
export async function transferSpeed(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "speed");
}
export async function transferSlow(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "slow");
}
export async function transferVirus(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "virus");
}
export async function transferDouble(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "double");
}
export async function transferTriple(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "triple");
}
export async function transferRecombine(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "recombine");
}
export async function transferTrophy(sign: (t: any) => any, amount: number): Promise<string> {
    return await abstractTransfer(sign, amount, "trophy");
}