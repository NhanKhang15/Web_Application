import { useState } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Body from "./Body.jsx";
import AuthDialog from "../ui/AuthDialog.jsx";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
    const [authOpen, setAuthOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <main className="bg-black min-h-screen w-full relative">
            <Header
                active="home"
                onLogin={() => navigate("/login")}
                onRegister={() => navigate("/signup")}
                onRequireAuth={() => setAuthOpen(true)}
            />
            <Body onRequireAuth={() => setAuthOpen(true)} />
            <Footer />

            {/* Popup */}
            <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
        </main>
    );
}
