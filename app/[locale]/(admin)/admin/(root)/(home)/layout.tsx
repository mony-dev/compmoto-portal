"use client";

import NavBar from "@components/Admin/NavBar";
import { useEffect, useState } from "react";
import SideBar from "@components/Admin/SideBar";
import Footer from "@components/Admin/Footer";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useCart } from "@components/Admin/Cartcontext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileOpened, setIsMobileOpened] = useState(false);
  const [minisizeItems, setMinisizeItems] = useState<{ name: string }[]>([]);

  const { data: session, status } = useSession();
  const { setProfileImage } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileOpened((opened) => !opened);
  };

  useEffect(() => {
    const fetchMinisizeItems = async () => {
      try {
        const response = await fetch("/api/minisize");
        const data = await response.json();

        if (Array.isArray(data)) {
          setMinisizeItems(data);
        } else {
          console.error("Expected data to be an array, but received:", data);
          setMinisizeItems([]); // Fallback to empty array
        }
      } catch (error) {
        console.error("Failed to fetch minisize items", error);
        setMinisizeItems([]); // Fallback to empty array in case of error
      }
    };

    fetchMinisizeItems();
    setProfileImage(session?.user.image);
  }, [session, setProfileImage]);

  if (status === "loading") {
    return <div>Loading...</div>; // or a loading spinner
  }

  return (
    <>
      {/* <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <NavBar
          onToggle={toggleMobileMenu}
          isOpen={isMobileOpened}
          userData={session?.user}
          userId={session?.user.id}
        />
        <div style={{ display: "flex", flexGrow: 1 }}>
          <SideBar
            isOpen={isMobileOpened}
            onToggle={toggleMobileMenu}
            role={session?.user.role}
            minisizeItems={minisizeItems}
          />
          <div
            className={`relative w-full h-full pt-28 border-none sm:ml-60 bg-comp-gray-bg`}
          >
            {children}
            <Footer isOpen={isMobileOpened} />
          </div>
        </div>
      </div> */}
   

      <div className="grid grid-cols-6 grid-rows-auto bg-comp-gray-bg">
        <div className="row-start-2 row-end-auto col-start-1 col-end-2">
          <SideBar
              isOpen={isMobileOpened}
              onToggle={toggleMobileMenu}
              role={session?.user.role}
              minisizeItems={minisizeItems}
            />
        </div>
        <div className="col-span-6 auto-rows-auto pb-6 bg-comp-gray-bg">
          <NavBar
            onToggle={toggleMobileMenu}
            isOpen={isMobileOpened}
            userData={session?.user}
            userId={session?.user.id}
          />
        </div>
        <div className="border-none bg-comp-gray-bg col-span-5 row-span-6">
          {children}
        </div>
        <div className="col-span-6">
          <Footer isOpen={isMobileOpened} />
        </div>
      </div>
    </>
  );
};

export default Layout;
