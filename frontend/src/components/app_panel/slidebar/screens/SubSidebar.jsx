import React, { useState, useRef, useEffect } from "react";
import { subSidebarItems } from "../lib/subSidebarItems";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function SubSidebar({
  active,
  onChange,
  topClass = "top-1",
  bottomClass = "bottom-6",
  leftClass = "left-6",
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Get active item info
  const activeItem = subSidebarItems.find(it => it.key === active);
  const ActiveIcon = activeItem?.icon;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile: Menu button + Dropdown - in normal flow */}
      <div className="md:hidden relative p-3" ref={menuRef}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-sm"
        >
          <div className="flex items-center gap-2">
            {ActiveIcon && <ActiveIcon className="w-5 h-5 text-blue-500" />}
            <span>{t(activeItem?.transKey) || activeItem?.title || "Menu"}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
            {subSidebarItems.map((it) => {
              const isActive = active === it.key;
              const isDisabled = it.disabled;
              const Icon = it.icon;

              return (
                <button
                  key={it.key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange?.(it.key);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    }
                    ${isDisabled ? "opacity-40 cursor-default" : "cursor-pointer"}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span>{t(it.transKey) || it.title}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: Vertical sidebar - positioned absolutely */}
      <aside
        className={`
          hidden md:flex
          absolute ${leftClass} ${topClass} ${bottomClass}
          w-[72px] 
          flex-col items-center py-8 space-y-8
          z-10
        `}
        aria-label="Secondary navigation"
        role="navigation"
      >
        {subSidebarItems.map((it) => {
          const isActive = active === it.key;
          const isDisabled = it.disabled;
          const Icon = it.icon;

          return (
            <button
              key={it.key}
              type="button"
              title={t(it.transKey) || it.title}
              aria-label={it.title}
              aria-pressed={isActive}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange?.(it.key)}
              className={`relative group outline-none ${isDisabled ? "opacity-40 cursor-default" : "cursor-pointer"
                }`}
            >
              {/* Active indicator bar */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2
                            h-8 w-[4px] rounded-full transition
                            ${isActive ? "bg-[#457DFB] opacity-100" : "bg-transparent opacity-0"}`}
              />
              <span
                className={`block rounded-xl p-2 transition
                            ${isActive ? "ring-2 ring-[#457DFB]/40" : "ring-0"}
                            group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800
                            focus-visible:ring-2 focus-visible:ring-[#457DFB]/60`}
              >
                <Icon
                  className={`
                    w-6 h-6 transition 
                    ${isActive ? "text-[#457DFB]" : "text-neutral-700 dark:text-neutral-200"} 
                    group-hover:text-[#457DFB]
                    `}
                />
              </span>
            </button>
          );
        })}
      </aside>
    </>
  );
}
