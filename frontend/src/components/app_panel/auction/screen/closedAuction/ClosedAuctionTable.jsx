import React from "react";
import { CheckCircle2, XCircle, Eye, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../widget/screens/CurrencyContext";

// Component con: Dòng dữ liệu (Row)
const ClosedAuctionRow = ({ item, t, onViewResult, formatPrice, formatVND }) => {
    return (
        <tr className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
            {/* ID */}
            <td className="px-2 md:px-4 py-3 md:py-4">
                <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-[10px] font-bold dark:bg-gray-700 dark:text-gray-300">
                    {item.id}
                </span>
            </td>

            {/* Title */}
            <td className="px-2 md:px-4 py-3 md:py-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs md:text-sm max-w-[120px] md:max-w-[200px] truncate" title={item.title}>
                    {item.title}
                </div>
                <div className="text-[10px] md:text-xs text-neutral-400 mt-1">
                    {t("ended_on")} {new Date(item.endsAt).toLocaleDateString()}
                </div>
            </td>

            {/* Final Price - Always Visible */}
            <td className="px-2 md:px-4 py-3 md:py-4 font-bold text-neutral-900 dark:text-white text-xs md:text-sm">
                <div>{formatVND(item.finalPrice)}</div>
                {formatPrice(item.finalPrice).secondary && (
                    <div className="text-[10px] font-normal text-neutral-400">{formatPrice(item.finalPrice).secondary}</div>
                )}
            </td>

            {/* Status - Hidden on Small Mobile */}
            <td className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4">
                {item.isSold ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-medium border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> {t("sold")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] md:text-xs font-medium border border-red-200">
                        <XCircle className="w-3 h-3" /> {t("unsold")}
                    </span>
                )}
            </td>

            {/* Winner - Hidden on Mobile */}
            <td className="hidden md:table-cell px-4 py-4">
                {item.winner ? (
                    <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="truncate max-w-[100px]">{item.winner}</span>
                    </div>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm italic">—</span>
                )}
            </td>

            {/* Actions - Always Visible */}
            <td className="px-2 md:px-4 py-3 md:py-4">
                <button onClick={() => onViewResult && onViewResult(item)} className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="w-3 h-3" /> <span className="hidden sm:inline">{t("view_result")}</span>
                </button>
            </td>
        </tr>
    );
};

// Component chính: Table Container
export default function ClosedAuctionTable({ data, onViewResult }) {
    const { t } = useTranslation();
    const { formatPrice, formatVND } = useCurrency();

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] md:text-xs text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/50 border-b dark:border-neutral-800">
                        <tr>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_id")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_title")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_final_price")}</th>
                            <th className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_status")}</th>
                            <th className="hidden md:table-cell px-4 py-4 font-medium">{t("th_winner")}</th>
                            <th className="px-2 md:px-4 py-3 md:py-4 font-medium">{t("th_action")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <ClosedAuctionRow key={item.id} item={item} t={t} onViewResult={onViewResult} formatPrice={formatPrice} formatVND={formatVND} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
