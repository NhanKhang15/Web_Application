// src/user_infor/screens/UserOverview.jsx
import React from "react";
import { Button } from "../../ui/Button.jsx";
import InfoCardBody from "./InfoCardBody.jsx";
import EditUserDialog from "./EditUserDialog.jsx";
import WalletCard from "../../../payment/WalletCard.jsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function UserOverview({ profile, email, isEditing, setIsEditing, updateProfile }) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden min-w-0"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {t("user_info")}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-neutral-800"
                >
                    {t("edit_user_info")}
                </Button>
            </div>

            {/* Body */}
            <InfoCardBody profile={profile} email={email} />

            {/* Edit dialog */}
            <EditUserDialog
                open={isEditing}
                onOpenChange={setIsEditing}
                profile={profile}
                onSave={updateProfile}
            />

            <WalletCard />
        </motion.div>
    );
}
