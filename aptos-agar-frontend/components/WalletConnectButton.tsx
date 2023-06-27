import { useWallet } from "./WalletContext";



export default function WalletConnectButton() {
    const { connect, disconnect, connected, publicKey, address } = useWallet();
    const toggleState = async () => {
        if (connected) {
            await disconnect();
        } else {
            await connect();
        }
    };
    return (
        <button onClick={toggleState} className="bg-red-400 border border-white py-2 px-6 rounded-lg hover:brightness-90 active:brightness-75">
            {connected ? shorten(address) : "Connect"}
        </button>
    );
}
const shorten = (address: string) => {
    return address.slice(0, 4) + "..." + address.slice(address.length - 4, address.length);
};