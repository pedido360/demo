import { Category } from "./category";
import { Product } from "./product";
import { Restaurant } from "./restaurant";
import { RestaurantHour } from "./restaurant-hour";

export interface RestaurantPageData {
    restaurant: Restaurant;
    categories: Category[];
    products: Product[];
    hours?: RestaurantHour[];
}