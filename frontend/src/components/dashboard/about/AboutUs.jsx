import React from "react";
import {
    Info,
    Users,
    Rocket,
    Globe,
    Sparkles,
    HeartHandshake,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Info className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {t("about_us_title")}
                </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("about_us_intro")}
            </p>

            {/* Row 1 — 3 sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mission */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-pink-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("about_mission_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("about_mission_desc")}
                    </p>
                </div>

                {/* Team */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("about_team_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("about_team_desc")}
                    </p>
                </div>

                {/* Global Vision */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("about_vision_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("about_vision_desc")}
                    </p>
                </div>
            </div>

            {/* Row 2 — 2 sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Innovation */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("about_innovation_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("about_innovation_desc")}
                    </p>
                </div>

                {/* Community */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:shadow-md transition">
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {t("about_community_title")}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("about_community_desc")}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                © {new Date().getFullYear()} AuctionHub Team — {t("all_rights_reserved")}
            </div>
        </div>
    );
}
