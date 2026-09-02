import { useEffect, useRef } from "react";

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
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = handlersRef.current;

      // If a modal is open, let modal handle Esc or prevent conflicting global switches
      if (isModalOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          current.onEscape?.();
        }
        return;
      }

      // Check for F-keys and global shortcuts
      switch (e.key) {
        case "F1":
          e.preventDefault();
          current.onSwitchMode?.("kasir");
          current.onFocusBarcode?.();
          break;

        case "F2":
          e.preventDefault();
          current.onSwitchMode?.("input");
          break;

        case "F3":
          e.preventDefault();
          current.onSwitchMode?.("laporan");
          break;

        case "F5":
          e.preventDefault();
          current.onFocusSearch?.();
          break;

        case "F6":
          e.preventDefault();
          current.onQuickExactCash?.();
          break;

        case "F7":
          e.preventDefault();
          current.onQuickCash50k?.();
          break;

        case "F8":
          e.preventDefault();
          current.onQuickCash100k?.();
          break;

        case "F9":
          e.preventDefault();
          current.onQuickCash200k?.();
          break;

        case "Escape":
          e.preventDefault();
          current.onEscape?.();
          break;

        case "Delete": {
          // If not currently typing in a text/number input, trigger delete selected
          const activeTag = (document.activeElement?.tagName || "").toLowerCase();
          if (activeTag !== "input" && activeTag !== "textarea") {
            e.preventDefault();
            current.onDeleteSelected?.();
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);
}
