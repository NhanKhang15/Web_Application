// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme/ThemeProvider.jsx";
import LoadingFallback from "./components/LoadingFallback.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Lazy load all route components for code splitting
const Login = lazy(() => import("./components/auth/screens/Login"));
const Signup = lazy(() => import("./components/auth/screens/Signup"));
const AuthCallback = lazy(() => import("./components/auth/screens/AuthCallback"));
const ProfileSetup = lazy(() => import("./components/user_profile_setup/screens/ProfileSetup"));
const MerchantProfile = lazy(() => import("./components/app_panel/pages/MerchantProfile"));
const Homepage = lazy(() => import("./components/cover_page/page/Homepage.jsx"));
const EmailVerificationPage = lazy(() => import("./components/verify_mail/screens/VerificationPage"));


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
            <ErrorBoundary>
                <BrowserRouter>
                    <Suspense fallback={<LoadingFallback />}>
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
                    </Suspense>
                </BrowserRouter>
            </ErrorBoundary>
        </ThemeProvider>
    );
}
