"use client";
import "@style/globals.scss";
import "@style/fonts.scss";
import NavBar from "@components/Admin/NavBar";
import { useEffect, useState } from "react";
import SideBar from "@components/Admin/SideBar";
import Footer from "@components/Admin/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@components/Admin/Cartcontext";
import axios from "axios";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isMobileOpened, setIsMobileOpened] = useState(false);
  const [minisizeItems, setMinisizeItems] = useState<{ name: string }[]>([]);
  const { setProfileImage, setUserId } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileOpened((opened) => !opened);
  };
  const getUserId = () => {
    setUserId(session?.user.id);
    return session?.user.id;
  };

  useEffect(() => {
    const fetchMinisizeItems = async () => {
      try {
        if (session) {
          await setProfileImage(session.user.image);
        }
        const userId = getUserId();
        // const response = await axios.get("/api/minisizeMenu/");
        const response = await axios.get(`/api/minisizeMenu`, {
          params: {
            userId: userId,
          },
        });
        const data = response.data.data;
        const minisize = data.map((mini: any, index: number) => ({
          key: index + 1,
          name: mini.name,
        }));
        setMinisizeItems(Array.isArray(minisize) ? minisize : []); // Ensure it's an array
      } catch (error) {
        console.error("Failed to fetch minisize items", error);
        setMinisizeItems([]); // Fallback to an empty array in case of error
      }
    };

    fetchMinisizeItems();
  }, []); // Fetch minisize items on initial mount

  // useEffect(() => {
  //   if (session) {
  //     // Only set profile image if the session is available
  //     setProfileImage(session.user.image);
  //     setUserId(session.user.id);
  //   }
  // }, []);

  if (status === "loading") {
    return <div>Loading...</div>; // or a loading spinner
  }

  return (
    <>
      <div className="min-h-[100svh] bg-comp-gray-bg flex flex-col">
        {/* Header: full width */}
        <div className="shrink-0">
          <NavBar
            onToggle={toggleMobileMenu}
            isOpen={isMobileOpened}
            userData={session?.user}
            userId={session?.user.id}
          />
        </div>

        {/* Body: sidebar + content (under header) */}
        <div className="flex-1 min-h-0 flex">
          {/* Desktop sidebar */}
          <aside className="hidden sm:block w-72 shrink-0">
            <SideBar
              isOpen={true}
              onToggle={toggleMobileMenu}
              role={session?.user.role}
              minisizeItems={minisizeItems}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 min-h-0 px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
        </div>

        {/* Footer: full width */}
        <div className="shrink-0">
          <Footer isOpen={isMobileOpened} />
        </div>

        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 bg-black/40 z-20 sm:hidden transition-opacity ${
            isMobileOpened ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleMobileMenu}
        />

        {/* Mobile drawer sidebar */}
        <div className="sm:hidden">
          <SideBar
            isOpen={isMobileOpened}
            onToggle={toggleMobileMenu}
            role={session?.user.role}
            minisizeItems={minisizeItems}
          />
        </div>
      </div>
    </>
  );
};

export default Layout;
