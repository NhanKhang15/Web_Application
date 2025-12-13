import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { Separator } from "../ui/separator.jsx";
import { useTranslation } from "react-i18next"; // 🟢 Thêm i18n hook

export default function Header({ active = "home", onLogin, onRegister, onRequireAuth }) {
    const [open, setOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const { t, i18n } = useTranslation(); // 🟢 lấy i18n instance

    const nav = [
        { key: "home", label: t("home") || "Home", href: "#home" },
        { key: "ongoing", label: t("ongoing") || "On-going Auctions", href: "#ongoing" },
        { key: "upcoming", label: t("upcoming") || "Upcoming Auctions", href: "#upcoming" },
    ];

    // 🧭 Chuyển ngôn ngữ
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        setLangOpen(false);
    };

    // Đóng menu khi bấm Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Đóng khi click ra ngoài panel
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    // Smooth scroll
    const handleNavClick = (e, href, key) => {
        e.preventDefault();
        setOpen(false);

        if (key === "ongoing" || key === "upcoming") {
            onRequireAuth?.();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            const yOffset = -80;
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
            <nav className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                {/* Logo */}
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="shrink-0"
                >
                    <img
                        className="h-10 md:h-16"
                        alt="Logo"
                        src="https://c.animaapp.com/mfkwrxnikNfmdD/img/logo.png"
                    />
                </a>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    {nav.map((item) => {
                        const isActive = active === item.key;
                        return (
                            <a
                                key={item.key}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href, item.key)}
                                className={`font-semibold text-sm md:text-[17px] transition-colors ${isActive
                                    ? "text-[#FF3B30]"
                                    : "text-[#394149] hover:text-[#d6482c]"
                                    }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 md:gap-6 relative">
                    {/* 🌐 Language Selector - Desktop only */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm"
                        >
                            <Globe className="w-4 h-4" />
                            {i18n.language === "vi" ? "VN" : "EN"}
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                                <button
                                    onClick={() => handleLanguageChange("en")}
                                    className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === "en"
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    🇬🇧 English
                                </button>
                                <button
                                    onClick={() => handleLanguageChange("vi")}
                                    className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === "vi"
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    🇻🇳 Tiếng Việt
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Auth desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            onClick={onLogin}
                            className="bg-[#FF3B30] hover:bg-[#b83d26] text-white font-medium text-sm md:text-[17px] px-4 md:px-[18px] py-2 rounded-[29px] h-auto"
                        >
                            {t("login") || "Login"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onRegister}
                            className="bg-white hover:bg-gray-50 text-black font-medium text-sm md:text-[17px] px-4 md:px-[18px] py-2 rounded-[29px] border-gray-200 h-auto"
                        >
                            {t("register") || "Register"}
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        ref={triggerRef}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {open ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {open && (
                <Card
                    id="mobile-menu"
                    ref={panelRef}
                    className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm animate-fade-in"
                >
                    <CardContent className="px-4 pb-4 pt-3">
                        <div className="flex flex-col gap-2">
                            {nav.map((item) => {
                                const isActive = active === item.key;
                                return (
                                    <a
                                        key={item.key}
                                        href={item.href}
                                        onClick={(e) => handleNavClick(e, item.href, item.key)}
                                        className={`block rounded-md px-3 py-2 font-semibold text-sm transition-colors ${isActive
                                            ? "text-[#FF3B30] bg-gray-50"
                                            : "text-[#394149] hover:text-[#d6482c] hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                );
                            })}
                        </div>

                        <Separator className="my-3" />

                        {/* 🌐 Language selector in mobile */}
                        <div className="flex flex-col gap-2 mb-3">
                            <button
                                onClick={() => handleLanguageChange("en")}
                                className={`w-full rounded-md px-3 py-2 text-sm ${i18n.language === "en"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                            <button
                                onClick={() => handleLanguageChange("vi")}
                                className={`w-full rounded-md px-3 py-2 text-sm ${i18n.language === "vi"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                🇻🇳 Tiếng Việt
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => {
                                    setOpen(false);
                                    onLogin?.();
                                }}
                                className="bg-[#FF3B30] hover:bg-[#b83d26] text-white font-medium text-sm px-4 py-2 rounded-[29px] h-auto"
                            >
                                {t("login")}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    onRegister?.();
                                }}
                                className="bg-white hover:bg-gray-50 text-black font-medium text-sm px-4 py-2 rounded-[29px] border-gray-200 h-auto"
                            >
                                {t("register")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </header>
    );
}
