// src/components/app_panel/slidebar/screens/MobileNav.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navigationItems } from "../lib/navigationItems.js";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, X } from "lucide-react";

// First 4 items show directly, rest go to "More" dropdown
const MAIN_NAV_COUNT = 4;

export default function MobileNav({ activeKey, onChange }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef(null);

    const mainItems = navigationItems.slice(0, MAIN_NAV_COUNT);
    const moreItems = navigationItems.slice(MAIN_NAV_COUNT);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!moreOpen) return;
        const handleClickOutside = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [moreOpen]);

    const handleNavClick = (key) => {
        const navItem = navigationItems.find(item => item.key === key);
        let path = navItem?.path || key;

        // Handle default sub-paths
        if (key === "auction") path = "auctions/ongoing";
        else if (key === "seller") path = "seller/manage";
        else if (key === "user") path = "user/profile";

        navigate(`/dashboard/${path}`);
        onChange?.(key);
        setMoreOpen(false);
    };

    const isMoreActive = moreItems.some(item => item.key === activeKey);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {/* Main 4 items */}
                {mainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.key === activeKey;

                    return (
                        <button
                            key={item.key}
                            onClick={() => handleNavClick(item.key)}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors
                                ${isActive
                                    ? "text-[#e43137]"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-[#e43137]"
                                }`}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className={`text-[10px] ${isActive ? "font-semibold" : "font-normal"}`}>
                                {t(item.transKey) || item.label}
                            </span>
                        </button>
                    );
                })}

                {/* More dropdown trigger */}
                {moreItems.length > 0 && (
                    <div ref={moreRef} className="relative flex-1 h-full">
                        <button
                            onClick={() => setMoreOpen(!moreOpen)}
                            className={`flex flex-col items-center justify-center w-full h-full py-2 transition-colors
                                ${isMoreActive || moreOpen
                                    ? "text-[#e43137]"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-[#e43137]"
                                }`}
                        >
                            {moreOpen ? (
                                <X className="w-5 h-5 mb-1" />
                            ) : (
                                <MoreHorizontal className="w-5 h-5 mb-1" />
                            )}
                            <span className={`text-[10px] ${isMoreActive ? "font-semibold" : "font-normal"}`}>
                                {t("nav_more") || "More"}
                            </span>
                        </button>

                        {/* Dropdown menu */}
                        {moreOpen && (
                            <div className="absolute bottom-full right-0 mb-2 mr-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                {moreItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.key === activeKey;

                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNavClick(item.key)}
                                            className={`flex items-center gap-3 w-full px-4 py-3 transition-colors
                                                ${isActive
                                                    ? "bg-red-50 dark:bg-red-900/20 text-[#e43137]"
                                                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className={`text-sm ${isActive ? "font-semibold" : "font-normal"}`}>
                                                {t(item.transKey) || item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
