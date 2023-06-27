

function IconWrapper({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex items-center justify-center w-full h-full">
            {children}
        </div>
    );
}
export function ArrowRight() {
    return (
        <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[75%] aspect-square">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </IconWrapper>
    );
}
export function Check() {
    return (
        <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[75%] aspect-square">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </IconWrapper>
    );
}
export function Plus() {
    return (
        <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[75%] aspect-square">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </IconWrapper>
    );
}

export function Minus() {
    return (
        <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[75%] aspect-square">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
        </IconWrapper>
    );
}
