import React from "react";
import Avatar from "./Avatar";

export const userProfileData = {
  src: "https://c.animaapp.com/mfm83o18SmdVol/img/8450-4933841266891-1589240822-n.png",
  alt: "Mazen Pacha",
  name: "Mazen Pacha",
  email: "mazenpacha@gmail.com",
  role: "User",
};

export default function UserProfileInfo() {
  return (
    <div className="pt-[2vh] flex flex-col items-center">
      <Avatar
        className="w-[5.5vw] max-w-[4.5rem] min-w-[2.5rem] aspect-square"
        src={userProfileData.src}
        alt={userProfileData.alt}
      />
      <div className="mt-1 text-center leading-tight">
        <div className="text-white text-[0.7rem] sm:text-[0.75rem]">{userProfileData.name}</div>
        <div className="text-[#9296ad] text-[0.6rem] sm:text-[0.65rem]">{userProfileData.email}</div>
        <div className="text-[#59f5bc] text-[0.75rem] sm:text-[0.875rem]">{userProfileData.role}</div>
      </div>
    </div>
  );
}