"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import RestaurantInfoForm from "./RestaurantInfoForm";
import RestaurantHoursEditor from "./RestaurantHoursEditor";

import CategoryEditor from "@/components/admin/categories/CategoryEditor";
import ProductEditor from "@/components/admin/products/ProductEditor";

import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";

import { createRestaurant } from "@/lib/repositories/restaurant.repository";
import { createRestaurantHours } from "@/lib/repositories/restaurant-hours.repository";

export default function RestaurantEditor() {

    const [loading, setLoading] = useState(false);

    const [restaurant, setRestaurant] = useState<Restaurant>({
        id: "",
        slug: "",

        name: "",
        description: "",

        logo: "",
        banner: "",

        whatsapp: "",

        address: "",

        city: "",

        isOpen: true,

        rating: 5,

        categories: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [hours, setHours] = useState<RestaurantHour[]>([
        {
            dayOfWeek: 1,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 2,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 3,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 4,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 5,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 6,
            isOpen: true,
            openTime: "08:00",
            closeTime: "22:00",
        },
        {
            dayOfWeek: 0,
            isOpen: false,
            openTime: "08:00",
            closeTime: "22:00",
        },
    ]);

    async function handleSave() {

        try {

            setLoading(true);

            const savedRestaurant = await createRestaurant(restaurant);

            await createRestaurantHours(
                savedRestaurant.id,
                hours
            );

            console.log("Restaurante creado:", savedRestaurant);

            alert("✅ Restaurante creado correctamente.");

        } catch (error) {

            console.error("ERROR:", error);

            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Error desconocido");
            }

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="space-y-6">

            <RestaurantInfoForm
                restaurant={restaurant}
                setRestaurant={setRestaurant}
            />

            <RestaurantHoursEditor
                hours={hours}
                setHours={setHours}
            />

            <CategoryEditor
                categories={categories}
                setCategories={setCategories}
            />

            <ProductEditor
                categories={categories}
                products={products}
                setProducts={setProducts}
            />

            <Card
                title="Configuración"
                description="Opciones adicionales del restaurante"
            >
                <p className="text-sm text-gray-500">
                    Próximamente...
                </p>
            </Card>

            <div className="flex justify-end">

                <Button
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading
                        ? "Guardando..."
                        : "Guardar restaurante"}
                </Button>

            </div>

        </div>

    );

}