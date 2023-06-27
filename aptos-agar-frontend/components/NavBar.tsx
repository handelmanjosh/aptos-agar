import StyledLink from "./StyledLink";


export default function NavBar({ page }: { page: string; }) {
    return (
        <div className="w-full h-full flex flex-row justify-between items-center px-8">
            <div className="flex flex-row w-[10%] justify-start items-center ">
                <p className="text-3xl">Aptos Mass</p>
            </div>
            <div className="flex flex-row justify-end items-center gap-4">
                {page == "shop" ?
                    <>
                        <StyledLink href="/" text="Play" />
                        <StyledLink href="/roadmap" text="Roadmap" />
                        <StyledLink href="/about" text="About" />
                    </>
                    : page == "roadmap" ?
                        <>
                            <StyledLink href="/" text="Play" />
                            <StyledLink href="/shop" text="Shop" />
                            <StyledLink href="/about" text="About" />
                        </>
                        :
                        <>
                            <StyledLink href="/" text="Play" />
                            <StyledLink href="/roadmap" text="Shop" />
                            <StyledLink href="/about" text="Roadmap" />
                        </>
                }
            </div>
        </div>
    );
}
