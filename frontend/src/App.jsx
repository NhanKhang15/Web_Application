// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/screens/Login";
import Signup from "./components/auth/screens/Signup";
import AuthCallback from "./components/auth/screens/AuthCallback";
import ProfileSetup from "./components/user_profile_setup/screens/ProfileSetup";
import MerchantProfile from "./components/app_panel/pages/MerchantProfile";
import Homepage from "./components/cover_page/page/Homepage.jsx";
import { ThemeProvider } from "./components/theme/ThemeProvider.jsx";
import EmailVerificationPage from "./components/verify_mail/screens/VerificationPage";


function getUser() {
    const u = sessionStorage.getItem("user");
    try { return u ? JSON.parse(u) : null; } catch { return null; }
}

function RequireAuth({ children }) {
    const user = getUser();
    if (!user || !user.userId) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/Homepage" element={<Homepage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* OAuth callback */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Email Verification */}
                    <Route path="/verify-email" element={<EmailVerificationPage />} />

                    <Route
                        path="/user/profile"
                        element={
                            <RequireAuth>
                                <ProfileSetup />
                            </RequireAuth>
                        }
                    />

                    {/* --- CẬP NHẬT DASHBOARD ROUTES --- */}

                    {/* Level 1: /dashboard */}
                    <Route
                        path="/dashboard"
                        element={<RequireAuth><MerchantProfile /></RequireAuth>}
                    />

                    {/* Level 2: /dashboard/auctions */}
                    <Route
                        path="/dashboard/:category"
                        element={<RequireAuth><MerchantProfile /></RequireAuth>}
                    />

                    {/* Level 3: Menu con (VD: /dashboard/auctions/main, /dashboard/auctions/ongoing) */}
                    {/* Ở đây tham số thứ 2 ta gọi là :slug để khớp với logic MerchantProfile hiện tại */}
                    <Route
                        path="/dashboard/:category/:slug"
                        element={<RequireAuth><MerchantProfile /></RequireAuth>}
                    />

                    {/* 👇 THÊM ROUTE NÀY: Level 4 cho Chi tiết sản phẩm */}
                    {/* VD: /dashboard/auctions/main/iphone-15 */}
                    {/* :slug là 'main', :itemSlug là 'iphone-15' */}
                    <Route
                        path="/dashboard/:category/:slug/:itemSlug"
                        element={<RequireAuth><MerchantProfile /></RequireAuth>}
                    />

                    <Route path="*" element={<Homepage />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}