import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/layout/Sidebar";
import MobileTopNavbar from "@/layout/MobileTopNavbar";
import MainContent from "@/layout/MainContent";
import authHooks from "@/hooks/useAuth";
import { AUTH_KEYS } from "@/constants";
import AuthLoading from "@/app/shared/LoadingSkeleton/AuthLoading";

const App = () => {
  const queryClient = useQueryClient();
  const { isCheckingAuth, isAuthenticated } = authHooks.useUser();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="flex h-dvh w-full overflow-hidden bg-gray-50/50">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-gray-200/80 bg-white">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer Modal */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Slide-in drawer */}
          <div className="relative flex w-72 max-w-[85vw] flex-1 flex-col bg-white shadow-2xl">
            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Area: Mobile Top Navbar + Scrollable Content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Navbar (Visible only on mobile) */}
        <MobileTopNavbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

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
