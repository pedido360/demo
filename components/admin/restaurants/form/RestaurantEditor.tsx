"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/feedback/Loading";

import RestaurantInfoForm from "./RestaurantInfoForm";
import RestaurantHoursEditor from "./RestaurantHoursEditor";

import CategoryEditor from "@/components/admin/categories/CategoryEditor";
import ProductEditor from "@/components/admin/products/ProductEditor";

import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";

import {
    createCompleteRestaurant,
} from "@/lib/services/restaurant.service";

import {
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
} from "@/lib/repositories/restaurant.repository";

import {
    createRestaurantHours,
    getRestaurantHours,
    updateRestaurantHours,
} from "@/lib/repositories/restaurant-hours.repository";

import {
    getCategories,
} from "@/lib/repositories/category.repository";

import {
    getProducts,
} from "@/lib/repositories/product.repository";

interface RestaurantEditorProps {
    restaurantId?: string;
}

const defaultHours: RestaurantHour[] = [
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
];

export default function RestaurantEditor({
    restaurantId,
}: RestaurantEditorProps) {

    const isEditMode = Boolean(restaurantId);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);

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

        status: "active",
        pauseReason: null,
        pausedAt: null,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [hours, setHours] = useState<RestaurantHour[]>(defaultHours);

    useEffect(() => {

        if (!restaurantId) {
            return;
        }

        loadRestaurant();

    }, [restaurantId]);

    async function loadRestaurant() {

        try {

            setLoadingData(true);

            const restaurantData =
                await getRestaurantById(restaurantId!);

            const hoursData =
                await getRestaurantHours(restaurantId!);

            const categoriesData =
                await getCategories(restaurantId!);

            const productsData =
                await getProducts(restaurantId!);

            setRestaurant(restaurantData);

            setCategories(categoriesData);

            setProducts(productsData);

            if (hoursData.length > 0) {

                setHours(
                    hoursData.map((hour) => ({
                        dayOfWeek: hour.day_of_week,
                        isOpen: hour.is_open,
                        openTime: hour.open_time ?? "08:00",
                        closeTime: hour.close_time ?? "22:00",
                    }))
                );

            }

        } catch (error) {

            console.error(error);
            alert("No fue posible cargar el restaurante.");

        } finally {

            setLoadingData(false);

        }

    }

    if (loadingData) {

        return (
            <Loading
                title="Cargando restaurante..."
                description="Espera un momento mientras obtenemos la información."
            />
        );

    }


    async function handleSave() {
        try {
            setLoading(true);

            if (isEditMode) {

                await updateRestaurant(
                    restaurant.id,
                    restaurant
                );

                await updateRestaurantHours(
                    restaurant.id,
                    hours
                );

                // En el siguiente sprint actualizaremos
                // categorías y productos.

                alert("✅ Restaurante actualizado correctamente.");

            } else {

                await createCompleteRestaurant({
                    restaurant,
                    hours,
                    categories,
                    products,
                });

                alert("✅ Restaurante creado correctamente.");

            }

        } catch (error) {

            console.error(error);

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
                        ? isEditMode
                            ? "Actualizando..."
                            : "Guardando..."
                        : isEditMode
                            ? "Actualizar restaurante"
                            : "Guardar restaurante"}
                </Button>

            </div>

        </div>

    );

}