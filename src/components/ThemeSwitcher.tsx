import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, Theme } from "../context/ThemeContext";

export const ThemeSwitcher: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; icon: React.ReactNode; symbol: string }[] = [
    {
      id: "light",
      label: "Light",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      symbol: "☀️",
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      symbol: "🌙",
    },
    {
      id: "system",
      label: "System",
      icon: <Monitor className="w-4 h-4 text-slate-400" />,
      symbol: "🖥️",
    },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[2];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="theme-switcher-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        title={`Theme: ${currentOption.label} (${theme === "system" ? `System: ${resolvedTheme}` : theme})`}
        aria-label="Select color theme"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentOption.symbol}</span>
        <span className="hidden sm:inline text-xs font-medium">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div
          id="theme-switcher-dropdown"
          className="absolute right-0 mt-1.5 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 mb-0.5">
            Appearance
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                id={`theme-option-${opt.id}`}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 font-medium"
                }`}
                role="menuitem"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm leading-none">{opt.symbol}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
