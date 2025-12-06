// File: AuctionCard.jsx (Component con MỚI)
import React from "react";
import { ArrowUp } from "lucide-react";
import { PostAuctionApi } from "../../../seller/lib/PostAuctionApi.js";
import { useTranslation } from "react-i18next";

// helper
const fmtDate = (s) => {
    try {
        const d = new Date(s);
        return d.getFullYear();
    } catch {
        return s || "";
    }
};

const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

    // Extract data with fallbacks
    // API returns: auctionId, itemId, currentPrice, buyNowPrice, title, thumbnail, sellerName
    const currentBid = item.currentPrice || 0;
    const currency = item.currency || "AED";
    const sellerName = item.sellerName || `Seller #${item.sellerId || "?"}`;
    const location = item.location || t('Unknown_location');
    const title = item.title || "Untitled";
    const year = item.year || ""; // Year not in API yet
    const price = item.buyNowPrice || 0;

    // API returns 'thumbnail' which is the image URL
    const rawImg = item.thumbnail || item.imgUrl;
    const imgUrl = (rawImg && rawImg !== "placeholder.jpg")
        ? PostAuctionApi.getFullImageUrl(rawImg)
        : null;

    return (
        <div
            onClick={onClick}
            className="bg-[#F4F6F8] dark:bg-[#14191F] rounded-xl p-4 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow duration-300"
            data-aos="fade-up"
            data-aos-delay={aosDelay}
        >
            {/* Top Section: Current Bid */}
            <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-1">
                    <ArrowUp className="w-8 h-8 text-[#4ADE80]" strokeWidth={3} />
                    <div className="flex flex-col items-start">
                        <span className="text-2xl font-bold text-[#EF4444] leading-none">{currentBid}</span>
                        <span className="text-xs font-medium text-gray-500 uppercase">{currency}</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Seller Info */}
            <div className="flex items-center gap-3 justify-center">
                <img
                    src={`https://i.pravatar.cc/100?u=${item.sellerId || "x"}`}
                    alt={sellerName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{sellerName}</span>
                    <span className="text-xs text-gray-500">{location}</span>
                </div>
            </div>

            {/* Bottom Section: Image & Details */}
            <div className="flex flex-col gap-2 mt-2">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
                    {imgUrl ? (
                        <img
                            src={imgUrl}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            {t('No_image')}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-medium text-[#374151] dark:text-gray-100 leading-tight">{title}</h3>
                    <span className="text-sm text-gray-500">{year}</span>
                    <span className="text-base font-semibold text-[#111827] dark:text-white mt-1">
                        {formatCurrency(price)}
                    </span>
                </div>
            </div>
        </div>
    );
}