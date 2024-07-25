"use client"

import "react-toastify/dist/ReactToastify.css"; // Import the CSS styles

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
};

export default Layout;
