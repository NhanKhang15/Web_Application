import React, { useState } from "react";
import { Separator } from "../ui/separator.jsx";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram } from "lucide-react";

function VSeparator() {
    return <Separator orientation="vertical" className="hidden lg:block h-[126px] mx-8" />;
}

// Social media icons using Lucide
const SOCIAL_ICONS = [
    { Icon: Facebook, alt: "Facebook", href: "#" },
    { Icon: Twitter, alt: "Twitter / X", href: "#" },
    { Icon: Instagram, alt: "Instagram", href: "#" },
];

export default function Footer({
    links = [
        { key: "terms", href: "#" },
        { key: "privacy", href: "#" },
        { key: "contact", href: "#" },
    ],
}) {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    const [, setOpen] = useState(false);

    return (
        <footer className="w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-gray-200">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-4">
                <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-4 lg:gap-8">
                    {/* Logo */}
                    <a
                        href="#"
                        aria-label="Go to homepage"
                        onClick={(e) => {
                            e.preventDefault();
                            setOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="shrink-0"
                    >
                        <img
                            className="w-36 sm:w-44 lg:w-52 h-auto"
                            alt="Logo"
                            src="https://c.animaapp.com/mfkwrxnikNfmdD/img/logo.png"
                        />
                    </a>

                    <VSeparator />

                    {/* Links */}
                    <nav
                        aria-label="footer-nav"
                        className="flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-5"
                    >
                        {links.map((l) => (
                            <a
                                key={l.key}
                                href={l.href}
                                onClick={(e) => e.preventDefault()}
                                className="font-medium text-[#394149] text-sm sm:text-base hover:text-[#FF3B30] transition-colors"
                            >
                                {t(`footer.${l.key}`)} {/* ✅ dịch từ i18n */}
                            </a>
                        ))}
                    </nav>

                    <VSeparator />

                    {/* Socials */}
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="font-semibold text-[#FF3B30] text-base sm:text-lg text-center">
                            {t("footer.social_accounts")}
                        </h3>
                        <div className="flex items-center gap-3">
                            {SOCIAL_ICONS.map(({ Icon, alt, href }) => (
                                <a
                                    key={alt}
                                    href={href}
                                    onClick={(e) => e.preventDefault()}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-[#FF3B30] hover:text-white text-gray-600 transition-all duration-200 hover:scale-110"
                                    aria-label={alt}
                                    title={alt}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-center text-gray-500 text-xs sm:text-sm">
                    {t("footer.copyright", { year })}
                </div>
            </div>
        </footer>
    );
}
