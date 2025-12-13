import React from "react";
import { Clock, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScheduledTimer } from "../../hook/useAuction.jsx";

// Helper format tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper format thời gian
const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// --- Component con: Dòng dữ liệu (Row) ---
const AuctionTableRow = ({ item, t }) => {
    // Hook để tính thời gian còn lại đến khi bắt đầu
    const { secondsLeft, isStarted } = useScheduledTimer(item.startsAt);

    return (
        <tr className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
            {/* ID */}
            <td className="px-1 md:px-2 py-3 md:py-4 w-10 md:w-12">
                <span className={`px-1.5 py-0.5 rounded text-white text-[9px] font-bold ${item.statusColor}`}>
                    {item.id}
                </span>
            </td>

            {/* Title */}
            <td className="px-2 md:px-4 py-3 md:py-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs md:text-sm max-w-[120px] md:max-w-[200px] truncate" title={item.title}>
                    {item.title}
                </div>
                <div className="text-[10px] md:text-xs text-neutral-400 mt-1">157515kms</div>
            </td>

            {/* Min Increment - Hidden on Mobile */}
            <td className="hidden md:table-cell px-4 py-4 text-neutral-600 dark:text-neutral-400 text-sm">
                {formatCurrency(item.increment)}
            </td>

            {/* Trader - Hidden on Mobile */}
            <td className="hidden lg:table-cell px-4 py-4 text-neutral-600 dark:text-neutral-400 truncate max-w-[150px] text-sm">
                {item.trader}
            </td>

            {/* Base Price - Hidden on Mobile */}
            <td className="hidden md:table-cell px-4 py-4 font-medium text-neutral-800 dark:text-neutral-200 text-sm">
                {formatCurrency(item.base)}
            </td>

            {/* Timer - Always Visible */}
            <td className="px-2 md:px-4 py-3 md:py-4">
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-neutral-500 mb-1">
                    <Clock className="w-3 h-3" /> <span>{t("starts_in")}</span>
                </div>
                <div className={`font-bold font-mono text-sm md:text-lg ${isStarted ? "text-green-600" : secondsLeft < 3600 ? "text-orange-600 animate-pulse" : "text-blue-600"}`}>
                    {formatTime(secondsLeft)}
                </div>
            </td>

            {/* Current Price - Always Visible */}
            <td className="px-2 md:px-4 py-3 md:py-4 font-bold text-neutral-900 dark:text-white text-xs md:text-sm">
                {formatCurrency(item.base)}
            </td>
        </tr>
    );
};

// --- Component chính: Table Container ---
export default function ScheduledAuctionTable({ data }) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 max-w-full">
            <div className="overflow-x-auto max-w-full">
                <table className="w-full text-sm text-left table-fixed">
                    <thead className="text-[10px] md:text-xs text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/50 border-b dark:border-neutral-800">
                        <tr>
                            <th className="px-1 md:px-2 py-3 md:py-4 font-medium w-10 md:w-12">{t("th_id")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_title")}</th>
                            <th className="hidden md:table-cell px-4 py-4 font-medium">{t("th_min_inc")}</th>
                            <th className="hidden lg:table-cell px-4 py-4 font-medium">{t("th_trader")}</th>
                            <th className="hidden md:table-cell px-4 py-4 font-medium">{t("th_base_price")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_timer")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_current_price")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <AuctionTableRow key={item.id} item={item} t={t} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
