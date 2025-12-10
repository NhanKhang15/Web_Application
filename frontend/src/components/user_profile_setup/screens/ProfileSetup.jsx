import React, { useMemo, useRef, useState, useEffect } from "react";
import { getCurrentUser, upsertProfile } from "../../auth/services/userprofile_api";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "../lib/upload_api";
import { useTranslation } from "react-i18next";

export default function ProfileSetup() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();


  const initials = useMemo(() => {
    if (!fullName.trim()) return "?";
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }, [fullName]);

  const avatarPreviewUrl = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    if (avatarUrl) return avatarUrl;
    return null;
  }, [avatarFile, avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl && avatarFile) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl, avatarFile]);

  const nameOk = fullName.trim().length >= 2;
  const phoneOk = /^(\+?\d)[\d\s.-]{7,}$/.test(phone.trim());
  const addressOk = address.trim().length >= 5;
  const dobOk = Boolean(dob);
  const canFinish = nameOk && phoneOk && addressOk && dobOk;

  // chọn file
  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (avatarPreviewUrl && avatarFile) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarFile(f);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canFinish) return;

    setErr("");
    setSubmitting(true);
    try {
      const me = getCurrentUser();
      if (!me?.userId) throw new Error(t("missing_userid_error"));

      // 1) Upload nếu có file, không thì để rỗng (skip)
      const uploadedUrl = await uploadAvatar(avatarFile);

      // 2) Upsert profile
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: bio.trim(),
        avatarUrl: uploadedUrl || "",
        dateOfBirth: dob,
      };

      const res = await upsertProfile(me.userId, payload);
      if (res?.success) {
        // alert("Đã lưu profile ✅");
        window.location.replace("/dashboard");
      } else {
        throw new Error(res?.message || t("save_failed_error"));
      }
    } catch (e) {
      setErr(e.message || t("error_occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const finalStep = step === 4;

  return (
    <div className="min-h-screen w-full relative bg-neutral-100 dark:bg-[#212121] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 dark:block hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 80, 120, 0.25), transparent 70%), #000000" }}
      />
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white dark:bg-neutral-900 shadow-xl p-6 border border-neutral-200 dark:border-transparent">
        <div className="mb-6 flex items-center gap-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <Step label={`${t("profile_step")} ${s}`} active={step === s} done={step > s} />
              {s < 4 && <Dash />}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-[#E43137]">{t("profile_step")} {step}</p>
          <h2 className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {step === 1 && t("whats_your_full_name")}
            {step === 2 && t("whats_your_phone_number")}
            {step === 3 && t("whats_your_address")}
            {step === 4 && t("your_birthday_bio_avatar")}
          </h2>
        </div>

        {err && (
          <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-200">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("full_name_label")}</label>
              <input
                type="text"
                placeholder={t("placeholder_full_name")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-[#E43137]/50 outline-none transition-all"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("phone_number_label")}</label>
              <input
                type="tel"
                placeholder={t("placeholder_phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-[#E43137]/50 outline-none transition-all"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("home_address")}</label>
              <input
                type="text"
                placeholder={t("placeholder_address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-[#E43137]/50 outline-none transition-all"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("date_of_birth")}</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-[#E43137]/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("bio_optional")}</label>
                <textarea
                  placeholder={t("placeholder_bio")}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-[#E43137]/50 outline-none transition-all"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{t("avatar_label")}</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-600">
                    {avatarPreviewUrl ? (
                      <img src={avatarPreviewUrl} alt="avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">{initials}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-[#E43137] px-3 py-2 text-sm text-white"
                    >
                      {t("upload_button")}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickAvatar}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {t("avatar_fallback_text")}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-md border border-neutral-300 dark:border-neutral-500 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {t("back_button")}
              </button>
            )}
            {!finalStep ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto rounded-md bg-[#E43137] px-4 py-2 text-sm text-white"
              >
                {t("next_button")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !canFinish}
                className="ml-auto rounded-md bg-[#E43137] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {submitting ? t("saving_button") : t("finish_button")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Dash() {
  return <div className="h-0.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />;
}

function Step({ label, active, done }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "text-neutral-900 dark:text-white" : done ? "text-[#E43137]" : "text-neutral-500"}`}>
      <div
        className={`grid h-6 w-6 place-items-center rounded-full border-2 ${active ? "border-[#E43137]" : done ? "border-[#E43137] bg-[#E43137]" : "border-neutral-500"
          }`}
      >
        {done ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white">
            <path d="M7.5 13.1 3.9 9.5l-1.4 1.4 5 5 10-10-1.4-1.4-8.6 8.6z" />
          </svg>
        ) : (
          <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#E43137]" : "bg-transparent"}`} />
        )}
      </div>
      <span className={`${active ? "font-semibold" : ""}`}>{label}</span>
    </div>
  );
}
