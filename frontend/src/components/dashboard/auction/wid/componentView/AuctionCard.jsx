// File: AuctionCard.jsx (Component con MỚI)
import React from "react";
import { ArrowUp } from "lucide-react";
import { PostAuctionApi } from "../../../postAuction/lib/PostAuctionApi.js";
import {useTranslation} from "react-i18next";

// helper
const fmtDate = (s) => {
    try {
        const d = new Date(s);
        return d.toLocaleString();
    } catch {
        return s || "";
    }
};

/**
 * Component này hiển thị 1 thẻ vật phẩm
 * Props:
 * - item: Object vật phẩm
 * - onClick: Hàm gọi khi bấm vào thẻ
 * - aosDelay: Thời gian delay cho animation
 */
export default function AuctionCard({ item, onClick, aosDelay }) {
    const { t } = useTranslation();

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-[#14191F] rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col transform-gpu transition hover:scale-[1.02] cursor-pointer"
            data-aos="fade-up"
            data-aos-delay={aosDelay}
        >
            <div className="flex items-center gap-2 mb-2">
                <ArrowUp className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.location || t('Unknown_location')}
                </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <img
                    src={`https://i.pravatar.cc/100?u=${item.sellerId || "x"}`}
                    alt={`Seller ${item.sellerId}`}
                    className="w-8 h-8 rounded-full"
                />
                <div>
                    <p className="text-sm font-medium">Seller #{item.sellerId}</p>
                    <p className="text-xs text-neutral-500 dark:text-gray-400">
                        {fmtDate(item.createdAt)}
                    </p>
                </div>
            </div>

            <div className="flex flex-col flex-1 items-center justify-center">
                {(item.imgUrl && item.imgUrl !== "placeholder.jpg") ? (
                    <img
                        src={PostAuctionApi.getFullImageUrl(item.imgUrl)}
                        alt={item.title}
                        className="h-32 w-auto object-cover rounded-lg mb-3 transform-gpu"
                    />
                ) : (
                    <div className="h-32 w-full flex items-center justify-center rounded-lg mb-3 bg-gray-100 dark:bg-gray-800">
                        <span className="text-xs text-gray-500">{t('No_image')}</span>
                    </div>
                )}
                <p className="text-sm font-semibold text-center">{item.title}</p>
                {item.description && (
                    <p className="text-xs text-neutral-500 dark:text-gray-400 line-clamp-2 mt-1 text-center">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );
}