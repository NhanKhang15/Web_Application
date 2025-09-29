import React, { memo } from "react";
import Avatar from "./Avatar";

export const userProfileData = {
  src: "https://c.animaapp.com/mfm83o18SmdVol/img/8450-4933841266891-1589240822-n.png",
  alt: "Mazen Pacha",
  name: "Mazen Pacha",
};

// variant: "chip" = avatar + tên; "avatar" = chỉ avatar nhỏ
function UserProfileInfo({ variant = "chip" }) {
  if (variant === "avatar") {
    return (
      <div className="flex items-center transition-all duration-300 ease-out">
        <Avatar className="w-12 h-12" src={userProfileData.src} alt={userProfileData.alt} />
      </div>
    );
  }

  // chip bình thường (header chưa collapse)
  return (
    <div className="flex items-center transition-all duration-300 ease-out">
      <Avatar className="w-16 h-16" src={userProfileData.src} alt={userProfileData.alt} />
      <div className="text-[#59f5bc] text-sm font-medium leading-none">{userProfileData.name}</div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders during scroll
export default memo(UserProfileInfo);
