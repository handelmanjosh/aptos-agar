

export default function HomeLink({ href, text }: { href: string; text: string; }) {
    return (
        <a href={href} className="text-white font-bold hover:underline text-lg">
            {text}
        </a>
    );
}