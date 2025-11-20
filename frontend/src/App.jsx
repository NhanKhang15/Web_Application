import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/screens/Login";
import Signup from "./components/auth/screens/Signup";
import AuthCallback from "./components/auth/screens/AuthCallback";
import ProfileSetup from "./components/user_profile_setup/screens/ProfileSetup";
import MerchantProfile from "./components/app_panel/pages/MerchantProfile";
import Homepage from "./components/cover_page/page/Homepage.jsx";
import { ThemeProvider } from "./components/theme/ThemeProvider.jsx";
import AuctionView from "./components/app_panel/auction/screen/AuctionView.jsx";
import AuctionDetail from "./components/app_panel/auction/screen/AuctionDetail.jsx";

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

function RedirectHome() {
    const u = getUser();
    if (!u) return <Navigate to="/login" replace />;

    const completed = !!u.profileCompleted;
    return <Navigate to={completed ? "/dashboard" : "/user/profile"} replace />;
}

export default function App() {
    return (
        // ✅ bọc toàn bộ App bằng ThemeProvider
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/Homepage" element={<Homepage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* OAuth callback */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                        path="/user/profile"
                        element={
                            <RequireAuth>
                                <ProfileSetup />
                            </RequireAuth>
                        }
                    />

                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <MerchantProfile /> {/* có <Outlet /> bên trong */}
                            </RequireAuth>
                        }
                    >
                        <Route index element={<AuctionView />} />
                        <Route path=":category" element={<AuctionView />} />
                        <Route path=":category/:slug" element={<AuctionDetail />} /> {/* hoặc ItemDetail */}
                    </Route>

                    <Route path="*" element={<Homepage />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
