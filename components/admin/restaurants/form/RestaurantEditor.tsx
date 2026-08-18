"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/feedback/Loading";

import RestaurantInfoForm from "./RestaurantInfoForm";
import RestaurantHoursEditor from "./RestaurantHoursEditor";
import RestaurantOwnerForm from "./RestaurantOwnerForm";
import { RestaurantOwner } from "@/types/restaurant-owner";

import CategoryEditor from "@/components/admin/categories/CategoryEditor";
import ProductEditor from "@/components/admin/products/ProductEditor";
import SmartMenu from "@/components/admin/smart-menu/SmartMenu";
import RestaurantCreatedModal from "@/components/admin/restaurants/RestaurantCreatedModal";

import { buildRestaurantUrl } from "@/lib/utils/restaurant-url";

import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";
import { generateSlug } from "@/lib/utils/slug";


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

import {
    uploadImage,
} from "@/lib/repositories/storage.repository";

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
    const [restaurantUrl, setRestaurantUrl] = useState("");
    const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);

    const [restaurant, setRestaurant] = useState<Restaurant>({
        id: "",
        slug: "",

        name: "",
        description: "",

        logo: "",
        banner: "",

        whatsapp: "",

        address: "",

        neighborhood: "",

        city: "",

        department: "",

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
    const [owner, setOwner] = useState<RestaurantOwner>({
        fullName: "",
        email: "",
        password: "",
    });

    const [logoFile, setLogoFile] =
        useState<File | null>(null);

    const [bannerFile, setBannerFile] =
        useState<File | null>(null);

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

            setHours(hoursData);

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
                console.log("=== HANDLE SAVE ===");
                console.log("Restaurant:", restaurant);
                console.log("Categories:", categories);
                console.log("Products:", products);

                const slug = generateSlug(
                    restaurant.name
                );

                restaurant.slug = slug;

                if (logoFile) {

                    const extension =
                        logoFile.name
                            .split(".")
                            .pop()
                            ?.toLowerCase() ?? "jpg";

                    restaurant.logo =
                        await uploadImage(
                            logoFile,
                            `restaurants/${slug}/logo.${extension}`
                        );

                }

                if (bannerFile) {

                    const extension =
                        bannerFile.name
                            .split(".")
                            .pop()
                            ?.toLowerCase() ?? "jpg";

                    restaurant.banner =
                        await uploadImage(
                            bannerFile,
                            `restaurants/${slug}/banner.${extension}`
                        );

                }

                const result =
                    await createCompleteRestaurant({
                        restaurant,
                        hours,
                        categories,
                        products,
                    });

                const response = await fetch("/api/restaurant-users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: owner.fullName,
                        email: owner.email,
                        password: owner.password,
                        restaurantId: result.restaurant.id,
                    }),
                });

                const userResult = await response.json();

                if (!response.ok) {

                    alert(
                        `⚠️ El restaurante fue creado correctamente, pero no fue posible crear el usuario.\n\n${userResult.message}`
                    );

                } else {

                    console.log(
                        "Usuario creado correctamente.",
                        userResult.user
                    );

                }


                const url = buildRestaurantUrl(
                    result.restaurant.slug
                );

                setRestaurantUrl(url);

                setIsCreatedModalOpen(true);

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
        <>
            <RestaurantCreatedModal
                open={isCreatedModalOpen}
                url={restaurantUrl}
                onClose={() => setIsCreatedModalOpen(false)}
            />

            <div className="space-y-6">
                <RestaurantInfoForm
                    restaurant={restaurant}
                    setRestaurant={setRestaurant}

                    logoFile={logoFile}
                    setLogoFile={setLogoFile}

                    bannerFile={bannerFile}
                    setBannerFile={setBannerFile}
                />

                <RestaurantHoursEditor
                    hours={hours}
                    setHours={setHours}
                />

                <RestaurantOwnerForm
                    owner={owner}
                    setOwner={setOwner}
                />

                {isEditMode ? (

                    <SmartMenu
                        restaurantId={restaurant.id}
                        categories={categories}
                        products={products}
                    />

                ) : (

                    <>

                        <CategoryEditor
                            restaurantId={restaurant.id}
                            categories={categories}
                            setCategories={setCategories}
                        />

                        <ProductEditor
                            categories={categories}
                            products={products}
                            setProducts={setProducts}
                        />

                    </>

                )}

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
        </>

    );


}