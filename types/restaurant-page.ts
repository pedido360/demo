import { Category } from "./category";
import { Product } from "./product";
import { Restaurant } from "./restaurant";

export interface RestaurantPageData {
    restaurant: Restaurant;
    categories: Category[];
    products: Product[];
}
