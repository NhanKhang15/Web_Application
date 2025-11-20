import React from "react";
import {
    CircleDollarSign,
    TrendingUp,
    ShoppingCart,
} from "lucide-react";

// Định nghĩa stats cố định ở đây
const stats = [
    {
        label: "TOTAL REVENUE",
        value: "$50,000",
        icon: <CircleDollarSign className="w-5 h-5 text-red-500" />,
        className: "text-red-600 dark:text-red-400",
    },
    {
        label: "SALES",
        value: "$40,250",
        icon: <ShoppingCart className="w-5 h-5 text-gray-800 dark:text-gray-200" />,
        className: "text-black dark:text-white",
    },
    {
        label: "PROFIT",
        value: "+25,600",
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        className: "text-green-600 dark:text-green-400",
    },
];

export default function DashboardStats() {
    return (
        <div className="flex flex-wrap gap-16 items-start justify-start mb-8 px-6 flex-shrink-0">
            {stats.map((s, i) => (
                <div
                    key={i}
                    className="flex flex-col min-w-[160px]"
                    data-aos="fade-up"
                    data-aos-delay={i * 100}
                >
                    <p className="uppercase text-[11px] tracking-wider text-[#9AA3B2] dark:text-gray-400 font-semibold mb-1">
                        {s.label}
                    </p>
                    <div className="flex items-center gap-2">
                        {s.icon}
                        <p className={`text-[24px] font-extrabold ${s.className}`}>{s.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}