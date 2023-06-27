


export default function PlayButton({ onClick, text }: { onClick: () => any, text: string; }) {
    return (
        <button onClick={onClick} className="bg-red-400 border border-white py-2 px-6 rounded-lg hover:brightness-90 active:brightness-75">
            {text}
        </button>
    );
}