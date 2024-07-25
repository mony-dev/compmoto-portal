"use client";
import StyledComponentsRegistry from "@lib-utils/styled-components-registry";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RootAdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <StyledComponentsRegistry>
        <ToastContainer />
        {children}
      </StyledComponentsRegistry>
    </SessionProvider>
  );
};

export default RootAdminLayout;
