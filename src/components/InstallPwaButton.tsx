"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPwaButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      // If prompt isn't directly available (e.g. iOS or manual install)
      alert("App install karne ke liye browser menu (3-dots ya Share icon) me jakar 'Add to Home screen' ya 'Install App' chunein.");
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      title="Install Focos as an app on your phone or desktop"
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/40 hover:text-emerald-300 transition-colors w-full text-left ${className}`}
    >
      <span className="text-sm">📲</span>
      <span>Install Focos App</span>
    </button>
  );
}
