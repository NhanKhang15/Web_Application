// src/user_infor/screens/InfoCardBody.jsx
import React from "react";
import Avatar from "../../../widget/sceens/Avatar.jsx";

export default function InfoCardBody({ profile }) {
    if (!profile) return null;

    return (
        <>
            {/* Header */}
            <div className="min-h-[84px] md:h-[100px] w-full flex items-center gap-4 md:gap-6 mb-6">
                <Avatar
                    size={56}
                    src={profile.avatarUrl || "https://via.placeholder.com/56"}
                    alt={profile.fullName || "User"}
                />
                <div className="leading-tight">
                    <div className="text-lg md:text-xl font-semibold">{profile.fullName}</div>
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-3 h-3 text-[#9296ad]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-[#9296ad] text-sm">
                            {profile.address || "No address"}
                        </span>
                    </div>
                </div>
            </div>

            {/* User details */}
            {/* 👇 chỉ tách 2 cột khi >= lg (1024px) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-y-8 gap-x-8 mb-8">
                {/* LEFT GROUP (Phone + DOB) */}
                <div className="flex flex-col gap-6">
                    {/* Phone */}
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 lg:w-40 xl:w-52">
                            Phone:
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 break-all">
                            {profile.phone || "-"}
                        </span>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 lg:w-40 xl:w-52">
                            Date of Birth:
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 break-all">
                            {profile.dateOfBirth || "-"}
                        </span>
                    </div>
                </div>

                {/* RIGHT GROUP (Email + Bio) */}
                <div className="flex flex-col gap-6">
                    {/* Email */}
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 lg:w-40 xl:w-52">
                            Email:
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 break-all">
                            {profile.email || "-"}
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 lg:w-40 xl:w-52">
                            Bio:
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 break-all">
                            {profile.bio || "-"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-[#95979f] mb-4 md:mb-6" />
        </>
    );
}
