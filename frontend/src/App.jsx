import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/screens/Login";
import Signup from "./components/auth/screens/Signup";
import AuthCallback from "./components/auth/screens/AuthCallback";
import ProfileSetup from "./components/user_profile_setup/screens/ProfileSetup";
import MerchantProfile from "./components/dashboard/pages/MerchantProfile"; 
import Homepage from "./components/cover_page/sections/Homepage";

function getUser() {
  const u = sessionStorage.getItem("user");
  try { return u ? JSON.parse(u) : null; } catch { return null; }
}
function isAuthed() { return !!getUser()?.userId; }

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function RedirectHome() {
  const u = getUser();
  if (!u) return <Navigate to="/login" replace />;

  const completed = !!u.profileCompleted;
  return <Navigate to={completed ? "/dashboard" : "/user/profile"} replace />;
}

export default function App() {
  return (
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
              {/* ✅ đổi Dashboard -> MerchantProfile */}
              <Route
                  path="/dashboard"
                  element={
                  <RequireAuth>
                      <MerchantProfile />
                  </RequireAuth>
              }
              />

              <Route path="*" element={<Homepage />} />
          </Routes>
      </BrowserRouter>
  );
}
