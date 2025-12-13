// src/user_infor/screens/InfoCardBody.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../../widget/screens/Avatar.jsx";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

export default function InfoCardBody({ profile }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    if (!profile) return null;

    return (
        <>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="min-h-[84px] md:h-[100px] w-full flex items-center gap-4 md:gap-6 mb-6"
            >
                <Avatar
                    size={56}
                    src={profile.avatarUrl || "https://via.placeholder.com/56"}
                    alt={profile.fullName || "User"}
                />
                <div className="leading-tight">
                    <div className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile.fullName || t("no_data")}
                    </div>
                    <div className="flex items-center gap-2 text-[#9296ad] text-sm">
                        <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{profile.address || t("no_data")}</span>
                    </div>
                </div>
            </motion.div>

            {/* Info grid */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-y-8 gap-x-8 mb-8"
            >
                <div className="flex flex-col gap-6">
                    <InfoField label={t("phone")} value={profile.phone} />
                    <InfoField label={t("date_of_birth")} value={profile.dateOfBirth} />
                </div>
                <div className="flex flex-col gap-6">
                    <InfoField label={t("email")} value={profile.email} />
                    <div className="flex items-center gap-4">
                        {!profile.emailVerified && (
                            <button
                                onClick={() => navigate("/verify-email")}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#E43137] rounded-md hover:bg-[#c92b30] transition-colors"
                            >
                                {t("verify_email_button")}
                            </button>
                        )}
                    </div>
                    <InfoField label={t("bio")} value={profile.bio} />
                </div>
            </motion.div>
        </>
    );
}

function InfoField({ label, value }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-center bg-transparent"
        >
            <span className="font-medium text-neutral-800 dark:text-neutral-200 lg:w-40 xl:w-52">
                {label}
            </span>
            <span className="text-neutral-600 dark:text-neutral-400 break-all">
                {value || "-"}
            </span>
        </motion.div>
    );
}
