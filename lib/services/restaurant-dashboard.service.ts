import { getRestaurantById } from "@/lib/repositories/restaurant.repository";
import { getRestaurantHours } from "@/lib/repositories/restaurant-hours.repository";
import { getCategories } from "@/lib/repositories/category.repository";
import { getProducts } from "@/lib/repositories/product.repository";

export async function loadRestaurantDashboard(
    restaurantId: string
) {
    const restaurant =
        await getRestaurantById(restaurantId);

    const hours =
        await getRestaurantHours(restaurantId);

    const categories =
        await getCategories(restaurantId);

    const products =
        await getProducts(restaurantId);

    return {
        restaurant,
        hours,
        categories,
        products,
    };
}