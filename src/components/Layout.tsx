import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useCurrentUser, useMyProfile } from "@/lib/api-hooks";

const Layout = () => {
  const { data: currentUserData } = useCurrentUser();
  const { data: profile } = useMyProfile();
  const location = useLocation();
  
  const user = currentUserData?.user;
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/auth";
  const hasNavbar = !isHomePage && !isAuthPage;
  
  return (
    <div className="min-h-screen flex flex-col">
      {hasNavbar && <Navbar user={user} profile={profile} />}
      <main className={`flex-1 ${hasNavbar ? "pt-16" : ""}`}>
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;