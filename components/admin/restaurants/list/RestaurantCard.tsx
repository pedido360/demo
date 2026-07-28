"use client";

import {
    MapPin,
    Phone,
    Star,
    Pencil,
    Trash2,
    Pause,
    Play,
} from "lucide-react";

import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import Button from "@/components/ui/Button";

import RestaurantStatusBadge from "./RestaurantStatusBadge";
import RestaurantAccountStatusBadge from "./RestaurantAccountStatusBadge";

import { Restaurant } from "@/types/restaurant";

interface Props {
    restaurant: Restaurant;
    onDelete?: (id: string) => void;
    onToggleStatus?: (restaurant: Restaurant) => void;
}

export default function RestaurantCard({
    restaurant,
    onDelete,
    onToggleStatus,
}: Props) {
    const isPaused = restaurant.status === "paused";

    return (
        <Card className="overflow-hidden p-0">
            {restaurant.banner ? (
                <div className="relative h-44 w-full">
                    <img
                        src={restaurant.banner}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                    />

                    {restaurant.logo && (
                        <div className="absolute -bottom-8 left-6">
                            <img
                                src={restaurant.logo}
                                alt={restaurant.name}
                                className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-lg"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex h-32 items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                    <span className="text-4xl font-bold text-white">
                        {restaurant.name.charAt(0)}
                    </span>
                </div>
            )}

            <div
                className={`space-y-5 p-6 ${restaurant.banner ? "pt-10" : ""
                    }`}
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {restaurant.name}
                        </h2>

                        {restaurant.description && (
                            <p className="mt-2 text-gray-500">
                                {restaurant.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <RestaurantAccountStatusBadge
                            status={restaurant.status}
                        />

                        {!isPaused && (
                            <RestaurantStatusBadge
                                isOpen={restaurant.isOpen}
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        <span>{restaurant.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Phone size={18} />
                        <span>{restaurant.whatsapp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Star size={18} />
                        <span>{restaurant.rating}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t pt-5">
                    <LinkButton
                        href={`/dashboard/restaurants/${restaurant.id}/edit`}
                        leftIcon={<Pencil size={18} />}
                    >
                        Editar
                    </LinkButton>

                    <Button
                        variant="outline"
                        onClick={() => onToggleStatus?.(restaurant)}
                    >
                        <span className="flex items-center gap-2">
                            {isPaused ? (
                                <>
                                    <Play size={18} />
                                    Reanudar
                                </>
                            ) : (
                                <>
                                    <Pause size={18} />
                                    Suspender
                                </>
                            )}
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => onDelete?.(restaurant.id)}
                    >
                        <span className="flex items-center gap-2 text-red-600">
                            <Trash2 size={18} />
                            Eliminar
                        </span>
                    </Button>
                </div>
            </div>
        </Card>
    );
}