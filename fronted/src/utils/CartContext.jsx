import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error parsing cart data from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        const { id, type = 'producto', quantity = 1 } = item;

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === id && i.type === type);
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === id && i.type === type
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            } else {
                return [...prevItems, { ...item, type, quantity }];
            }
        });
    };

    const removeFromCart = (id, type) => {
        setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.type === type)));
    };

    const updateQuantity = (id, type, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id, type);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === id && item.type === type ? { ...item, quantity } : item
                )
            );
        }
    };
    console.log('CartContext re-render - items:', cartItems.length);

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};