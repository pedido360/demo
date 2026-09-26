export function buildRestaurantUrl(
    slug: string
): string {

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL!;

    const hostname =
        new URL(baseUrl).hostname;

    return `https://${slug}.${hostname}`;

}
