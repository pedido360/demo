"use client";

export type RestaurantTab =
    | "information"
    | "categories"
    | "products"
    | "settings";

interface RestaurantTabsProps {
    activeTab: RestaurantTab;
    onChange: (tab: RestaurantTab) => void;
}

const tabs: {
    id: RestaurantTab;
    label: string;
}[] = [
        {
            id: "information",
            label: "Información",
        },
        {
            id: "categories",
            label: "Categorías",
        },
        {
            id: "products",
            label: "Productos",
        },
        {
            id: "settings",
            label: "Configuración",
        },
    ];

export default function RestaurantTabs({
    activeTab,
    onChange,
}: RestaurantTabsProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-2">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === tab.id
                                ? "bg-green-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}