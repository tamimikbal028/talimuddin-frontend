import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TopNavbar from "@/layout/TopNavbar";
import MobileBottomNavbar from "@/layout/MobileBottomNavbar";
import MainContent from "@/layout/MainContent";
import authHooks from "@/hooks/useAuth";
import { AUTH_KEYS } from "@/constants";
import AuthLoading from "@/app/shared/LoadingSkeleton/AuthLoading";

const App = () => {
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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-6">
        <MainContent />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50/50">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto px-3 py-3 pb-20 sm:px-6 sm:py-5 sm:pb-6">
        <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
          <MainContent />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNavbar />
    </div>
  );
};

export default App;
