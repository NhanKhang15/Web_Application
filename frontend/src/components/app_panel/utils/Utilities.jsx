import React from "react";
import { Wrench, Calculator, ClipboardList, Bot, MessageCircle, Globe, Moon, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function Utilities() {
    const { t } = useTranslation();

    const tools = [
        {
            icon: <Wrench className="w-5 h-5 text-red-500" />,
            title: t("system_tools_title"),
            desc: t("system_tools_desc"),
        },
        {
            icon: <Calculator className="w-5 h-5 text-blue-500" />,
            title: t("quick_calculator_title"),
            desc: t("quick_calculator_desc"),
        },
        {
            icon: <ClipboardList className="w-5 h-5 text-green-500" />,
            title: t("task_utilities_title"),
            desc: t("task_utilities_desc"),
        },
        {
            icon: <Bot className="w-5 h-5 text-purple-500" />,
            title: t("ai_chatbot_title"),
            desc: t("ai_chatbot_desc"),
        },
        {
            icon: <MessageCircle className="w-5 h-5 text-orange-500" />,
            title: t("seller_chat_title"),
            desc: t("seller_chat_desc"),
        },
        {
            icon: <Globe className="w-5 h-5 text-cyan-500" />,
            title: t("multi_language_title"),
            desc: t("multi_language_desc"),
        },
        {
            icon: <Moon className="w-5 h-5 text-indigo-500" />,
            title: t("dark_mode_title"),
            desc: t("dark_mode_desc"),
        },
        {
            icon: <Wallet className="w-5 h-5 text-emerald-500" />,
            title: t("wallet_feature_title"),
            desc: t("wallet_feature_desc"),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 md:gap-6 px-1"
        >
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <Wrench className="w-7 h-7 text-red-500 dark:text-red-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        {t("utilities_title")}
                    </h2>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 ml-10">
                    {t("utilities_description")}
                </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-2">
                            {tool.icon}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                                {tool.title}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {tool.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
