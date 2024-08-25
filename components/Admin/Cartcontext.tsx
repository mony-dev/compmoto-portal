import { createContext, useContext, useState, ReactNode } from "react";

type CartContextType = {
  cartItemCount: number;
  setCartItemCount: (count: number) => void;
  i18nName: string;
  setI18nName: (name: string) => void;
  updateNamespaces: (namespaces: string[]) => void;
  profileImage: string;
  setProfileImage: (name: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [i18nName, setI18nName] = useState<string>("");
  const [updateNamespaces, setUpdateNamespaces] = useState<(namespaces: string[]) => void>(() => () => {});
  const [profileImage, setProfileImage] = useState<string>("");

  return (
    <CartContext.Provider value={{ cartItemCount, setCartItemCount, i18nName, setI18nName, updateNamespaces, profileImage, setProfileImage }}>
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
