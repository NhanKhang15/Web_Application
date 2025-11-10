import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { signup } from "../services/signup_api";
import { useTranslation } from "react-i18next";
import {PasswordInput} from "../ui/PasswordInput.jsx";

export default function Signup() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [msg, setMsg] = useState(null);

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    };

    const changeLang = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang); // ✅ lưu lại lựa chọn
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);

        if (!form.username || !form.email || !form.password || !form.confirm) {
            setErr(t("fill_all_fields"));
            return;
        }
        if (form.password.length < 6) {
            setErr(t("password_too_short"));
            return;
        }
        if (form.password !== form.confirm) {
            setErr(t("password_not_match"));
            return;
        }

        setLoading(true);
        try {
            const res = await signup({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            if (res?.success) {
                setMsg(res.message || t("signup_success"));
                setTimeout(() => navigate("/login"), 600);
            } else {
                setErr(res?.message || t("signup_failed"));
            }
        } catch (e2) {
            setErr(e2.message || t("server_connection_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-neutral-900 overflow-hidden isolate">
            {/* 🏳️ Nút chọn ngôn ngữ ở góc phải trên */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                    onClick={() => changeLang("en")}
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        i18n.language === "en"
                            ? "bg-white text-black"
                            : "bg-transparent text-gray-300 hover:text-white"
                    }`}
                >
                    🇺🇸 EN
                </button>
                <button
                    onClick={() => changeLang("vi")}
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        i18n.language === "vi"
                            ? "bg-white text-black"
                            : "bg-transparent text-gray-300 hover:text-white"
                    }`}
                >
                    🇻🇳 VI
                </button>
            </div>

            {/* background decor */}
            <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-2.svg" alt="" aria-hidden
                 className="pointer-events-none absolute left-0 bottom-0 -translate-x-1/3 translate-y-1/3 w-[100vw] max-w-[1023px] opacity-40" />
            <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-1.svg" alt="" aria-hidden
                 className="pointer-events-none absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-[60vw] max-w-[594px] opacity-40" />

            <div className="relative z-10 w-full max-w-md px-6 animate-fade">
                <h1
                    className={`text-white mb-2 text-center font-poppins italic font-bold drop-shadow-lg ${
                        i18n.language === "vi"
                            ? "text-[2.6rem] sm:text-[3rem] leading-[1.2]"
                            : "text-5xl md:text-6xl leading-tight"
                    }`}
                >
                    {t("signup_title")}
                </h1>

                <div className="md:text-3xl font-bold text-white mb-4 text-center">
                    {t("signup_heading")}
                </div>

                <Card className="bg-transparent border-0 shadow-none p-0">
                    <CardContent className="p-0">
                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="text-sm text-neutral-300 text-center mt-4">
                                {t("already_have_account")}{" "}
                                <button type="button" onClick={() => navigate("/login")} className="text-white hover:underline">
                                    {t("login")}
                                </button>
                            </div>

                            <Input
                                name="username"
                                placeholder={t("username")}
                                value={form.username}
                                onChange={onChange}
                                disabled={loading}
                                autoComplete="username"
                            />

                            {/* 👁 Password field with toggle */}
                            <Input
                                name="email"
                                placeholder={t("email")}
                                value={form.email}
                                onChange={onChange}
                                disabled={loading}
                                autoComplete="email"
                            />

                            {/* 👁 Confirm Password */}
                            <PasswordInput
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                disabled={loading}
                                placeholder={t("password")}
                                autoComplete="new-password"
                            />

                            <PasswordInput
                                name="confirm"
                                value={form.confirm}
                                onChange={onChange}
                                disabled={loading}
                                placeholder={t("confirm_password")}
                                autoComplete="new-password"
                            />

                            {(err || msg) && (
                                <div className="text-center text-sm">
                                    {err && <p className="text-red-400">{err}</p>}
                                    {!err && msg && <p className="text-emerald-400">{msg}</p>}
                                </div>
                            )}

                            <Button type="submit" disabled={loading}
                                    className="w-full h-[50px] rounded-[20px] text-[21px] font-semibold">
                                {loading ? t("processing") : t("signup_heading")}
                            </Button>

                            {/* OAuth buttons */}
                            <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                                <span className="h-px w-24 bg-white/10" />
                                <span>{t("or_continue_with")}</span>
                                <span className="h-px w-24 bg-white/10" />
                            </div>

                            <Button type="button" variant="outline"
                                    className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                                    onClick={() => alert("Google OAuth chưa cắm.")}>
                                <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/frame.svg" alt="Google"
                                     className="w-5 h-5 shrink-0" />
                                {t("signup_google")}
                            </Button>

                            <Button type="button" variant="outline"
                                    className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                                    onClick={() => alert("Facebook OAuth chưa cắm.")}>
                                <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/akar-icons-facebook-fill.svg" alt="Facebook"
                                     className="w-5 h-5 shrink-0" />
                                {t("signup_facebook")}
                            </Button>

                            <p className="text-[13px] text-neutral-400 text-center leading-6">
                                {t("agree_terms")}{" "}
                                <a className="underline hover:text-neutral-300" href="#">{t("terms")}</a>,{" "}
                                <a className="underline hover:text-neutral-300" href="#">{t("data_policies")}</a>{" "}
                                {t("and")}{" "}
                                <a className="underline hover:text-neutral-300" href="#">{t("cookies_policy")}</a>.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
