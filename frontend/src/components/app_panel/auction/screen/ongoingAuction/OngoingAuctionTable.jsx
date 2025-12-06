import React from "react";
import { Clock, MessageSquare, StopCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
// Import Hook logic (Lưu ý đường dẫn ../.. để về thư mục auction/hook)
import { useAuction } from "../../hook/useAuction.jsx";

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
    // Gọi Hook useAuction cho từng sản phẩm
    const { secondsLeft, currentBid, isEnded } = useAuction({
        auctionId: item.id,
        initialPrice: item.base,
        minIncrement: item.increment,
        endsAt: new Date(item.endsAt).toISOString(),
    });

    return (
        <tr className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
            {/* ID */}
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-white text-[10px] font-bold ${item.statusColor}`}>
                    {item.id}
                </span>
                <div className="mt-2 text-neutral-400 cursor-pointer hover:text-blue-500">
                    <MessageSquare className="w-4 h-4" />
                </div>
            </td>

            {/* Title */}
            <td className="px-6 py-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 w-56 truncate" title={item.title}>
                    {item.title}
                </div>
                <div className="text-xs text-neutral-400 mt-1">157515kms</div>
            </td>

            {/* Min Increment */}
            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                {formatCurrency(item.increment)}
            </td>

            {/* Trader */}
            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 truncate max-w-[150px]">
                {item.trader}
            </td>

            {/* Base Price */}
            <td className="px-6 py-4 font-medium text-neutral-800 dark:text-neutral-200">
                {formatCurrency(item.base)}
            </td>

            {/* Timer (Realtime từ Hook) */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-xs text-neutral-500 mb-1">
                    <Clock className="w-3 h-3" /> {t("ends_in")}
                </div>
                <div className={`font-bold font-mono text-lg ${isEnded ? "text-gray-400" : secondsLeft < 300 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                    {isEnded ? t("ended") : formatTime(secondsLeft)}
                </div>
            </td>

            {/* Current Price (Realtime từ Hook) */}
            <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                {formatCurrency(currentBid)}
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 hover:text-red-600">
                        <StopCircle className="w-3 h-3" /> {t("stop")}
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" /> {t("cancel_action")}
                    </button>
                </div>
            </td>
        </tr>
    );
};

// --- Component chính: Table Container ---
export default function OngoingAuctionTable({ data }) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[900px]">
                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/50 border-b dark:border-neutral-800">
                        <tr>
                            <th className="px-6 py-4 font-medium">{t("th_id")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_title")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_min_inc")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_trader")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_base_price")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_timer")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_current_price")}</th>
                            <th className="px-6 py-4 font-medium">{t("th_action")}</th>
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
