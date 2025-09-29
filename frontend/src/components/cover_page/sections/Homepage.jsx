import Header from "./Header.jsx";
import Footer from "./Footer";
import Body from "./Body";

export default function Homepage() {
    return (
        <main className="bg-black min-h-screen w-full relative">
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226,232,240,0.15), transparent 70%), #000",
                }}
            />
            <div className="max-w-screen-xl mx-auto w-full">
                <Header active="home" onLogin={() => {/* navigate('/login') */}} onRegister={() => {/* navigate('/signup') */}} />
                <Body />
                <Footer />
            </div>
        </main>
    );
}
