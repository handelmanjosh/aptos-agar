


export default function StyledLink({ href, text }: { href: string; text: string; }) {
    return (
        <a href={href} className="rounded-lg bg-red-400 hover:brightness-90 active:brightness-75 py-4 px-8">
            {text}
        </a>
    );
}