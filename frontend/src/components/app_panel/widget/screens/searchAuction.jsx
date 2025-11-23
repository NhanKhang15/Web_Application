import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal.jsx";
import { useTranslation } from "react-i18next";
import { Clock, X, Search } from "lucide-react"; // Thêm icon Clock

export function SearchDropdown({ anchorRef, history, onSelect, onRemove, onClose }) {
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const { t } = useTranslation();

    // Tính toán vị trí (Giữ nguyên logic cũ)
    useEffect(() => {
        if (!anchorRef?.current) return;
        const updatePosition = () => {
            const rect = anchorRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const baseOffset = Math.max(8, 48 - scrollY * 0.6);
            const safeTop = rect.bottom + scrollY + baseOffset;
            setPos({ top: safeTop, left: rect.left + window.scrollX, width: rect.width });
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
        };
    }, [anchorRef]);

    // Click outside để đóng
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !anchorRef.current.contains(e.target)) {
                onClose?.();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, anchorRef]);

    // Nếu không có lịch sử thì không hiện gì (hoặc hiện gợi ý tùy bạn)
    if (!history || history.length === 0) return null;

    return (
        <Portal>
            <AnimatePresence>
                <motion.div
                    ref={dropdownRef}
                    className="absolute rounded-lg shadow-xl z-[9999] overflow-hidden
                       bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md
                       border border-neutral-200 dark:border-neutral-800"
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                >
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        {t("Recent_Searches") || "Lịch sử tìm kiếm"}
                    </div>

                    {history.map((keyword, index) => (
                        <div
                            key={index}
                            onClick={() => onSelect(keyword)}
                            className="group flex items-center justify-between px-4 py-2.5 cursor-pointer
                                     hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Clock className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-700 dark:text-neutral-200 truncate">
                                    {keyword}
                                </span>
                            </div>
                            <button
                                onClick={(e) => onRemove(e, keyword)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-all"
                            >
                                <X className="w-3 h-3 text-neutral-500" />
                            </button>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </Portal>
    );
}