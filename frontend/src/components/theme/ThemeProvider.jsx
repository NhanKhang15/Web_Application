import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // ✅ Lấy theme đã lưu ngay khi khởi tạo (tránh nháy sáng)
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    // ✅ Cập nhật class vào <html> mỗi khi theme thay đổi
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme); // lưu lại mỗi khi đổi
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
