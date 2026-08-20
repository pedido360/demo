import { Category } from "./category";
import { Product } from "./product";
import { Restaurant } from "./restaurant";
import { RestaurantHour } from "./restaurant-hour";
import { DailyMenuClient } from "./daily-menu";


export interface RestaurantPageData {

    restaurant: Restaurant;

    categories: Category[];

    products: Product[];

    hours?: RestaurantHour[];

    dailyMenu?: DailyMenuClient | null;

}