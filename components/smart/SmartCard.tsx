import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SmartCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
}

export default function SmartCard({
    title,
    description,
    icon,
    href,
}: SmartCardProps) {

    return (

        <Link
            href={href}
            className="block"
        >

            <div className="flex items-center rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">

                    {icon}

                </div>

                <div className="ml-4 flex-1">

                    <h2 className="font-bold text-lg">
                        {title}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {description}
                    </p>

                </div>

                <ChevronRight
                    className="text-gray-400"
                    size={22}
                />

            </div>

        </Link>

    );

}
