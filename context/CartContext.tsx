"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    ReactNode,
} from "react";

import { ProductSelection } from "@/types/product";

interface CartContextType {
    items: ProductSelection[];

    addToCart: (item: ProductSelection) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;

    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {

    const [items, setItems] = useState<ProductSelection[]>([]);

    function addToCart(item: ProductSelection) {
        setItems((current) => [...current, item]);
    }

    function removeFromCart(index: number) {
        setItems((current) => current.filter((_, i) => i !== index));
    }

    function clearCart() {
        setItems([]);
    }

    const totalItems = useMemo(
        () =>
            items.reduce(
                (total, item) => total + item.quantity,
                0
            ),
        [items]
    );

    const totalPrice = useMemo(
        () =>
            items.reduce(
                (total, item) =>
                    total + item.product.price * item.quantity,
                0
            ),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {

    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCartContext debe usarse dentro de CartProvider."
        );
    }

    return context;
}