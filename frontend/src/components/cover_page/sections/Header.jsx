import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { Separator } from "../ui/separator.jsx";
import { useNavigate } from "react-router-dom";

export default function Header({ active = "home", onLogin, onRegister }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const nav = [
        { key: "home", label: "Home", href: "#home" },
        { key: "ongoing", label: "On-going Auctions", href: "#ongoing" },
        { key: "upcoming", label: "Upcoming Auctions", href: "#upcoming" },
    ];

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

    // Xử lý smooth scroll khi bấm nav
    const handleNavClick = (e, href, key) => {
        e.preventDefault(); // 🟢 Ngăn scroll mặc định của anchor
        setOpen(false);

        if (key === "ongoing" || key === "upcoming") {
            navigate("/login");
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            const yOffset = -80; // tránh bị header che
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
                    aria-label="Go to homepage"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="shrink-0">
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
                                className={`font-semibold text-sm md:text-[17px] transition-colors ${
                                    isActive
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
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Auth desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            onClick={onLogin}
                            className="bg-[#FF3B30] hover:bg-[#b83d26] text-white font-medium text-sm md:text-[17px] px-4 md:px-[18px] py-2 rounded-[29px] h-auto"
                        >
                            Login
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onRegister}
                            className="bg-white hover:bg-gray-50 text-black font-medium text-sm md:text-[17px] px-4 md:px-[18px] py-2 rounded-[29px] border-gray-200 h-auto"
                        >
                            Register
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        ref={triggerRef}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
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
                                        onClick={(e) => handleNavClick(e, item.href)}
                                        className={`block rounded-md px-3 py-2 font-semibold text-sm transition-colors ${
                                            isActive
                                                ? "text-[#FF3B30] bg-gray-50"
                                                : "text-[#394149] hover:text-[#d6482c] hover:bg-gray-50"
                                        }`}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {item.label}
                                    </a>
                                );
                            })}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => {
                                    setOpen(false);
                                    onLogin?.();
                                }}
                                className="bg-[#FF3B30] hover:bg-[#b83d26] text-white font-medium text-sm px-4 py-2 rounded-[29px] h-auto"
                            >
                                Login
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    onRegister?.();
                                }}
                                className="bg-white hover:bg-gray-50 text-black font-medium text-sm px-4 py-2 rounded-[29px] border-gray-200 h-auto"
                            >
                                Register
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </header>
    );
}
