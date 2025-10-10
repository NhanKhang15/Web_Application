// src/widget/screens/CalculatorWidget.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, X } from "lucide-react";

export default function CalculatorWidget() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("0");

    const handleClick = (val) => {
        setValue((prev) => {
            if (prev === "0" && !["+", "-", "*", "/"].includes(val)) return val;
            return prev + val;
        });
    };

    const handleClear = () => setValue("0");

    const handleCalculate = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(value);
            setValue(String(result));
        } catch {
            setValue("Lỗi!");
        }
    };

    return (
        <>
            {/* 🔘 Floating Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition"
                whileTap={{ scale: 0.9 }}
            >
                <Calculator className="w-6 h-6" />
            </motion.button>

            {/* 🧮 Floating Calculator */}
            {open && (
                <motion.div
                    drag
                    dragMomentum={false}
                    className="fixed bottom-24 right-6 z-[9998] w-72 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md backdrop-blur-sm select-none cursor-grab active:cursor-grabbing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-500" /> Calculator
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
                        {[
                            "7", "8", "9", "/",
                            "4", "5", "6", "*",
                            "1", "2", "3", "-",
                            "0", ".", "C", "+",
                        ].map((btn) => (
                            <button
                                key={btn}
                                onClick={() => (btn === "C" ? handleClear() : handleClick(btn))}
                                className={`rounded-lg py-3 font-medium transition ${
                                    ["+", "-", "*", "/"].includes(btn)
                                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                                        : btn === "C"
                                            ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                }`}
                            >
                                {btn}
                            </button>
                        ))}

                        {/* = button */}
                        <button
                            onClick={handleCalculate}
                            className="col-span-4 rounded-lg py-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                        >
                            =
                        </button>
                    </div>
                </motion.div>
            )}
        </>
    );
}
