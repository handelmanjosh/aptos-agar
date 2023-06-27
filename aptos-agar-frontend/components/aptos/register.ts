import { AptosAccount, AptosClient, MaybeHexString } from "aptos";

const NODE_URL = process.env.NEXT_PUBLIC_ENVIRONMENT == "development" ? "https://fullnode.devnet.aptoslabs.com" : "https://fullnode.mainnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
const COIN = "0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2";

const client = new AptosClient(NODE_URL);
export default async function registerUser(signAndSubmitTransaction: (t: any) => any) {
    const transaction = {
        arguments: [],
        function: `${COIN}::agar::register_user`,
        type: 'entry_function_payload',
        type_arguments: [],

    };
    // const rawTxn = await client.generateTransaction(address, {
    //     function: `${COIN}::agar::register_user`,
    //     type_arguments: [],
    //     arguments: [],
    // });
    const pendingTxn = await signAndSubmitTransaction(transaction);
    if (pendingTxn) {
        const txnHash = pendingTxn.hash;
        await client.waitForTransaction(txnHash, { checkSuccess: true });
    }
    // const bcsTxn = await client.signTransaction(user, rawTxn);
    // const pendingTxn = await client.submitTransaction(bcsTxn);
}