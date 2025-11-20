import React, { memo } from "react";
import Avatar from "./Avatar";

function UserProfileInfo({ variant = "chip", profile, email, onClick }) {
    const avatarUrl = profile?.avatarUrl || "https://via.placeholder.com/56";
    const name = profile?.fullName || email || "User";

    // Kiểu hiển thị chỉ có avatar
    if (variant === "avatar") {
        return (
            <div
                className="flex items-center cursor-pointer transition-all duration-300 ease-out"
                onClick={onClick}
            >
                <Avatar size={56} className="w-12 h-12" src={avatarUrl} alt={name} />
            </div>
        );
    }

    // Kiểu hiển thị avatar + tên
    return (
        <div
            className="flex items-center cursor-pointer transition-all duration-300 ease-out"
            onClick={onClick}
        >
            <Avatar size={56} src={avatarUrl} alt={name} />
            <div className="ml-3">
                <div
                    className="text-[#e43137] dark:text-[#ff6b6f]
                     text-sm font-bold leading-none transition-colors duration-300"
                >
                    {name}
                </div>
                <div
                    className="text-gray-600 dark:text-gray-400 text-xs font-normal mt-0.5 transition-colors duration-300"
                >
                    {email}
                </div>
            </div>
        </div>
    );
}

export default memo(UserProfileInfo);
