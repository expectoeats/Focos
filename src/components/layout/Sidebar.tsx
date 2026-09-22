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

export default function Sidebar() {
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

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="px-4 py-5 border-b border-zinc-800">
        <h1 className="text-lg font-bold tracking-tight">Focos</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Time Tracking</p>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
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
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
