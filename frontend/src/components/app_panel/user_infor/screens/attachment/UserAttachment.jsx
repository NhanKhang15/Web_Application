// src/user_infor/screens/UserAttachment.jsx
import React, { useState, useEffect } from "react";
import {
    Globe2,
    FileBadge,
    FileCheck2,
    Receipt,
    FileText,
} from "lucide-react";
import Avatar from "../../../widget/screens/Avatar.jsx";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

export default function UserAttachment({ profile }) {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 600, offset: 100, once: true });
    }, []);

    const attachments = {
        Passport: ["https://i.ibb.co/2W2L6pW/passport.jpg"],
        License: ["https://i.ibb.co/L8RmBg3/license.jpg"],
        KYC: ["https://i.ibb.co/kqmgZgP/kyc.jpg"],
        Payment: ["https://i.ibb.co/0fqzXvj/payment.jpg"],
        Additional: ["https://i.ibb.co/jgJDLW9/additional.jpg"],
    };

    const documentStatuses = [
        { label: "Passport", transKey: "doc_passport", icon: Globe2 },
        { label: "License", transKey: "doc_license", icon: FileBadge },
        { label: "KYC", transKey: "doc_kyc", icon: FileCheck2 },
        { label: "Payment", transKey: "doc_payment", icon: Receipt },
        { label: "Additional", transKey: "doc_additional", icon: FileText },
    ];

    return (
        <div className="flex flex-col gap-6 md:gap-12 pt-4 md:pt-12 pb-8 relative w-full overflow-x-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 pl-2"
                data-aos="fade-up"
            >
                <Avatar
                    size={64}
                    src={profile?.avatarUrl || "https://via.placeholder.com/64"}
                    alt={profile?.fullName || "User"}
                />
                <div className="leading-tight">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile?.fullName || t("unknown_user")}
                    </h2>
                    <p className="text-sm text-neutral-500">
                        {profile?.location || profile?.address || t("location_unknown")}
                    </p>
                </div>
            </motion.div>

            {/* Documents */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 justify-items-center min-w-0">
                {documentStatuses.map((doc, idx) => {
                    const hasAttachment = attachments[doc.label]?.length > 0;
                    const Icon = doc.icon;

                    return (
                        <motion.div
                            key={doc.label}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                            }}
                            transition={{ delay: idx * 0.25 }}
                            data-aos="zoom-in-up"
                            className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-neutral-900"
                        >
                            <div className="flex flex-col items-center mb-4 mt-1">
                                <div
                                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg transition-all duration-300 ${hasAttachment
                                        ? "bg-emerald-50 dark:bg-[#1a2a1f] text-emerald-500"
                                        : "bg-neutral-100 dark:bg-[#1a1f25] text-neutral-400"
                                        }`}
                                >
                                    <Icon className="w-8 h-8" />
                                </div>
                                <span className="mt-2 text-[11px] md:text-xs font-medium uppercase tracking-widest text-neutral-400">
                                    {t(doc.transKey)}
                                </span>
                            </div>

                            {hasAttachment ? (
                                <div className="flex flex-col items-center space-y-3">
                                    {attachments[doc.label].map((url, idx2) => (
                                        <motion.img
                                            key={idx2}
                                            src={url}
                                            alt={`${doc.label}-${idx2}`}
                                            onClick={() => setPreviewUrl(url)}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-full max-w-[220px] aspect-video object-cover rounded-md shadow-sm cursor-pointer"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full max-w-[220px] h-24 md:h-36 rounded-md flex items-center justify-center text-xs md:text-sm text-neutral-400">
                                    {t('empty_state')}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div
                        key="preview"
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        onClick={() => setPreviewUrl(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.img
                            src={previewUrl}
                            alt="Preview"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-6 right-8 text-white text-3xl font-light hover:opacity-80"
                            onClick={() => setPreviewUrl(null)}
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
