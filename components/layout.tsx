import "react-toastify/dist/ReactToastify.css"; // Import the CSS styles

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

const Layout = ({ children, session }: { children: React.ReactNode; session: Session }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default Layout;
