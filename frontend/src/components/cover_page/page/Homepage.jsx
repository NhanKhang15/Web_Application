import { useState } from "react";
import Header from "../sections/Header.jsx";
import Footer from "../sections/Footer.jsx";
import Body from "../sections/Body.jsx";
import AuthDialog from "../ui/AuthDialog.jsx";
import { useNavigate } from "react-router-dom";
import Snowfall from "react-snowfall";

export default function Homepage() {
    const [authOpen, setAuthOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <main className="bg-black min-h-screen w-full relative overflow-x-hidden">
            {/* Snowfall Effect */}
            <Snowfall
                snowflakeCount={200}
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            />
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
