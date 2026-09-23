"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "◉" },
  { label: "Reports", href: "/reports/daily", icon: "◧" },
  { label: "Diagnostic", href: "/diagnostic", icon: "◫" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const content = (
    <>
      <div className="px-4 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Focos</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Time Tracking</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-zinc-400 hover:text-white text-2xl leading-none px-1"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left px-3 py-3 md:py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`w-64 md:w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {content}
      </aside>
    </>
  );
}