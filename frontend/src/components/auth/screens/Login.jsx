import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { loginLocal, startGoogleLogin } from "../services/login_api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function fetchMeForFlag() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return null;
      const me = await res.json();
      const raw = me?.data ?? me?.user ?? me;
      return {
        userId: raw?.userId ?? raw?.id ?? null,
        username: raw?.username ?? raw?.name ?? "",
        email: raw?.email ?? "",
        profileCompleted: !!raw?.profileCompleted,
      };
    } catch {
      return null;
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);

    if (!form.username || !form.password) {
      setErr("Vui lòng nhập đủ username và password.");
      return;
    }
    setLoading(true);
    try {
      const res = await loginLocal({ username: form.username, password: form.password });
      setMsg(res?.message || null);

      if (res?.success) {
        // Ưu tiên lấy flag từ login response nếu có
        let userObj = {
          userId: res.user_id ?? res.userId ?? null,
          username: res.username ?? "",
          email: res.email ?? "",
          profileCompleted: typeof res.profileCompleted === "boolean" ? res.profileCompleted : undefined,
        };

        // Nếu chưa có flag -> gọi /me
        if (userObj.userId && typeof userObj.profileCompleted !== "boolean") {
          const me = await fetchMeForFlag();
          if (me && me.userId) userObj = me;
          else userObj.profileCompleted = false; // fallback an toàn (buộc vào profile)
        }

        sessionStorage.setItem("user", JSON.stringify(userObj));
        setMsg(res?.message || "Đăng nhập thành công.");

        navigate(userObj.profileCompleted ? "/dashboard" : "/user/profile", { replace: true });
      } else {
        setErr(res?.message || "Đăng nhập thất bại.");
      }
    } catch (e2) {
      setErr(e2.message || "Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neutral-900 overflow-hidden isolate">
      {/* bg deco */}
      <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-2.svg" alt="" aria-hidden
           className="pointer-events-none select-none absolute left-0 bottom-0 z-0 -translate-x-1/3 translate-y-1/3 w-[110vw] sm:w-[90vw] md:w-[70vw] lg:w-[55vw] xl:w-[48vw] max-w-[1023px] aspect-square h-auto opacity-40" />
      <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-1.svg" alt="" aria-hidden
           className="pointer-events-none select-none absolute right-0 top-0 z-0 translate-x-1/3 -translate-y-1/3 w-[65vw] sm:w-[55vw] md:w-[45vw] lg:w-[35vw] xl:w-[28vw] max-w-[594px] aspect-square h-auto opacity-40" />

      <div className="relative z-10 w-full max-w-md px-6">
        <h1 className="text-5xl md:text-6xl font-bold font-poppins italic text-white mb-2 text-center">
          Welcome!!!
        </h1>
        <div className="text-sm text-neutral-300 mb-6 text-center">
          First time here?{" "}
          <button type="button" onClick={() => navigate("/signup")} className="text-white hover:underline">
            Sign up for free
          </button>
        </div>

        <Card className="bg-transparent border-0 shadow-none p-0">
          <CardContent className="p-0">
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input name="username" placeholder="Username" value={form.username}
                     onChange={onChange} disabled={loading} autoComplete="username" />
              <Input name="password" type="password" placeholder="Password" value={form.password}
                     onChange={onChange} disabled={loading} autoComplete="current-password" />

              <Button type="submit" disabled={loading}
                      className="w-full h-[50px] rounded-[20px] text-[21px] font-inter font-semibold">
                {loading ? "Loading..." : "Log in"}
              </Button>

              {(err || msg) && (
                <div className="text-center text-sm">
                  {err && <p className="text-red-400">{err}</p>}
                  {!err && msg && <p className="text-emerald-400">{msg}</p>}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                <span className="h-px w-24 bg-white/10" />
                <span>or continue with</span>
                <span className="h-px w-24 bg-white/10" />
              </div>

              {/* Google */}
              <Button type="button" variant="outline"
                      className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                      onClick={startGoogleLogin}>
                <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/frame.svg" alt="Google"
                     className="w-5 h-5 shrink-0" loading="lazy" draggable="false" />
                Log in with Google
              </Button>

              {/* Facebook (để sau) */}
              <Button type="button" variant="outline"
                      className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                      onClick={() => alert("Sẽ cắm sau giống Google nha.")}>
                <img src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/akar-icons-facebook-fill.svg" alt="Facebook"
                     className="w-5 h-5 shrink-0" loading="lazy" draggable="false" />
                Log in with Facebook
              </Button>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-neutral-400 hover:text-neutral-300">
                  Forgot your password?
                </button>
              </div>

              <p className="text-[13px] text-neutral-400 text-center leading-6">
                You acknowledge that you read, and agree, to our{" "}
                <a className="underline hover:text-neutral-300" href="#" rel="noreferrer">Terms of Service</a> and{" "}
                <a className="underline hover:text-neutral-300" href="#" rel="noreferrer">Privacy Policy</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
