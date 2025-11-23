// src/widget/screens/CalculatorWidget.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";
import * as Toast from "@radix-ui/react-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {useTranslation} from "react-i18next";

export default function CalculatorWidget() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("0");
    const [toastOpen, setToastOpen] = useState(false);
    const [activeKey, setActiveKey] = useState("");
    const [lastExpression, setLastExpression] = useState("");
    const [lastOperator, setLastOperator] = useState("");

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
            {/* 🔘 Floating Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition"
                whileTap={{ scale: 0.9 }}
                data-aos="zoom-in"
            >
                <Calculator className="w-6 h-6" />
            </motion.button>

            {/* 🧮 Floating Calculator */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        className="fixed bottom-24 right-6 z-[9998] w-72 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md backdrop-blur-sm select-none cursor-grab active:cursor-grabbing"
                        initial={{ opacity: 0, y: 40, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-500" /> {t("Calculator_Title")}
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-neutral-500 hover:text-red-500 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Display */}
                        <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 text-right p-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 overflow-x-auto">
                            {value}
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-2 text-sm">
                            {buttons.map((btn) => (
                                <motion.button
                                    key={btn}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                        btn === "C" ? handleClear() : handleClick(btn)
                                    }
                                    className={`rounded-lg py-3 font-medium transition
                                        ${
                                        activeKey === btn ||
                                        (activeKey === "Enter" && btn === "=")
                                            ? "ring-2 ring-blue-400"
                                            : ""
                                    }
                                        ${
                                        ["+", "-", "*", "/"].includes(btn)
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                                            : btn === "C"
                                                ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    }`}
                                >
                                    {btn}
                                </motion.button>
                            ))}

                            {/* = button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCalculate}
                                className={`col-span-4 rounded-lg py-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white transition ${
                                    activeKey === "Enter" || activeKey === "="
                                        ? "ring-2 ring-blue-300"
                                        : ""
                                }`}
                            >
                                =
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔔 Toast for error */}
            <Toast.Root
                open={toastOpen}
                onOpenChange={setToastOpen}
                duration={2000}
                className="bg-red-600 text-white rounded-lg px-4 py-2 shadow-lg font-medium"
            >
                <Toast.Title>{t("Calc_Error")}</Toast.Title>
            </Toast.Root>

            <Toast.Viewport className="fixed bottom-6 right-6 z-[99999]" />
        </Toast.Provider>
    );
}
