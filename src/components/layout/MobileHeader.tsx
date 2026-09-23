"use client";

interface MobileHeaderProps {
  onOpenMenu: () => void;
}

export default function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="text-zinc-300 hover:text-white p-1 -ml-1"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Focos</h1>
      </div>
    </header>
  );
}