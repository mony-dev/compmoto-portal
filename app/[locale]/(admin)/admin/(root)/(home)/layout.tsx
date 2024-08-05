"use client";

import NavBar from "@components/Admin/NavBar";
import { useEffect, useState } from "react";
import SideBar from "@components/Admin/SideBar";
import Footer from "@components/Admin/Footer";
import { useSession } from "next-auth/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileOpened, setIsMobileOpened] = useState(false);
  const [minisizeItems, setMinisizeItems] = useState<{ name: string }[]>([]);
  
  const { data: session, status } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileOpened((opened) => !opened);
  };

  useEffect(() => {
    const fetchMinisizeItems = async () => {
      try {
        const response = await fetch('/api/minisize');
        const data = await response.json();
        setMinisizeItems(data);
      } catch (error) {
        console.error('Failed to fetch minisize items', error);
      }
    };

    fetchMinisizeItems();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>; // or a loading spinner
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar onToggle={toggleMobileMenu} isOpen={isMobileOpened} userData={session?.user} />
      <div style={{ display: "flex", flexGrow: 1 }}>
        <SideBar isOpen={isMobileOpened} onToggle={toggleMobileMenu} role={session?.user.role} minisizeItems={minisizeItems} />
        <div className={`relative w-full h-full pt-28 border-none sm:ml-60 bg-comp-gray-bg`}>
          {children}
          <Footer isOpen={isMobileOpened} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
