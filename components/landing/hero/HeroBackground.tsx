export default function HeroBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange-200 blur-3xl opacity-50" />

            <div className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-orange-100 blur-3xl opacity-50" />
        </div>
    );
}