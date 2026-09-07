import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/layout/Sidebar";
import MobileTopNavbar from "@/layout/MobileTopNavbar";
import MainContent from "@/layout/MainContent";
import authHooks from "@/hooks/useAuth";
import { AUTH_KEYS } from "@/constants";
import AuthLoading from "@/app/shared/LoadingSkeleton/AuthLoading";

const App = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isCheckingAuth, isAuthenticated } = authHooks.useUser();

  // Global logout event listener
  useEffect(() => {
    const handleLogout = () => {
      console.log("Global logout event received");
      // Clear user data in cache
      queryClient.setQueryData([AUTH_KEYS.CURRENT_USER], null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [queryClient]);

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (!isAuthenticated && isAuthPage) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-gray-50 p-2 sm:px-4 sm:py-6">
        <MainContent />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-gray-50/50">
      {/* Desktop Left Sidebar */}
      <div className="hidden border-r border-gray-200/80 bg-white md:flex md:w-64 md:shrink-0 md:flex-col">
        <Sidebar />
      </div>

      {/* Main Area: Mobile Top Navbar + Scrollable Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Top Navbar (Visible only on mobile) */}
        <MobileTopNavbar />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
          <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
            <MainContent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
