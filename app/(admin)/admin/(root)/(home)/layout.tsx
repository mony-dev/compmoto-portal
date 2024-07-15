"use client";

import NavBar from "@components/Admin/NavBar";
import { Session } from "next-auth";
import { GRAY_BG } from "@components/Colors";
import { useState } from "react";
import SideBar from "@components/Admin/SideBar";
import Footer from "@components/Admin/Footer";
import { useSession } from "next-auth/react"
const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isMobileOpened, setIsMobileOpened] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileOpened((opened) => !opened);
  };
  // const session = await getServerSession();
  const { data: session, status } = useSession()
  if (status === "loading") {
    return <div>Loading...</div> // or a loading spinner
  }
  console.log("session", session)

  return (
    // <SessionLayout session={session}>
    <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <NavBar onToggle={toggleMobileMenu} isOpen={isMobileOpened} userData={session?.user}/>
          <div style={{ display: "flex", flexGrow: 1 }}>
            <SideBar isOpen={isMobileOpened} onToggle={toggleMobileMenu} role={session?.user.role}/>
            <div
              className={`relative w-full h-full pt-28 border-none sm:ml-60 bg-comp-gray-bg`}
            >
              {children}
              <Footer isOpen={isMobileOpened} />
            </div>
          </div>
        </div>
    </>
    // </SessionLayout>
  );
};

export default Layout;
