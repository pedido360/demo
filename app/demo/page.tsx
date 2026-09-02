import RestaurantApp from "@/components/restaurant/RestaurantApp";

import { restaurant } from "@/data/restaurant";
import { categories } from "@/data/categories";
import { products } from "@/data/products";

import {
  DailyMenuClient,
} from "@/types/daily-menu";

import { RestaurantPageData } from "@/types/restaurant-page";


const dailyMenu: DailyMenuClient = {

  id: "daily-menu-demo",

  restaurantId: restaurant.id,

  menuProductId: "daily-menu-demo",

  menuDate: new Date()
    .toISOString()
    .slice(0, 10),

  isPublished: true,

  image: null,

  sizes: [

    {
      id: "daily-menu-size-1",
      dailyMenuId: "daily-menu-demo",
      label: "Personal",
      price: 22000,
      isAvailable: true,
      sortOrder: 1,
    },

    {
      id: "daily-menu-size-2",
      dailyMenuId: "daily-menu-demo",
      label: "Especial",
      price: 25000,
      isAvailable: true,
      sortOrder: 2,
    },

    {
      id: "daily-menu-size-3",
      dailyMenuId: "daily-menu-demo",
      label: "Ejecutivo",
      price: 28000,
      isAvailable: true,
      sortOrder: 3,
    },

  ],

  options: [

    {
      id: "demo-soup-1",
      section: "soup",
      name: "Sopa de verduras",
      sortOrder: 1,
    },

    {
      id: "demo-seco-1",
      section: "seco",
      name: "Arroz blanco",
      sortOrder: 1,
    },

    {
      id: "demo-seco-2",
      section: "seco",
      name: "Frijoles",
      sortOrder: 2,
    },

    {
      id: "demo-seco-3",
      section: "seco",
      name: "Ensalada fresca",
      sortOrder: 3,
    },

    {
      id: "demo-principle-1",
      section: "principle",
      name: "Papa criolla",
      sortOrder: 1,
    },

    {
      id: "demo-principle-2",
      section: "principle",
      name: "Yuca al vapor",
      sortOrder: 2,
    },

    {
      id: "demo-protein-1",
      section: "protein",
      name: "Pechuga a la plancha",
      sortOrder: 1,
    },

    {
      id: "demo-protein-2",
      section: "protein",
      name: "Carne sudada",
      sortOrder: 2,
    },

    {
      id: "demo-protein-3",
      section: "protein",
      name: "Cerdo BBQ",
      sortOrder: 3,
    },

    {
      id: "demo-drink-1",
      section: "drink",
      name: "Jugo natural",
      sortOrder: 1,
    },

    {
      id: "demo-drink-2",
      section: "drink",
      name: "Limonada",
      sortOrder: 2,
    },

    {
      id: "demo-dessert-1",
      section: "dessert",
      name: "Flan casero",
      sortOrder: 1,
    },

    {
      id: "demo-dessert-2",
      section: "dessert",
      name: "Arroz con leche",
      sortOrder: 2,
    },

  ],

};


export default function DemoPage() {

  const data: RestaurantPageData = {

    restaurant,

    categories,

    products,

    dailyMenu,

  };


  return (

    <RestaurantApp
      data={data}
    />

  );

}