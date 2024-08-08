import { createContext, useContext, useState, ReactNode } from "react";

type CartContextType = {
  cartItemCount: number;
  setCartItemCount: (count: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  return (
    <CartContext.Provider value={{ cartItemCount, setCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
