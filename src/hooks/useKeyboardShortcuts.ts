import { useEffect } from "react";

export type PosMode = "kasir" | "input" | "laporan";

interface ShortcutHandlers {
  onSwitchMode?: (mode: PosMode) => void;
  onFocusBarcode?: () => void;
  onFocusSearch?: () => void;
  onQuickExactCash?: () => void;
  onQuickCash50k?: () => void;
  onQuickCash100k?: () => void;
  onQuickCash200k?: () => void;
  onCheckout?: () => void;
  onEscape?: () => void;
  onDeleteSelected?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, isModalOpen = false) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If a modal is open, let modal handle Esc or prevent conflicting global switches
      if (isModalOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          handlers.onEscape?.();
        }
        return;
      }

      // Check for F-keys and global shortcuts
      switch (e.key) {
        case "F1":
          e.preventDefault();
          handlers.onSwitchMode?.("kasir");
          handlers.onFocusBarcode?.();
          break;

        case "F2":
          e.preventDefault();
          handlers.onSwitchMode?.("input");
          break;

        case "F3":
          e.preventDefault();
          handlers.onSwitchMode?.("laporan");
          break;

        case "F5":
          e.preventDefault();
          handlers.onFocusSearch?.();
          break;

        case "F6":
          e.preventDefault();
          handlers.onQuickExactCash?.();
          break;

        case "F7":
          e.preventDefault();
          handlers.onQuickCash50k?.();
          break;

        case "F8":
          e.preventDefault();
          handlers.onQuickCash100k?.();
          break;

        case "F9":
          e.preventDefault();
          handlers.onQuickCash200k?.();
          break;

        case "Escape":
          e.preventDefault();
          handlers.onEscape?.();
          break;

        case "Delete": {
          // If not currently typing in a text/number input, trigger delete selected
          const activeTag = (document.activeElement?.tagName || "").toLowerCase();
          if (activeTag !== "input" && activeTag !== "textarea") {
            e.preventDefault();
            handlers.onDeleteSelected?.();
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, isModalOpen]);
}
