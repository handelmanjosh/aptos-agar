import { createContext, useContext, useEffect, useState } from "react";
import { checkExistence } from "./aptos/balance";
import registerUser from "./aptos/register";
import { AptosClient } from "aptos";


type WalletContextData = {
    address: string;
    publicKey: string;
    sign: (transaction: any) => any;
    connect: () => any;
    disconnect: () => any;
    connected: boolean;
};


const WalletContext = createContext<WalletContextData>({} as WalletContextData);


export function useWallet() {
    return useContext(WalletContext);
}
let ran = false;
export function AuthProvider({ children }: { children: React.ReactNode; }) {
    const [address, setAddress] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    useEffect(() => {
        if (address) {
            console.log(address);
            checkExistence(address).then((res) => {
                if (!res) {
                    console.log("Address", address);
                    //testTransaction(address, sign);
                    registerUser(sign);
                    //registerUser(address, sign);
                }
            });
        }
    }, [publicKey, address]);

    useEffect(() => {
        if (!ran) {
            connect();
            ran = true;
        }
    }, []);
    const connect = async () => {
        if ('aptos' in window) {
            try {
                const wallet = window.aptos as any;
                const response = await wallet.connect();
                const account = await wallet.account();
                setAddress(account.address);
                setPublicKey(account.publicKey);
                setConnected(true);
            } catch (e) {
                console.error(e);
            } finally {
                return true;
            }
        }
        return false;
    };
    const disconnect = async () => {
        if ('aptos' in window) {
            const wallet = window.aptos as any;
            await wallet.disconnect();
            setPublicKey("");
            setAddress("");
            setConnected(false);
        }
    };
    const sign = async (transaction: any) => {
        if ('aptos' in window) {
            const wallet = window.aptos as any;
            const pendingTxn = await wallet.signAndSubmitTransaction(transaction);
            return pendingTxn;
        }
    };
    // const testTransaction = async (address: string, sign: (t: any) => any) => {
    //     const transaction = {
    //         arguments: [address, '717'],
    //         function: '0x1::coin::transfer',
    //         type: 'entry_function_payload',
    //         type_arguments: ['0x1::aptos_coin::AptosCoin'],
    //     };

    //     try {
    //         const pendingTransaction = await sign(transaction);

    //         // In most cases a dApp will want to wait for the transaction, in these cases you can use the typescript sdk
    //         const client = new AptosClient('https://testnet.aptoslabs.com');
    //         const txn = await client.waitForTransactionWithResult(
    //             pendingTransaction.hash,
    //         );
    //     } catch (error) {
    //         console.error(error);
    //         // see "Errors"
    //     }

    // };
    const value = {
        address,
        publicKey,
        connected,
        connect,
        disconnect,
        sign,
    };
    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );

}