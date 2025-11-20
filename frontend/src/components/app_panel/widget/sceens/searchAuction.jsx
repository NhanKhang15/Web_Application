import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal.jsx";
import { useTranslation } from "react-i18next"; // 👈 thêm

// ======================
// DỮ LIỆU MẪU
// ======================
const AUCTIONS = [
    { id: 1, name: "Lamborghini Aventador", location: "Italy", img: "https://cdn.motor1.com/images/mgl/lZpK1/s1/lamborghini-aventador.webp" },
    { id: 2, name: "Ferrari 812 Superfast", location: "France", img: "https://cdn.motor1.com/images/mgl/0x9K1/s1/ferrari-812-superfast.webp" },
    { id: 3, name: "McLaren 720S", location: "UK", img: "https://cdn.motor1.com/images/mgl/pj7Z1/s1/mclaren-720s.webp" },
    { id: 4, name: "Porsche 911 Turbo S", location: "Germany", img: "https://cdn.motor1.com/images/mgl/6vK3K/s1/porsche-911-turbo-s.webp" },
    { id: 5, name: "Audi RS7 Sportback", location: "Germany", img: "https://cdn.motor1.com/images/mgl/x0k7O/s1/audi-rs7-sportback.webp" },
];

// ======================
// HÀM TÌM KIẾM
// ======================
export function searchAuction(query) {
    const val = query?.toLowerCase?.().trim?.() || "";
    if (!val) return [];
    return AUCTIONS.filter(
        (item) =>
            item.name.toLowerCase().includes(val) ||
            item.location.toLowerCase().includes(val)
    );
}

// ======================
// DROPDOWN HIỂN THỊ KẾT QUẢ
// ======================
export function SearchDropdown({ anchorRef, results, onSelect, onClose }) {
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const { t } = useTranslation(); // 👈 thêm hook dịch

    // Tính vị trí dropdown theo thanh search
    useEffect(() => {
        if (!anchorRef?.current) return;
        const updatePosition = () => {
            const rect = anchorRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const baseOffset = Math.max(8, 48 - scrollY * 0.6);
            const safeTop = rect.bottom + scrollY + baseOffset;
            setPos({
                top: safeTop,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
        };
    }, [anchorRef, results]);

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !anchorRef.current.contains(e.target)
            ) {
                onClose?.();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, anchorRef]);

    return (
        <Portal>
            <AnimatePresence>
                {results.length > 0 ? (
                    <motion.div
                        ref={dropdownRef}
                        className="absolute rounded-lg shadow-2xl z-[9999] overflow-hidden
                       bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md
                       border border-neutral-300/50 dark:border-neutral-700/50"
                        style={{
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {results.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => onSelect(r)}
                                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 text-left"
                            >
                                <img src={r.img} alt={r.name} className="w-12 h-8 object-cover rounded" />
                                <div>
                                    <p className="text-sm font-medium">{r.name}</p>
                                    <p className="text-xs text-neutral-500">{r.location}</p>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        ref={dropdownRef}
                        className="absolute z-[9999] mt-2 rounded-lg bg-white/60 dark:bg-neutral-900/60
                       backdrop-blur-md border border-neutral-200/40 dark:border-neutral-700/40
                       text-sm text-center text-neutral-600 dark:text-neutral-300 py-3"
                        style={{
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {t("search_no_results")}
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
