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
import { motion } from "framer-motion";

export default function AboutUs() {
    const { t } = useTranslation();

    const cards = [
        {
            icon: <Rocket className="w-5 h-5 text-pink-500" />,
            title: t("about_mission_title"),
            desc: t("about_mission_desc"),
        },
        {
            icon: <Users className="w-5 h-5 text-green-500" />,
            title: t("about_team_title"),
            desc: t("about_team_desc"),
        },
        {
            icon: <Globe className="w-5 h-5 text-indigo-500" />,
            title: t("about_vision_title"),
            desc: t("about_vision_desc"),
        },
        {
            icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
            title: t("about_innovation_title"),
            desc: t("about_innovation_desc"),
        },
        {
            icon: <HeartHandshake className="w-5 h-5 text-red-500" />,
            title: t("about_community_title"),
            desc: t("about_community_desc"),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <Info className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {t("about_us_title")}
                </h2>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("about_us_intro")}
            </p>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((item, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                                {item.title}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                © {new Date().getFullYear()} AuctionHub — {t("all_rights_reserved")}
            </div>
        </motion.div>
    );
}
