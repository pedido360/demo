import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    width?: number;
    height?: number;
}

export default function Logo({
    width = 190,
    height = 50,
}: LogoProps) {
    return (
        <Link href="/" className="inline-flex items-center">
            <Image
                src="/logo.png"
                alt="Pedidos360"
                width={width}
                height={height}
                priority
            />
        </Link>
    );
}