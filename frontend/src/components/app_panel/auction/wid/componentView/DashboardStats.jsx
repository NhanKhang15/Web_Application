import React, { useState, useEffect } from "react";
import {
    CircleDollarSign,
    TrendingUp,
    ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToken, API_BASE_URL } from "../../../../../lib/api_url";

export default function DashboardStats() {
    const { t } = useTranslation();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance);
                }
            } catch (err) {
                console.error("Error fetching balance:", err);
            }
        };

        fetchBalance();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Định nghĩa stats cố định ở đây
    const stats = [
        {
            label: t("total_revenue"),
            value: formatCurrency(balance),
            icon: <CircleDollarSign className="w-5 h-5 text-red-500" />,
            className: "text-red-600 dark:text-red-400",
        },
        {
            label: t("sales"),
            value: "1.006.250.000 ₫",
            icon: <ShoppingCart className="w-5 h-5 text-gray-800 dark:text-gray-200" />,
            className: "text-black dark:text-white",
        },
        {
            label: t("profit"),
            value: "+640.000.000 ₫",
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            className: "text-green-600 dark:text-green-400",
        },
    ];

    return (
        <div className="flex flex-wrap gap-4 md:gap-8 lg:gap-16 items-start justify-start mb-6 md:mb-8 px-3 md:px-6 flex-shrink-0">
            {stats.map((s, i) => (
                <div
                    key={i}
                    className="flex flex-col min-w-[120px] md:min-w-[160px]"
                    data-aos="fade-up"
                    data-aos-delay={i * 100}
                >
                    <p className="uppercase text-[10px] md:text-[11px] tracking-wider text-[#9AA3B2] dark:text-gray-400 font-semibold mb-1">
                        {s.label}
                    </p>
                    <div className="flex items-center gap-2">
                        {s.icon}
                        <p className={`text-[18px] md:text-[24px] font-extrabold ${s.className}`}>{s.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}