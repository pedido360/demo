import RestaurantList from "@/components/admin/restaurants/list/RestaurantList";
import RestaurantToolbar from "@/components/admin/restaurants/list/RestaurantToolbar";

export default function RestaurantsPage() {
    return (
        <div className="space-y-6">
            <RestaurantToolbar />

            <RestaurantList />
        </div>
    );
}