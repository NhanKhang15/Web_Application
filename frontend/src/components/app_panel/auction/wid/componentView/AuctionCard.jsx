// File: AuctionCard.jsx - Redesigned Premium Auction Card
import React from "react";
import { ArrowUpRight, MapPin, ImageOff, ShoppingCart } from "lucide-react";
import { PostAuctionApi } from "../../../seller/lib/PostAuctionApi.js";
import { BidApi } from "../../lib/BidApi.js";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../widget/screens/CurrencyContext";

// helper - kept for fallback
const formatCurrencyVND = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
    const { formatPrice, currency } = useCurrency();

    // Extract data with fallbacks
    const currentBid = item.currentPrice || 0;
    const sellerName = item.sellerName || `${t('seller_prefix')}${item.sellerId || "?"}`;
    const location = item.location || t('Unknown_location');
    const title = item.title || t('untitled');
    const price = item.buyNowPrice || 0;

    // Get formatted prices with conversion
    const bidPriceDisplay = formatPrice(currentBid);
    const buyNowPriceDisplay = formatPrice(price);

    // API returns 'thumbnail' which is the image URL
    const rawImg = item.thumbnail || item.imgUrl;
    const imgUrl = (rawImg && rawImg !== "placeholder.jpg")
        ? PostAuctionApi.getFullImageUrl(rawImg)
        : null;

    return (
        <div
            onClick={onClick}
            className="group relative bg-gradient-to-br from-gray-100 to-white dark:from-[#1a1f2e] dark:to-[#0d1117] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/10 border border-gray-200 dark:border-gray-800/50 hover:border-red-500/30"
            data-aos="fade-up"
            data-aos-delay={aosDelay}
            style={{ minHeight: '280px' }}
        >
            {/* Image Section - Reduced height for better text visibility */}
            <div className="relative h-40 md:h-48 w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                        <ImageOff className="w-12 h-12" />
                        <span className="text-sm font-medium">{t('No_image')}</span>
                    </div>
                )}

                {/* Current Bid Badge - Floating on Image with blur effect */}
                <div className="absolute top-3 left-3 flex flex-col items-start bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-4 h-4 text-green-400" strokeWidth={2.5} />
                        <span className="text-sm font-bold text-green-400">{bidPriceDisplay.primary}</span>
                    </div>
                    {bidPriceDisplay.secondary && (
                        <span className="text-[10px] text-green-300/80 ml-5">{bidPriceDisplay.secondary}</span>
                    )}
                </div>
            </div>

            {/* Content Section - Compact */}
            <div className="p-3 flex flex-col gap-2">
                {/* Title */}
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                    {title}
                </h3>

                {/* Buy Now Price - Below title with cart icon */}
                {price > 0 && (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{buyNowPriceDisplay.primary}</span>
                        </div>
                        {buyNowPriceDisplay.secondary && (
                            <span className="text-[10px] text-orange-400/70 dark:text-orange-300/60 ml-5">{buyNowPriceDisplay.secondary}</span>
                        )}
                    </div>
                )}

                {/* Seller Info - Compact */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <img
                                src={`https://i.pravatar.cc/100?u=${item.sellerId || "x"}`}
                                alt={sellerName}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-300 dark:ring-gray-700"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-[#0d1117]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                                {sellerName}
                            </span>
                            <div className="flex items-center gap-0.5 text-gray-500">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="text-[10px]">{location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bid Button */}
                    <div className="flex items-center gap-1">
                        {price > 0 && item.status === 'Open' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Bạn có chắc muốn mua ngay với giá ${formatCurrency(price)}?`)) {
                                        BidApi.buyNow(item.auctionId)
                                            .then(res => {
                                                alert("Mua thành công! Vui lòng kiểm tra email.");
                                                // Reload or callback to update UI
                                                window.location.reload();
                                            })
                                            .catch(err => {
                                                alert(err.message || "Lỗi khi mua ngay");
                                            });
                                    }
                                }}
                                className="px-2 py-1 h-7 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                {t('buy_now')}
                            </button>
                        )}
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 transition-all duration-300">
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-500 dark:text-red-400 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent" />
            </div>
        </div>
    );
}