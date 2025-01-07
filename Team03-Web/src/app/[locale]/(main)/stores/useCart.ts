import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set) => ({
            cartItems: [],
            setCartItems: (cartItems: any[]) => set(() => ({ cartItems })),
            // setQuantity: (cartItem: any, quantity: number) => set(() => ({ cartItems: cartItem.map((item: any) => ({ ...item, quantity })) })),
            // setCartItem: (cartItem: any) => set(() => ({ cartItems: [cartItem] })),
            removeCartItem: (cartItem: any) => set(() => ({ cartItems: cartItem.filter((item: { id: any; }) => item.id !== cartItem.id) })),
            addCartItem: (cartItem: any) => set(() => ({ cartItems: [...cartItem, cartItem] })),
            clearCart: () => set(() => ({ cartItems: [] }))
        }),
        {
            name: 'cart',
            partialize: (state: any) => ({
                cartItems: state.cartItems
            })
        }
    )
);

export default useCartStore;
