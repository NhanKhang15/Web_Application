import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { signup } from "../../services/signup_api";

export default function Signup() {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!form.username || !form.email || !form.password || !form.confirm) {
      setErr("Điền đủ hết giúp mình nha 🫶");
      return;
    }
    if (form.password.length < 6) {
      setErr("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Password và Confirm không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // backend trả: { success, message, user_id, username, email }
      if (res?.success) {
        setMsg(res.message || "Tạo tài khoản thành công!");
        // tuỳ flow: chuyển thẳng login để user đăng nhập
        setTimeout(() => navigate("/login"), 600);
      } else {
        setErr(res?.message || "Đăng ký thất bại.");
      }
    } catch (e2) {
      setErr(e2.message || "Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neutral-900 overflow-hidden isolate">
      {/* vòng tròn trái dưới */}
      <img
        src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-2.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute left-0 bottom-0 z-0 -translate-x-1/3 translate-y-1/3 w-[110vw] sm:w-[90vw] md:w-[70vw] lg:w-[55vw] xl:w-[48vw] max-w-[1023px] aspect-square h-auto opacity-40"
      />
      {/* vòng tròn phải trên */}
      <img
        src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/ellipse-1.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute right-0 top-0 z-0 translate-x-1/3 -translate-y-1/3 w-[65vw] sm:w-[55vw] md:w-[45vw] lg:w-[35vw] xl:w-[28vw] max-w-[594px] aspect-square h-auto opacity-40"
      />

      {/* Nội dung */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade">
        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold font-poppins italic text-white mb-2 text-center">
          Start for free
        </h1>
        <div className="md:text-3xl font-bold font-poppins text-white mb-4 text-center">
          Signup
        </div>

        {/* Form card */}
        <Card className="bg-transparent border-0 shadow-none p-0">
          <CardContent className="p-0">
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={onChange}
                disabled={loading}
                autoComplete="username"
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
                autoComplete="email"
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <Input
                name="confirm"
                type="password"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={onChange}
                disabled={loading}
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-[20px] text-[21px] font-inter font-semibold"
                aria-busy={loading}
              >
                {loading ? "Processing..." : "Sign up"}
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
              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                onClick={() => alert("Tạm chưa cắm OAuth.")}
              >
                <img
                  src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/frame.svg"
                  alt="Google"
                  className="w-5 h-5 shrink-0"
                  loading="lazy"
                  draggable="false"
                />
                Sign up
              </Button>

              {/* Facebook */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] rounded-[20px] flex items-center justify-center gap-2"
                onClick={() => alert("Tạm chưa cắm OAuth.")} 
              >
                <img
                  src="https://c.animaapp.com/mfgiqgl3wM0cfa/img/akar-icons-facebook-fill.svg"
                  alt="Facebook"
                  className="w-5 h-5 shrink-0"
                  loading="lazy"
                  draggable="false"
                />
                Sign up
              </Button>


              <p className="text-[13px] text-neutral-400 text-center leading-6">
                By signing up, you agree to our{" "}
                <a className="underline hover:text-neutral-300" href="#" rel="noreferrer">
                  Terms
                </a>
                ,{" "}
                <a className="underline hover:text-neutral-300" href="#" rel="noreferrer">
                  Data Policies
                </a>{" "}
                and{" "}
                <a className="underline hover:text-neutral-300" href="#" rel="noreferrer">
                  Cookies Policy
                </a>
                .
              </p>

              {/* //cách ở đây */}
              <div className="space-y-6">
                <p className="text-[13px] text-neutral-400 text-center leading-6"></p>
                <div className="text-sm text-neutral-300 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-white hover:underline"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
