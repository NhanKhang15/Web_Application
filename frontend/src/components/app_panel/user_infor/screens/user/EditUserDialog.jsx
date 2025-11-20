// src/user_infor/screens/EditUserDialog.jsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../ui/Dialog.jsx";
import { Button } from "../../ui/Button.jsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function EditUserDialog({ open, onOpenChange, profile, onSave }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(profile);

    useEffect(() => {
        if (open) setFormData(profile);
    }, [open, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-md bg-transparent shadow-none text-neutral-900 dark:text-neutral-100"
            >
                {/* Nội dung bên trong — KHÔNG có box bao quanh */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 mt-2 p-4 rounded-xl bg-white dark:bg-neutral-900 shadow-none"
                >
                    {/* Header */}
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                            {t("edit_user_info")}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Input fields */}
                    {[
                        { label: t("full_name"), name: "fullName", type: "text" },
                        { label: t("phone"), name: "phone", type: "text" },
                        { label: t("address"), name: "address", type: "text" },
                    ].map((field, idx) => (
                        <div key={idx}>
                            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                className="w-full rounded-md px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ))}

                    {/* Email (readonly) */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            {t("email")}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={profile?.email || ""}
                            readOnly
                            className="w-full rounded-md px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            {t("bio")}
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio || ""}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-md px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Footer buttons */}
                    <DialogFooter className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {t("save_changes")}
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
