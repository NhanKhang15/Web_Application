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

export function ThemeProvider({ children }) {
    // ✅ Lấy theme đã lưu ngay khi khởi tạo (tránh nháy sáng)
    const [theme, setTheme] = useState(() => {
        const uid = getUserId();
        return localStorage.getItem(getThemeKey(uid)) || "light";
    });

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
