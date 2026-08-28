import {
    uploadImage,
} from "@/lib/repositories/storage.repository";


export async function uploadDailyMenuImage(
    restaurantId: string,
    menuId: string,
    file: File
): Promise<string> {

    return uploadImage(
        file,
        `restaurants/${restaurantId}/daily-menu/${menuId}/cover.webp`
    );

}