import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { requestEmailVerification, verifyEmail, changeEmail } from "../lib/email_verification_api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function EmailVerificationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [countdown, setCountdown] = useState(0);
    const initialEmailRef = useRef(null);

    // Init email from URL if present
    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
            // Lưu lại email ban đầu để so sánh
            if (!initialEmailRef.current) {
                initialEmailRef.current = emailParam;
            }
        }
    }, [searchParams]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setErr(t("verify_email_invalid_email", { defaultValue: "Vui lòng nhập email" }));
            return;
        }

        setLoading(true);
        setErr("");
        setSuccessMsg("");

        try {
            // 1. Check if email changed
            const initialEmail = initialEmailRef.current;
            console.log("Checking email change:", { initialEmail, trimmedEmail });

            if (initialEmail && initialEmail !== trimmedEmail) {
                console.log("Calling changeEmail API...");
                // Call change email API
                await changeEmail(initialEmail, trimmedEmail);
                // Update initialEmail to new one so we don't call it again unnecessarily
                initialEmailRef.current = trimmedEmail;
                console.log("Email changed successfully.");
            }

            await requestEmailVerification(trimmedEmail);
            setSuccessMsg(t("verify_email_code_sent", { defaultValue: "Mã xác thực đã được gửi tới email của bạn." }));
            setStep(2);
            setCountdown(60);
        } catch (error) {
            setErr(error.message || t("error_occurred"));
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const trimmedCode = code.trim();
        if (!trimmedCode) {
            setErr(t("verify_email_invalid_code", { defaultValue: "Vui lòng nhập mã xác thực" }));
            return;
        }

        setLoading(true);
        setErr("");
        setSuccessMsg("");

        try {
            await verifyEmail(email, trimmedCode);
            setSuccessMsg(t("verify_email_success", { defaultValue: "Xác thực thành công!" }));
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (error) {
            setErr(error.message || t("verify_email_failed", { defaultValue: "Xác thực thất bại. Vui lòng kiểm tra lại mã." }));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (countdown === 0) {
            handleSendCode({ preventDefault: () => { } });
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-neutral-100 dark:bg-[#212121] flex flex-col items-center justify-center p-4">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 dark:block hidden"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 80, 120, 0.25), transparent 70%), #000000",
                }}
            />

            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                        {step === 1 ? t("verify_email_title", { defaultValue: "Xác thực Email" }) : t("verify_email_enter_code", { defaultValue: "Nhập mã xác thực" })}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {step === 1
                            ? t("verify_email_desc", { defaultValue: "Nhập email của bạn để nhận mã xác thực." })
                            : t("verify_email_code_desc", { defaultValue: `Mã xác thực đã được gửi tới ${email}` })}
                    </p>
                </div>

                {err && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-200 text-sm text-center">
                        {err}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-200 text-sm text-center">
                        {successMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#E43137] focus:border-transparent outline-none transition-all"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="w-full py-2.5 rounded-lg bg-[#E43137] hover:bg-[#c92b30] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Mã xác thực</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Nhập mã 6 số"
                                className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#E43137] focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="w-full py-2.5 rounded-lg bg-[#E43137] hover:bg-[#c92b30] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xác thực..." : "Xác thực"}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Chưa nhận được mã?{" "}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || loading}
                                    className="text-[#E43137] hover:underline disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:no-underline font-medium"
                                >
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại"}
                                </button>
                            </p>
                            <button
                                type="button"
                                onClick={() => { setStep(1); setErr(""); setSuccessMsg(""); }}
                                className="mt-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                            >
                                Đổi email
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Instructions / Notes */}
            <div className="relative z-10 mt-6 max-w-md w-full text-center">
                <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                    <h3 className="text-neutral-700 dark:text-neutral-300 text-sm font-medium mb-2">Lưu ý quan trọng:</h3>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 text-left list-disc list-inside px-2">
                        <li>Mã xác thực sẽ được gửi đến email của bạn trong vài phút.</li>
                        <li>Vui lòng kiểm tra cả hộp thư <strong>Spam</strong> hoặc <strong>Junk</strong> nếu không thấy email.</li>
                        <li>Mã xác thực có hiệu lực trong thời gian ngắn.</li>
                        <li>Nếu gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
