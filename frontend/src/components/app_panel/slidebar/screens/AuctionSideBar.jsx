import React, { useState, useRef, useEffect } from "react";
import { auctionMenu } from "../lib/auctionMenu";
import { Menu, X, ChevronRight, ChevronDown, Gavel } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuctionSideBar({ active, onSelect, isOpen, onToggle }) {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Get active item info
    const activeItem = auctionMenu.find(it => it.label === active);

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
            {/* Mobile: Dropdown Menu */}
            <div className="md:hidden relative p-3" ref={menuRef}>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-sm"
                >
                    <div className="flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-[#e43137]" />
                        <span>{t(activeItem?.transKey) || activeItem?.label || t("auction_menu")}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
                        {auctionMenu.map((item) => {
                            const isActive = active === item.label;

                            return (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => {
                                        onSelect?.(item.label);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                        ${isActive
                                            ? "bg-red-50 dark:bg-red-900/30 text-[#e43137] dark:text-red-400"
                                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                        }
                                    `}
                                >
                                    <span>{t(item.transKey) || item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-[#e43137]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Desktop: Collapsible Sidebar */}
            <div
                className={`
                    hidden md:block
                    relative h-full flex-shrink-0
                    transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                    ${isOpen ? "w-[280px]" : "w-[72px]"}
                `}
            >
                {/* Transparent Background */}
                <div className="absolute inset-0 w-full h-full bg-transparent" />

                {/* Content Wrapper */}
                <div className="relative w-full h-full flex flex-col">
                    {/* Header / Toggle Area */}
                    <div className="h-24 flex items-center justify-center px-4">
                        <button
                            onClick={onToggle}
                            className={`
                                relative group flex items-center justify-center
                                w-12 h-12 rounded-2xl
                                bg-white/50 dark:bg-[#1A1F25]/50
                                text-neutral-600 dark:text-neutral-400
                                backdrop-blur-md
                                shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                                hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                                hover:bg-white dark:hover:bg-[#252A30]
                                hover:text-neutral-900 dark:hover:text-white
                                hover:scale-105
                                transition-all duration-300 ease-out
                                ${isOpen ? "ml-auto mr-2" : "mx-auto"}
                            `}
                            aria-label="Toggle menu"
                        >
                            <div className="relative z-10">
                                {isOpen ? <X size={22} /> : <Menu size={22} />}
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-neutral-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-white/5" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className={`flex-1 overflow-y-auto py-4 px-3 space-y-2 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        {isOpen && (
                            <>
                                <div className="px-3 mb-4">
                                    <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                                        {t("auction_menu")}
                                    </h3>
                                </div>
                                <ul className="space-y-1">
                                    {auctionMenu.map((item) => {
                                        const isActive = active === item.label;

                                        return (
                                            <li key={item.path}>
                                                <button
                                                    onClick={() => onSelect?.(item.label)}
                                                    className={`
                                                        group relative w-full flex items-center justify-between
                                                        px-4 py-3 rounded-xl text-sm font-medium
                                                        transition-all duration-200
                                                        ${isActive
                                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg shadow-neutral-900/20 dark:shadow-white/10"
                                                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1F25] hover:text-neutral-900 dark:hover:text-white"
                                                        }
                                                    `}
                                                >
                                                    <span>{t(item.transKey) || item.label}</span>

                                                    {isActive && (
                                                        <ChevronRight size={16} className="opacity-100" />
                                                    )}
                                                    {!isActive && (
                                                        <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-neutral-400" />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Collapsed State Icons */}
                    {!isOpen && (
                        <div className="absolute top-24 left-0 w-full flex flex-col items-center gap-4 opacity-50 pointer-events-none">
                            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
