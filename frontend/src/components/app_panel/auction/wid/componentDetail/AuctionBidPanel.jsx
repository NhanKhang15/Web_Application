import React, { useMemo, useState } from "react";
import {
    Clock,
    Heart,
    Timer,
    CheckCircle2,
    AlertCircle,
    History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../../widget/screens/CurrencyContext";

// --- Helper functions ---
const fmt = (n) => Number(n ?? 0).toLocaleString('vi-VN');
const hhmmss = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
};

export default function AuctionBidPanel({ product, bids = [], onPlaceBid, isOwner = false }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { formatPrice, formatVND } = useCurrency();

    // Calculate time left (simple version, ideally use a hook or interval)
    const [now, setNow] = useState(Date.now());

    // Update timer every second
    React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const endDate = new Date(product.endDate).getTime();
    const secondsLeft = Math.max(0, Math.floor((endDate - now) / 1000));
    const isEnded = secondsLeft <= 0;

    const closesDisplay = useMemo(() => {
        const secondsInDay = 24 * 60 * 60;
        if (secondsLeft > secondsInDay) {
            const daysLeft = Math.max(1, Math.ceil(secondsLeft / secondsInDay));
            const fallback = daysLeft > 1 ? `${daysLeft} days` : `${daysLeft} day`;
            return t("Days_left", { count: daysLeft, days: daysLeft, defaultValue: fallback });
        }
        return hhmmss(secondsLeft);
    }, [secondsLeft, t]);

    const [amount, setAmount] = useState("");
    const [displayAmount, setDisplayAmount] = useState(""); // Formatted for display
    const [msg, setMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format number with thousand separators (Vietnamese style: dots)
    const formatWithSeparator = (value) => {
        if (!value && value !== 0) return "";
        return value.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ".");
    };

    // Remove formatting to get raw number
    const parseFormattedNumber = (formattedValue) => {
        return formattedValue.replace(/\./g, "");
    };

    // Handle bid amount input change
    const handleAmountChange = (value) => {
        const rawValue = parseFormattedNumber(value);
        // Only allow digits
        if (rawValue && !/^\d+$/.test(rawValue)) return;

        setAmount(rawValue);
        setDisplayAmount(formatWithSeparator(rawValue));
    };

    const currentPrice = product.price;
    const nextMinBid = currentPrice + product.minStep;

    const submit = async () => {
        setMsg(null);
        if (!amount) return;

        const val = Number(amount);
        if (val < nextMinBid) {
            setMsg({ ok: false, text: t('Bid_too_low', { min: fmt(nextMinBid) }) });
            return;
        }

        setIsSubmitting(true);
        try {
            await onPlaceBid(val);
            setMsg({ ok: true, text: t('Bid_placed_success', { amount: formatWithSeparator(val) }) });
            setAmount("");
            setDisplayAmount("");
        } catch (e) {
            setMsg({ ok: false, text: e.message || t('ERR_BID_FAILED') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#14191F] rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
            {/* --- Header Info --- */}
            <div className="p-5 border-b dark:border-gray-700">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {product.model && (
                    <p className="text-gray-500 dark:text-gray-400">{product.model}</p>
                )}

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{t('Closes_in')}</span>
                    <span className={`font-semibold ${isEnded ? "text-red-500" : "text-green-600"}`}>
                        {closesDisplay}
                    </span>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                >
                    <Heart className="w-4 h-4" /> {t('Add_to_Watchlist')}
                </button>
            </div>

            {/* Bid section */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-500 mb-1">{t('CURRENT_BID')}</p>
                <div className="flex flex-col">
                    <h2 className="text-3xl font-extrabold text-green-600">
                        {formatPrice(currentPrice).primary}
                    </h2>
                    {formatPrice(currentPrice).secondary && (
                        <span className="text-sm text-green-500/70">{formatPrice(currentPrice).secondary}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bids.length} {t('bids')}</p>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-500 space-y-2">
                    {/* Starting Price */}
                    <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-700 dark:text-gray-400">{t('Starting_Price')}:</span>
                        <div className="text-right">
                            <span className="font-semibold">{formatVND(product.startingPrice)}</span>
                            {formatPrice(product.startingPrice).secondary && (
                                <p className="text-xs text-gray-400">{formatPrice(product.startingPrice).secondary}</p>
                            )}
                        </div>
                    </div>
                    {/* Min Step */}
                    <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-700 dark:text-gray-400">{t('Min_Step')}:</span>
                        <div className="text-right">
                            <span className="font-semibold">{formatVND(product.minStep)}</span>
                            {formatPrice(product.minStep).secondary && (
                                <p className="text-xs text-gray-400">{formatPrice(product.minStep).secondary}</p>
                            )}
                        </div>
                    </div>
                    {/* Next min bid */}
                    <div className="flex justify-between items-start pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-400">
                            <Timer className="w-4 h-4" />
                            <span className="font-medium">{t('Next_min_bid')}:</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-purple-600 dark:text-purple-400">{formatVND(nextMinBid)}</span>
                            {formatPrice(nextMinBid).secondary && (
                                <p className="text-xs text-gray-400">{formatPrice(nextMinBid).secondary}</p>
                            )}
                        </div>
                    </div>
                </div>

                {product.buyNowPrice && (
                    <div className="mt-4">
                        <button
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-sm uppercase tracking-wide"
                            onClick={() => alert(t("buy_now_alert"))}
                        >
                            {t('Buy_Now')} - {formatPrice(product.buyNowPrice).primary}
                        </button>
                        {formatPrice(product.buyNowPrice).secondary && (
                            <p className="text-xs text-center text-red-400/70 mt-1">{formatPrice(product.buyNowPrice).secondary}</p>
                        )}
                    </div>
                )}

                {msg && (
                    <div
                        className={`mt-3 text-sm flex items-center gap-2 ${msg.ok ? "text-green-600" : "text-red-500"
                            }`}
                    >
                        {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {msg.text}
                    </div>
                )}

                {isOwner && (
                    <div className="mt-3 text-sm flex items-center gap-2 text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        {t('Cannot_bid_own_item', { defaultValue: 'Bạn không thể đấu giá sản phẩm của chính mình' })}
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={displayAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        disabled={isEnded || isSubmitting || isOwner}
                        placeholder={isOwner ? t('Your_item', { defaultValue: 'Sản phẩm của bạn' }) : `≥ ${formatWithSeparator(nextMinBid)}`}
                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-[#0B0F13]"
                    />
                    <button
                        onClick={submit}
                        disabled={isEnded || isSubmitting || isOwner}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? '...' : t('Submit')}
                    </button>
                </div>

                {/* Currency conversion for bid amount */}
                {amount && formatPrice(Number(amount)).secondary && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {formatPrice(Number(amount)).secondary}
                    </p>
                )}

                <div className="mt-2 flex gap-2 text-xs">
                    {[50, 100, 250].map((s) => (
                        <button
                            key={s}
                            disabled={isOwner}
                            onClick={() => {
                                const newVal = nextMinBid + s;
                                setAmount(String(newVal));
                                setDisplayAmount(formatWithSeparator(newVal));
                            }}
                            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                        >
                            +{s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bid history */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-md font-semibold mb-3 uppercase flex items-center gap-2">
                    <History className="w-4 h-4" /> {t('Bid_History')}
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1
                [&::-webkit-scrollbar]:w-[5px]
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                    {bids.length === 0 && <p className="text-xs text-gray-500">{t('No_bids_yet')}</p>}
                    {bids.map((b) => (
                        <div
                            key={b.bidID || b.id}
                            className="flex items-center justify-between text-sm bg-gray-50 dark:bg-[#1A1F25] rounded-md px-3 py-2"
                        >
                            <span>{b.bidderName || b.bidder}</span>
                            <div className="flex flex-col items-end">
                                <span>{formatVND(b.bidAmount || b.amount)}</span>
                                {formatPrice(b.bidAmount || b.amount).secondary && (
                                    <span className="text-[10px] text-gray-400">{formatPrice(b.bidAmount || b.amount).secondary}</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(b.bidTime || b.time).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shipping & Payment Info Block */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-md font-semibold mb-3 text-purple-600 uppercase">
                    {t('Shipping_Payment')}
                </h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Shipping')}</span>
                        <span className="font-medium">{product.shipping.Method}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Item_location')}</span>
                        <span className="font-medium">{product.location}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Payment')}</span>
                        <span className="font-medium">{product.shipping.Payment}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Returns')}</span>
                        <span className="font-medium">{product.shipping.Returns}</span>
                    </div>
                </div>
            </div>

            {/* Similar Items */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-md font-semibold mb-3 uppercase text-gray-500 tracking-wider text-xs">
                    {t('Similar_Items')}
                </h2>

                {Array.isArray(product.similar) && product.similar.length > 0 ? (
                    <div className="space-y-3">
                        {product.similar.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => {
                                    if (s.slug) {
                                        // Dùng window.location để ép tải lại trang nếu navigate không ăn
                                        // hoặc dùng navigate nếu đã import hook
                                        window.location.href = `/dashboard/auctions/ongoing/${s.slug}`;
                                    }
                                }}
                                className="flex items-center gap-3 bg-gray-50 dark:bg-[#1A1F25] rounded-md p-2 hover:bg-gray-100 dark:hover:bg-[#222831] cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            >
                                <img src={s.img} alt={s.name} className="w-14 h-10 object-cover rounded" />
                                <div>
                                    <p className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-gray-200">{s.name}</p>
                                    {s.year && <p className="text-xs text-gray-500">{s.year}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 👇 Hiển thị thông báo này nếu không tìm thấy sản phẩm
                    <div className="text-sm text-gray-400 italic py-2 text-center bg-gray-50 dark:bg-[#1A1F25] rounded-md">
                        {t('No_similar_items_found') || "Không có sản phẩm tương tự"}
                    </div>
                )}
            </div>
        </div>
    );
}