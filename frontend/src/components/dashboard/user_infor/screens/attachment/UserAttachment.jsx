import React, { useState } from "react";
import {
    Globe2,        // Passport 🌍
    FileBadge,     // License 📄
    FileCheck2,    // KYC ✅
    Receipt,       // Payment 💰
    FileText,      // Additional 🗂
} from "lucide-react";

import Avatar from "../../../widget/sceens/Avatar.jsx";

export default function UserAttachment({ profile }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    const attachments = {
        Passport: ["https://i.ibb.co/2W2L6pW/passport.jpg"],
        License: ["https://i.ibb.co/L8RmBg3/license.jpg"],
        KYC: ["https://i.ibb.co/kqmgZgP/kyc.jpg"],
        Payment: ["https://i.ibb.co/0fqzXvj/payment.jpg"],
        Additional: ["https://i.ibb.co/jgJDLW9/additional.jpg"],
    };

    // Các biểu tượng tài liệu (icon component)
    const documentStatuses = [
        { label: "Passport", icon: Globe2 },
        { label: "License", icon: FileBadge },
        { label: "KYC", icon: FileCheck2 },
        { label: "Payment", icon: Receipt },
        { label: "Additional", icon: FileText },
    ];

    return (
        <div className="flex flex-col gap-12 pt-12 pb-8 relative w-full overflow-x-hidden">
            {/* HEADER */}
            <div className="flex items-center gap-4 pl-2">
                <Avatar
                    size={64}
                    src={profile?.avatarUrl || "https://via.placeholder.com/64"}
                    alt={profile?.fullName || "User"}
                />
                <div className="leading-tight">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile?.fullName || "Unknown User"}
                    </h2>
                    <p className="text-sm text-neutral-500">
                        {profile?.location || profile?.address || "Location unknown"}
                    </p>
                </div>
            </div>

            {/* SYMBOLS + DOCUMENTS */}
            <div className="w-full">
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center min-w-0">
                    {documentStatuses.map((doc) => {
                        const hasAttachment =
                            attachments[doc.label] && attachments[doc.label].length > 0;
                        const Icon = doc.icon;

                        return (
                            <div key={doc.label} className="flex flex-col items-center">
                                {/* SYMBOL */}
                                <div className="flex flex-col items-center mb-5">
                                    <div
                                        className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg transition-colors duration-300
                    ${
                                            hasAttachment
                                                ? "bg-emerald-50 dark:bg-[#1a2a1f] text-emerald-500"
                                                : "bg-neutral-100 dark:bg-[#1a1f25] text-neutral-400"
                                        }`}
                                    >
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="mt-2 text-[11px] md:text-xs font-medium uppercase tracking-widest text-neutral-400">
                    {doc.label}
                  </span>
                                </div>

                                {/* THUMBNAILS */}
                                <div className="mt-2">
                                    {hasAttachment ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            {attachments[doc.label].map((url, idx) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`${doc.label}-${idx}`}
                                                    onClick={() => setPreviewUrl(url)}
                                                    className="w-full max-w-[220px] h-auto aspect-video object-cover rounded-md shadow-sm border border-neutral-200 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-md"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-64 h-40 rounded-md border-2 border-dashed border-neutral-200 flex items-center justify-center text-sm text-neutral-400">
                                            (để trống)
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL PREVIEW */}
            {previewUrl && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setPreviewUrl(null)}
                >
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-6 right-8 text-white text-3xl font-light hover:opacity-80"
                        onClick={() => setPreviewUrl(null)}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
