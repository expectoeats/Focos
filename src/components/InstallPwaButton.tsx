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
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if global prompt was already captured
    const globalPrompt = (window as any).__focosPrompt as BeforeInstallPromptEvent | undefined;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as any).__focosPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handlePromptReady = () => {
      const prompt = (window as any).__focosPrompt as BeforeInstallPromptEvent | undefined;
      if (prompt) {
        setDeferredPrompt(prompt);
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).__focosPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("focos-install-available", handlePromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("focos-install-available", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    const promptToUse = deferredPrompt || (window as any).__focosPrompt;

    if (!promptToUse) {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        alert("iOS me Focos install karne ke liye Safari share icon (⎙) par tap karein aur 'Add to Home Screen' chunein.");
      } else {
        alert("PWA verify ho raha hai... Chrome menu (3 dots) me jakar 'Install app' / 'Install Focos' option chunein taaki app aapke Android app drawer me install ho sake.");
      }
      return;
    }

    try {
      setInstalling(true);
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        (window as any).__focosPrompt = null;
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    } finally {
      setInstalling(false);
    }
  }

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      disabled={installing}
      title="Install Focos as an app on your phone or desktop"
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/40 hover:text-emerald-300 transition-colors w-full text-left disabled:opacity-50 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm">📲</span>
        <span>{installing ? "Installing..." : "Install Focos App"}</span>
      </div>
      {isInstallable && (
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Ready to install" />
      )}
    </button>
  );
}
