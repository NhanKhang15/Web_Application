import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken, API_BASE_URL } from "../../../lib/api_url";

export default function AuthCallback() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const token = search.get("token");
      const error = search.get("error");
      if (error) { setErr(error); return; }

      if (token) setToken(token); // nếu dùng JWT qua query

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers,
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
          profileCompleted: !!raw?.profileCompleted, // <-- quan trọng
        };
        if (!userObj.userId) {
          setErr("Auth/me thiếu userId.");
          return;
        }

        sessionStorage.setItem("user", JSON.stringify(userObj));

        // Điều hướng 1 lần ở đây, không để App hay nơi khác làm nữa
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
