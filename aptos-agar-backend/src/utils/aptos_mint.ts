import { AptosAccount, AptosClient, TxnBuilderTypes, MaybeHexString, HexString, FaucetClient } from "aptos";
require("dotenv").config();

const NODE_URL = process.env.ENVIRONMENT == "development" ? "https://fullnode.devnet.aptoslabs.com" : "https://fullnode.mainnet.aptoslabs.com";
console.log("aptos_mint, ", NODE_URL);
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
const COIN = "0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2";

const client = new AptosClient(NODE_URL);

async function abstractMint(reciever: HexString, amount: number, name: string): Promise<string> {
    const admin = new AptosAccount(new HexString(process.env.CLIENT_PRIVATE_KEY!).toUint8Array());
    const rawTxn = await client.generateTransaction(admin.address(), {
        function: `${admin.address()}::agar::mint_${name}_to`,
        type_arguments: [],
        arguments: [reciever.hex(), amount],
    });
    const bcsTxn = await client.signTransaction(admin, rawTxn);
    const pendingTxn = await client.submitTransaction(bcsTxn);
    const txnHash = pendingTxn.hash;
    await client.waitForTransaction(txnHash, { checkSuccess: true });
    return "";
}

export async function mintMass(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "mass");
}
export async function mintSize(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "size");
}
export async function mintSpeed(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "speed");
}
export async function mintSlow(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "slow");
}
export async function mintVirus(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "virus");
}
export async function mintDouble(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "double");
}
export async function mintTriple(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "triple");
}
export async function mintRecombine(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "recombine");
}
export async function mintTrophy(reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(reciever, amount, "trophy");
}