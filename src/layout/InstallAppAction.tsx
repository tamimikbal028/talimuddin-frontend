import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallAppActionProps {
  compact?: boolean;
}

const isAppInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

const InstallAppAction = ({ compact = false }: InstallAppActionProps) => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsInstalled(isAppInstalled());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      toast.info("Install Talimuddin", {
        description:
          "Open your browser menu and choose Install app or Add to Home Screen.",
      });
      return;
    }

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error("Unable to start app installation:", error);
      toast.error("Could not start the app installation. Please try again.");
    } finally {
      setInstallPrompt(null);
      setIsInstalling(false);
    }
  };

  if (isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={isInstalling}
      title="Install as app"
      aria-label="Install as app"
      className={
        compact
          ? "flex w-full items-center justify-between gap-3 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 px-3.5 py-2.5 text-left text-blue-800 shadow-xs transition-colors hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 disabled:opacity-60"
          : "flex w-full items-center gap-3 rounded-xl border border-blue-500 bg-blue-50/70 px-3.5 py-3 text-left text-sm font-semibold text-blue-800 transition-colors hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60"
      }
    >
      {compact ? (
        <>
          <span>
            <span className="block text-sm font-semibold">
              Install Talimuddin
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            {isInstalling ? "Opening..." : "Install"}
          </span>
        </>
      ) : (
        <>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-xs">
            <FaDownload className="h-4 w-4" />
          </span>
          <span>
            <span className="block">Install as App</span>
          </span>
        </>
      )}
    </button>
  );
};

export default InstallAppAction;
