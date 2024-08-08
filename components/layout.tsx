"use client";

import "react-toastify/dist/ReactToastify.css"; // Import the CSS styles

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { CartProvider } from "./Admin/Cartcontext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
};

export default Layout;
