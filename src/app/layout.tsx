import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focos - Focus Tracking & Reality Mirror",
  description: "Track where your time actually goes. Strict focus tracking and future reality mirror.",
  manifest: "/manifest.webmanifest",
  applicationName: "Focos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focos",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-white font-sans">
        {children}
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`
            window.__focosPrompt = null;
            window.addEventListener("beforeinstallprompt", function (e) {
              e.preventDefault();
              window.__focosPrompt = e;
              window.dispatchEvent(new CustomEvent("focos-install-available"));
            });
          `}
        </Script>
        <Script id="service-worker-registration" strategy="afterInteractive">
          {`
            if (typeof window !== "undefined" && "serviceWorker" in navigator) {
              window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js").then(function (reg) {
                  reg.update();
                }).catch(function (err) {
                  console.warn("Service worker registration failed:", err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}