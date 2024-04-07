"use client";

import NavBar from "@components/Admin/NavBar";
import { Session } from "next-auth";
// import SessionLayout from "@components/Layout";
// import SideBar from "@components/Admin/SideBar";
import { GRAY_BG } from "@components/Colors";
import { useState } from "react";
import SideBar from "@components/Admin/SideBar";
import Footer from "@components/Admin/Footer";
import { BLACK_BG_COLOR } from "@components/Colors";

const Layout = ({ children, session }: { children: React.ReactNode; session: Session }) => {
  const [isMobileOpened, setIsMobileOpened] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileOpened((opened) => !opened);
  };

  return (
    // <SessionLayout session={session}>
    <>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <NavBar onToggle={toggleMobileMenu} isOpen={isMobileOpened} />
        <div style={{ display: "flex", flexGrow: 1 }}>
          <SideBar isOpen={isMobileOpened} onToggle={toggleMobileMenu} />
          <div className={`relative w-full h-full py-8 border-none pt-28 sm:ml-60 bg-comp-gray-bg`}>{children}</div>
        </div>
        <Footer isOpen={isMobileOpened} />
      </div>
    </>
    // </SessionLayout>
  );
};

export default Layout;
