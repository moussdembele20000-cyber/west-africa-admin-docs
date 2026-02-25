import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(!showIOSGuide);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="mb-6">
      <button
        onClick={handleInstall}
        className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold py-3 rounded-lg text-sm active:scale-[0.98] transition-transform border border-border"
      >
        <Download className="h-4 w-4" />
        Installer l'application
      </button>
      {showIOSGuide && isIOS && (
        <div className="mt-2 bg-card border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Sur iPhone / iPad :</p>
          <p>1. Appuyez sur le bouton <strong>Partager</strong> (⬆️)</p>
          <p>2. Sélectionnez <strong>« Sur l'écran d'accueil »</strong></p>
          <p>3. Appuyez sur <strong>Ajouter</strong></p>
        </div>
      )}
    </div>
  );
};

export default InstallPWA;
