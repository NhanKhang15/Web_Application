import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Helper to get current user ID from sessionStorage
const getUserId = () => {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        return user && user.userId ? user.userId : null;
    } catch {
        return null;
    }
};

const getThemeKey = (uid) => (uid ? `theme_${uid}` : "theme");

// Helper to get saved theme for a user
const getSavedTheme = (uid) => {
    // Try user-specific key first, then fallback to global
    if (uid) {
        const userTheme = localStorage.getItem(`theme_${uid}`);
        if (userTheme) return userTheme;
    }
    return localStorage.getItem("theme") || "light";
};

export function ThemeProvider({ children }) {
    // ✅ Lấy theme đã lưu ngay khi khởi tạo
    const [theme, setTheme] = useState(() => {
        const uid = getUserId();
        return getSavedTheme(uid);
    });

    // ✅ Re-sync theme khi đăng nhập (lắng nghe custom event từ Login/AuthCallback)
    useEffect(() => {
        const syncThemeForUser = (uid) => {
            if (uid) {
                const savedTheme = localStorage.getItem(`theme_${uid}`);
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            }
        };

        // Handle login event (dispatched from Login.jsx and AuthCallback.jsx)
        const handleUserLogin = (event) => {
            const userObj = event.detail;
            if (userObj?.userId) {
                syncThemeForUser(userObj.userId);
            }
        };

        // Listen for custom userLogin event
        window.addEventListener('userLogin', handleUserLogin);

        // Also check on mount in case user is already logged in
        const uid = getUserId();
        if (uid) {
            syncThemeForUser(uid);
        }

        return () => {
            window.removeEventListener('userLogin', handleUserLogin);
        };
    }, []); // Empty dependency - only run on mount and when userLogin event fires

    // ✅ Cập nhật class vào <html> mỗi khi theme thay đổi
    useEffect(() => {
        const uid = getUserId();
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem(getThemeKey(uid), theme);
    }, [theme]);

    // ✅ Hàm toggle theme
    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

