// src/user_infor/screens/EditUserDialog.jsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/Dialog.jsx";
import { Button } from "../../ui/Button.jsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";

// 👇 1. Thêm Import này (Lấy đường dẫn giống như bên InfoCardBody)
import Avatar from "../../../widget/screens/Avatar.jsx";

export default function EditUserDialog({ open, onOpenChange, profile, onSave }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(profile || {});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(profile?.avatarUrl || "");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setFormData(profile || {});
            setPreviewUrl(profile?.avatarUrl || "");
            setSelectedFile(null);
        }
    }, [open, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = () => {
        onSave(formData, selectedFile);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-transparent shadow-none text-neutral-900 dark:text-neutral-100">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 mt-2 p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-none border border-neutral-200 dark:border-neutral-800"
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center mb-2">
                            {t("edit_user_info")}
                        </DialogTitle>
                    </DialogHeader>

                    {/* --- PHẦN AVATAR (ĐÃ SỬA) --- */}
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="relative group inline-block"> {/* Thêm inline-block để ôm sát Avatar */}

                            {/* 👇 SỬA Ở ĐÂY: Dùng Avatar size lớn (100px) trực tiếp */}
                            <Avatar
                                size={100}
                                src={previewUrl}
                                alt={formData.fullName || "User"}
                                className="shadow-md" // Thêm chút bóng cho đẹp
                            />

                            {/* Nút Camera phủ lên trên */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                            >
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                            {t("change_avatar") || "Thay đổi ảnh"}
                        </button>
                    </div>

                    {/* ... (Phần Input Text giữ nguyên không đổi) ... */}
                    <div className="space-y-4">
                        {[
                            { label: t("full_name"), name: "fullName", type: "text" },
                            { label: t("phone"), name: "phone", type: "text" },
                            { label: t("address"), name: "address", type: "text" },
                        ].map((field, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    className="w-full rounded-lg px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                                {t("email")}
                            </label>
                            <input
                                type="email"
                                value={profile?.email || ""}
                                readOnly
                                className="w-full rounded-lg px-3 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border border-transparent cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                                {t("bio")}
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio || ""}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-6">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="px-4">
                            {t("cancel")}
                        </Button>
                        <Button variant="default" onClick={handleSave} className="!bg-blue-600 hover:!bg-blue-700 !text-white px-6">
                            {t("save_changes")}
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}