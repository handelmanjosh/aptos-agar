import fs from 'fs'
import path from 'path';
import assert from 'assert';
import { AptosAccount, AptosClient, TxnBuilderTypes, MaybeHexString, HexString, FaucetClient } from "aptos";


const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";


const client = new AptosClient(NODE_URL);


//alice pubkey
const COIN = "0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2";
async function abstractTransfer(sender: AptosAccount, reciever: HexString, amount: number, name: string): Promise<string> {
    const rawTxn = await client.generateTransaction(sender.address(), {
        function:  `${COIN}::agar::transfer_${name}`,
        type_arguments: [],
        arguments: [reciever.hex(), amount],
    });
    const bcsTxn = await client.signTransaction(sender, rawTxn);
    const pendingTxn = await client.submitTransaction(bcsTxn);
  
    return pendingTxn.hash;
}
async function abstractMint(admin: AptosAccount, reciever: HexString, amount: number, name: string): Promise<string> {
    const rawTxn = await client.generateTransaction(admin.address(), {
        function:  `${admin.address()}::agar::mint_${name}_to`,
        type_arguments: [],
        arguments: [reciever.hex(), amount],
    });
    const bcsTxn = await client.signTransaction(admin, rawTxn);
    const pendingTxn = await client.submitTransaction(bcsTxn);
  
    return pendingTxn.hash;
}
//will finish buy later
async function abstractBuy(admin: AptosAccount, buyer: AptosAccount, amount: number, name: string) {
    const rawTxn = await client.generateTransaction(buyer.address(), {
        function:  `${COIN}::agar::buy_${name}`,
        type_arguments: [],
        arguments: [amount],
    });
    const bcsTxn = await client.signTransaction(buyer, rawTxn);
    const pendingTxn = await client.submitTransaction(bcsTxn);
  
    return pendingTxn.hash;
}
async function mintMass(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "mass");
}
async function mintSize(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
   return await abstractMint(admin, reciever, amount, "size");
}
async function mintSpeed(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "speed");
}
async function mintSlow(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "slow");
}
async function mintVirus(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "virus");
}
async function mintDouble(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "double");
}
async function mintTriple(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "triple");
}
async function mintRecombine(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "recombine");
}
async function mintTrophy(admin: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractMint(admin, reciever, amount, "trophy");
}

async function transferMass(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "mass");
}
async function transferSize(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "size");
}
async function transferSpeed(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "speed");
}
async function transferSlow(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "slow");
}
async function transferVirus(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "virus");
}
async function transferDouble(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "double");
}
async function transferTriple(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "triple");
}
async function transferRecombine(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "recombine");
}
async function transferTrophy(sender: AptosAccount, reciever: HexString, amount: number): Promise<string> {
    return await abstractTransfer(sender, reciever, amount, "trophy");
}
async function getBalance(account: MaybeHexString, coin: string): Promise<string | number> {
    const resource = await client.getAccountResource(
        account,
        `0x1::coin::CoinStore<${COIN}::agar::${coin}>`,
      );
      return parseInt((resource.data as any)["coin"]["value"]);
}

async function registerUser(user: AptosAccount): Promise<string> {
    const rawTxn = await client.generateTransaction(user.address(), {
        function:  `${COIN}::agar::register_user`,
        type_arguments: [],
        arguments: [],
    });
    const bcsTxn = await client.signTransaction(user, rawTxn);
    const pendingTxn = await client.submitTransaction(bcsTxn);
  
    return pendingTxn.hash;
}


const alice_private_key = new HexString("0x3212dc58ea52a6e46d5ea1c2c2ad838965f1bbb8e942d21196d1773c49de33dc") //new Uint8Array([50,18,220,88,234,82,166,228,109,94,161,194,194,173,131,137,101,241,187,184,233,66,210,17,150,209,119,60,73,222,51,220]);
async function main() {
    assert(process.argv.length == 3, "Expecting an argument that points to the moon_coin directory.");
    const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
    const cathy = new AptosAccount(new HexString("0x4d3df75abce48c26743594d35760c9df8127b1e56473cfd45be05b862c902838").toUint8Array());
    const alice = new AptosAccount(alice_private_key.toUint8Array());
    const bob_address = new HexString("0x9986beeb77fcfaf5bb57cd22ab67b415c693063b29e6f52503e8572bc9568330");
    await faucetClient.fundAccount(alice.address(), 100_000_000);
    await faucetClient.fundAccount(cathy.address(), 100_000_000);
    console.log("\n=== Addresses ===");
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob_address}`);
    const privateKey = new HexString(alice.toPrivateKeyObject().privateKeyHex).toUint8Array();
    console.log(`Alice private key: ${privateKey}`);
    console.log(`Alice priv key: ${alice.toPrivateKeyObject().privateKeyHex}`)
    console.log(`Cathy priv key: ${cathy.toPrivateKeyObject().privateKeyHex}`)
    let txnHash: any;   
       const modulePath = process.argv[2];
         const packageMetadata = fs.readFileSync(path.join(modulePath, "build", "Examples", "package-metadata.bcs"));
          const moduleData = fs.readFileSync(path.join(modulePath, "build", "Examples", "bytecode_modules", "agar.mv"));
  
    
          txnHash = await client.publishPackage(alice, new HexString(packageMetadata.toString("hex")).toUint8Array(), [
            new TxnBuilderTypes.Module(new HexString(moduleData.toString("hex")).toUint8Array()),
          ]);
          console.log("Publishing package: ", txnHash);
    await client.waitForTransaction(txnHash, { checkSuccess: true }); 
    return;
    //  txnHash = await registerUser(cathy);
    //  console.log("Registering cathy... ", txnHash);
    //  await client.waitForTransaction(txnHash, { checkSuccess: true })
    //getting alice balance...
    console.log(await getBalance(cathy.address(), "SizePowerUp"));
    txnHash = await mintMass(alice, cathy.address(), 10000000);
    console.log("Minting mass token to cathy: ", txnHash);
    await client.waitForTransaction(txnHash, { checkSuccess: true });

    txnHash = await mintSize(alice, cathy.address(), 1000);
    console.log("Minting size token to cathy: ", txnHash);
    await client.waitForTransaction(txnHash, { checkSuccess: true });

    txnHash = await transferMass(cathy, alice.address(), 10000000);
    console.log("Transfering mass token to alice: ", txnHash);
    await client.waitForTransaction(txnHash, { checkSuccess: true });
    // txnHash = await mintSize(alice, bob_address, 100);
    // console.log("Minting size token to bob: ", txnHash);
    // await client.waitForTransaction(txnHash, { checkSuccess: true });
}


main().then(() => console.log("DONE"));