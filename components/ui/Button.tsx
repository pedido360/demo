import Link from "next/link";

interface Props {
    href: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary";
}

export default function Button({
    href,
    children,
    variant = "primary",
}: Props) {
    const styles =
        variant === "primary"
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100";

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center rounded-xl px-6 py-4 font-semibold transition ${styles}`}
        >
            {children}
        </Link>
    );
}