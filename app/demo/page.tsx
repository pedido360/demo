import RestaurantApp from "@/components/restaurant/RestaurantApp";

import { restaurant } from "@/data/restaurant";
import { categories } from "@/data/categories";
import { products } from "@/data/products";

import { RestaurantPageData } from "@/types/restaurant-page";

export default function DemoPage() {

  const data: RestaurantPageData = {
    restaurant,
    categories,
    products,
  };

  return (
    <RestaurantApp
      data={data}
    />
  );

}