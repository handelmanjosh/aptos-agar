import { AptosClient, MaybeHexString } from "aptos";

const NODE_URL = process.env.NEXT_PUBLIC_ENVIRONMENT == "development" ? "https://fullnode.devnet.aptoslabs.com" : "https://fullnode.mainnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
const COIN = "0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2";

const client = new AptosClient(NODE_URL);
export async function getBalance(account: MaybeHexString, coin: string): Promise<string | number> {
    const resource = await client.getAccountResource(
        account,
        `0x1::coin::CoinStore<${COIN}::agar::${coin}>`,
    );
    return parseInt((resource.data as any)["coin"]["value"]);
}
export async function getMassBalance(account: MaybeHexString): Promise<string | number> {
    return Number(await getBalance(account, "MassCoin")) / 1000000;
}
export async function getTrophyBalance(account: MaybeHexString): Promise<string | number> {
    return Number(await getBalance(account, "TrophyCoin")) / 10000;
}

export async function checkExistence(account: MaybeHexString): Promise<boolean> {
    try {
        const resource = await client.getAccountResource(
            account,
            `0x1::coin::CoinStore<${COIN}::agar::MassCoin>`,
        );
        return true;
    } catch (e) {
        return false;
    }
}