import React from "react";
import { Wrench, Calculator, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Utilities() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                {t("utilities_title")}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("utilities_description")}
            </p>

            {/* Grid of tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* System Tools */}
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("system_tools_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("system_tools_desc")}
                    </p>
                </div>

                {/* Quick Calculator */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("quick_calculator_title")}
                        </span>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {t("quick_calculator_desc")}
                    </p>
                </div>

                {/* Task Utilities */}
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("task_utilities_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("task_utilities_desc")}
                    </p>
                </div>
            </div>
        </div>
    );
}
