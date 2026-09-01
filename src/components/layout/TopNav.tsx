import React, { useState, useEffect } from "react";
import { KeyBadge } from "../common/KeyBadge";
import { IconKasir, IconStok, IconLaporan } from "../common/Icons";
import { PosMode } from "../../hooks/useKeyboardShortcuts";

interface TopNavProps {
  activeMode: PosMode;
  onSelectMode: (mode: PosMode) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeMode, onSelectMode }) => {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setDateStr(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: {
    id: PosMode;
    label: string;
    shortcut: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "kasir",
      label: "Kasir",
      shortcut: "F1",
      icon: <IconKasir size={17} />,
    },
    {
      id: "input",
      label: "Stok Barang",
      shortcut: "F2",
      icon: <IconStok size={17} />,
    },
    {
      id: "laporan",
      label: "Laporan Penjualan",
      shortcut: "F3",
      icon: <IconLaporan size={17} />,
    },
  ];

  return (
    <header className="h-16 bg-pos-dark text-white px-5 flex items-center justify-between select-none shrink-0 z-30">
      {/* Brand & Shift Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-lg text-neutral-100 uppercase">
            Cahaya Media
          </span>
        </div>
      </div>

      {/* Navigation Tabs with Shortcut Badges */}
      <nav className="flex items-center gap-1.5 bg-pos-light-dark p-1 rounded-xl">
        {navItems.map((item) => {
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-pos-blue text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-pos-blue/80"
              }`}
            >
              <span className={isActive ? "text-white" : "text-neutral-400"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              <KeyBadge shortcut={item.shortcut} variant={"dark"} />
            </button>
          );
        })}
      </nav>

      {/* System Status & Digital Clock */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-right font-mono">
          <span className="text-xs text-neutral-400">{dateStr}</span>
          <span className="text-xs font-bold text-neutral-100 bg-neutral-850 px-2 py-1 rounded tabular-nums">
            {timeStr}
          </span>
        </div>
      </div>
    </header>
  );
};
