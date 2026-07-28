"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";

import { Restaurant } from "@/types/restaurant";

interface RestaurantInfoFormProps {
    restaurant: Restaurant;
    setRestaurant: React.Dispatch<React.SetStateAction<Restaurant>>;
}

export default function RestaurantInfoForm({
    restaurant,
    setRestaurant,
}: RestaurantInfoFormProps) {
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setRestaurant((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    return (
        <Card
            title="Información del restaurante"
            description="Completa los datos principales de tu negocio."
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <div>
                    <Label required>Nombre</Label>

                    <Input
                        name="name"
                        placeholder="Ej. Pizzería Don Luigi"
                        value={restaurant.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label required>WhatsApp</Label>

                    <Input
                        name="whatsapp"
                        placeholder="3001234567"
                        value={restaurant.whatsapp}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label required>Dirección</Label>

                    <Input
                        name="address"
                        placeholder="Calle 10 #15-20"
                        value={restaurant.address}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label required>Ciudad</Label>

                    <Input
                        name="city"
                        placeholder="Bogotá"
                        value={restaurant.city}
                        onChange={handleChange}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label>Descripción</Label>

                    <Textarea
                        name="description"
                        placeholder="Describe tu restaurante..."
                        value={restaurant.description}
                        onChange={handleChange}
                        helperText="Esta descripción aparecerá en el menú digital."
                    />
                </div>

                <div>
                    <Label>Logo</Label>

                    <Input
                        name="logo"
                        placeholder="https://..."
                        value={restaurant.logo}
                        onChange={handleChange}
                        helperText="URL del logo."
                    />
                </div>

                <div>
                    <Label>Banner</Label>

                    <Input
                        name="banner"
                        placeholder="https://..."
                        value={restaurant.banner}
                        onChange={handleChange}
                        helperText="URL del banner."
                    />
                </div>

            </div>
        </Card>
    );
}