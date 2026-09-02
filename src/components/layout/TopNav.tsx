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
      icon: <IconKasir size={18} />,
    },
    {
      id: "input",
      label: "Stok Barang",
      shortcut: "F2",
      icon: <IconStok size={18} />,
    },
    {
      id: "laporan",
      label: "Laporan Penjualan",
      shortcut: "F3",
      icon: <IconLaporan size={18} />,
    },
  ];

  return (
    <header className="h-15 bg-pos-dark text-white border-b border-[#082E47] px-4 flex items-center justify-between select-none shrink-0 z-30 shadow-xs">
      {/* Brand & Shift Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-lg text-white uppercase">
            Cahaya POS
          </span>
        </div>
      </div>

      {/* Navigation Tabs with Shortcut Badges */}
      <nav className="flex items-center gap-1.5 bg-[#082E47]/90 p-1 rounded-xl border border-[#0F4C75]/50">
        {navItems.map((item) => {
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-pos-blue text-white border border-[#1976D2] shadow-sm"
                  : "text-blue-100/70 hover:text-white hover:bg-pos-blue/50 border border-transparent"
              }`}
            >
              <span className={isActive ? "text-cyan-300" : "text-blue-200/60"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              <KeyBadge
                shortcut={item.shortcut}
                variant={isActive ? "blue" : "dark"}
              />
            </button>
          );
        })}
      </nav>

      {/* System Status & Digital Clock */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-right font-mono">
          <span className="text-xs text-blue-200/70">{dateStr}</span>
          <span className="text-sm font-bold text-white bg-[#082E47] px-2.5 py-1 rounded border border-[#0F4C75]/60 tabular-nums">
            {timeStr}
          </span>
        </div>
      </div>
    </header>
  );
};
