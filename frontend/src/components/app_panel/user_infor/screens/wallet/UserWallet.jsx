// frontend/src/components/dashboard/user_infor/screens/wallet/UserWallet.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "../../../widget/screens/Avatar.jsx";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import WalletCard from "./WalletCard.jsx";

export default function UserWallet({ profile }) {
    const { t } = useTranslation();

    useEffect(() => {
        AOS.init({ duration: 600, offset: 100, once: true });
    }, []);

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
            
            {/* Wallet Card - handles Stripe payment verification */}
            <WalletCard />
        </div>
    );
}
