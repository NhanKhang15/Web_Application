// src/widget/screens/CalculatorWidget.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";
import * as Toast from "@radix-ui/react-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

export default function CalculatorWidget({ externalOpen, onClose }) {
    const { t } = useTranslation();
    const [setOpen] = useState(false);
    const [value, setValue] = useState("0");
    const [toastOpen, setToastOpen] = useState(false);
    const [activeKey, setActiveKey] = useState("");
    const [lastExpression, setLastExpression] = useState("");
    const [lastOperator, setLastOperator] = useState("");
    const [internalOpen, setInternalOpen] = useState(false);

    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const handleClose = onClose || (() => setInternalOpen(false));
    useEffect(() => {
        AOS.init({ duration: 600, offset: 80 });

        const handleKeyUp = (e) => {
            if (!open) return;
            const key = e.key;

            // ✅ Ngăn Enter gây đóng widget
            if (key === "Enter" || key === "=") {
                e.preventDefault();
                e.stopPropagation();
            }

            // Hiệu ứng sáng nút khi bấm
            setActiveKey(key);
            setTimeout(() => setActiveKey(""), 120);

            if (/[0-9+\-*/.]/.test(key)) {
                handleClick(key);
            } else if (key === "Enter" || key === "=") {
                handleCalculate();
            } else if (key === "Backspace") {
                setValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
            } else if (key.toLowerCase() === "c") {
                handleClear();
            } else if (key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener("keyup", handleKeyUp);
        return () => window.removeEventListener("keyup", handleKeyUp);
    }, [open, value, lastExpression, lastOperator]);

    const handleClick = (val) => {
        setValue((prev) => {
            if (prev === "0" && !["+", "-", "*", "/"].includes(val)) return val;
            if (prev === "Lỗi!") return val;
            return prev + val;
        });
    };

    const handleClear = () => {
        setValue("0");
        setLastExpression("");
        setLastOperator("");
    };

    const handleCalculate = () => {
        try {
            // loại bỏ ký tự phép toán ở cuối nếu có
            const expression = value.replace(/[+\-*/.]$/, "");
            // eslint-disable-next-line no-eval
            const result = eval(expression);
            if (isNaN(result) || result === undefined) throw new Error();

            // ✅ Sau khi tính xong thì reset phép nhớ để không cộng tiếp
            setValue(String(result));
            setLastExpression("");
            setLastOperator("");
        } catch {
            setValue("Err");
            setToastOpen(true);
        }
    };

    const buttons = [
        "7", "8", "9", "/",
        "4", "5", "6", "*",
        "1", "2", "3", "-",
        "0", ".", "C", "+",
    ];

    return (
        <Toast.Provider swipeDirection="right">
            {/* Cửa sổ máy tính */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        // Responsive positioning - bottom-20 to avoid FAB overlap on mobile
                        className="fixed bottom-20 md:bottom-24 right-4 md:right-24 z-[9998] w-64 md:w-72 p-3 md:p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md backdrop-blur-sm select-none cursor-grab active:cursor-grabbing"
                        initial={{ opacity: 0, y: 40, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-500" /> {t("Calculator_Title")}
                            </h3>
                            <button onClick={handleClose} className="text-neutral-500 hover:text-red-500 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Màn hình hiển thị */}
                        <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 text-right p-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 overflow-x-auto">
                            {value}
                        </div>

                        {/* Phím bấm */}
                        <div className="grid grid-cols-4 gap-2 text-sm">
                            {buttons.map((btn) => (
                                <button key={btn} onClick={() => {/*logic cũ*/ }} className="rounded-lg py-3 font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                    {btn}
                                </button>
                            ))}
                            <button className="col-span-4 rounded-lg py-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">=</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Toast.Provider>
    );
}
