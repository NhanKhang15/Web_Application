import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken, API_BASE_URL } from "../../../lib/api_url";

export default function AuthCallback() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const error = search.get("error");
      if (error) { setErr(error); return; }

      const tokenRaw = search.get("token");
      const token = tokenRaw ? tokenRaw.replace(/\s+/g, "") : null;

      if (!token) {
        setErr("Không nhận được token từ callback.");
        return;
      }

      // lưu token (nếu bạn dùng)
      setToken(token);

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) {
          const bodyText = await res.text().catch(() => "");
          console.error("[/api/auth/me] status =", res.status, "body =", bodyText);
          setErr(`Auth/me fail: HTTP ${res.status}`);
          return;
        }

        const me = await res.json();
        const raw = me?.data ?? me?.user ?? me;

        const userObj = {
          userId: raw?.userId ?? raw?.id ?? null,
          username: raw?.username ?? raw?.name ?? "",
          email: raw?.email ?? "",
          profileCompleted: !!raw?.profileCompleted,
        };

        if (!userObj.userId) {
          setErr("Auth/me thiếu userId.");
          return;
        }

        sessionStorage.setItem("user", JSON.stringify(userObj));
        // Dispatch event to sync theme immediately
        window.dispatchEvent(new CustomEvent('userLogin', { detail: userObj }));
        navigate(userObj.profileCompleted ? "/dashboard" : "/user/profile", { replace: true });
      } catch (e) {
        console.error("[/api/auth/me] fetch error:", e);
        setErr("Không gọi được /api/auth/me (network/CORS).");
      }
    })();
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
      {!err ? <p>Đang đăng nhập...</p> : <p className="text-red-400">{err}</p>}
    </div>
  );
}
