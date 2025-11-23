// src/settings/Settings.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import * as Toast from "@radix-ui/react-toast";
import { Separator } from "@radix-ui/react-separator";
import { Sun, Moon, LogOut, Globe } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const [toastOpen, setToastOpen] = useState(false);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            alert("❌ " + t("password_not_match"));
            return;
        }
        setToastOpen(true);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        alert("🚪 " + t("logout_success") + " thành công!");
        navigate("/", { replace: true });
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        setToastOpen(true);
    };

    return (
        <Toast.Provider>
            <div className="p-6 md:p-10 text-neutral-900 dark:text-neutral-100 transition-colors">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-3xl mx-auto space-y-10"
                >
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-semibold">⚙️ {t("settings")}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t("theme")} & {t("security")}
                        </p>
                    </div>

                    <Separator className="bg-neutral-200 dark:bg-neutral-700 h-[1px]" />

                    {/* Theme Section */}
                    <section>
                        <h2 className="text-lg font-medium mb-4">🎨 {t("theme")}</h2>
                        <button
                            onClick={() => {
                                toggleTheme();
                                setToastOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                            {theme === "light" ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-blue-400" />
                            )}
                            {theme === "light" ? t("light_mode") : t("dark_mode")}
                        </button>
                    </section>

                    <Separator className="bg-neutral-200 dark:bg-neutral-700 h-[1px]" />

                    {/* Language Section 🌐 */}
                    <section>
                        <h2 className="text-lg font-medium mb-4">🌍 {t('language')}</h2>
                        <div className="flex gap-4 ">
                            <button
                                onClick={() => handleLanguageChange("en")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border 
                                ${i18n.language.startsWith("en")
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    } transition`}
                            >
                                <Globe className="w-5 h-5" /> English
                            </button>

                            <button
                                onClick={() => handleLanguageChange("vi")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border
                                ${i18n.language.startsWith("vi")
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    } transition`}
                            >
                                <Globe className="w-5 h-5" /> Tiếng Việt
                            </button>
                        </div>
                    </section>

                    <Separator className="bg-neutral-200 dark:bg-neutral-700 h-[1px]" />

                    {/* Security Section */}
                    <section>
                        <h2 className="text-lg font-medium mb-4">🔒 {t("security")}</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <input
                                type="password"
                                placeholder={t("current_password") || "Mật khẩu hiện tại"}
                                value={form.currentPassword}
                                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                className="w-full p-3 rounded-lg bg-transparent border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="password"
                                placeholder={t("new_password") || "Mật khẩu mới"}
                                value={form.newPassword}
                                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                className="w-full p-3 rounded-lg bg-transparent border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="password"
                                placeholder={t("confirm_password") || "Xác nhận mật khẩu mới"}
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                className="w-full p-3 rounded-lg bg-transparent border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
                            >
                                {t("change_password")}
                            </button>
                        </form>
                    </section>

                    <Separator className="bg-neutral-200 dark:bg-neutral-700 h-[1px]" />

                    {/* Logout Section */}
                    <section>
                        <h2 className="text-lg font-medium mb-4">🚪 {t("logout")}</h2>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            {t("logout")}
                        </button>
                    </section>
                </motion.div>

                {/* ✅ Toast thông báo */}
                <Toast.Root
                    className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg"
                    open={toastOpen}
                    onOpenChange={setToastOpen}
                >
                    <Toast.Title>✅ {t("success")}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="fixed bottom-5 right-20 z-[1000000]" />
            </div>
        </Toast.Provider>
    );
}
