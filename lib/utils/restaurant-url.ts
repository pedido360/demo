export function buildRestaurantUrl(
    slug: string
): string {

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL!;

    return `${baseUrl}/${slug}`;

}