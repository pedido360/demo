interface Props {
    rows?: number;
}

export default function Skeleton({
    rows = 3,
}: Props) {
    return (
        <div className="animate-pulse space-y-4">

            {Array.from({ length: rows }).map((_, index) => (

                <div
                    key={index}
                    className="h-24 rounded-xl bg-gray-200"
                />

            ))}

        </div>
    );
}