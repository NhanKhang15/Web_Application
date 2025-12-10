import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    X,
    Save,
    Loader2,
    AlertTriangle,
    Clock,
    Ban,
    Play,
    CheckCircle,
    DollarSign,
    Type,
    TrendingUp
} from "lucide-react";
import { SellerAuctionApi } from "../lib/SellerAuctionApi";

/**
 * Modal for editing auction details and performing seller actions
 * - Edit: Update title, prices
 * - Early End: End auction now with winner
 * - Cancel: Refund all bidders
 * - Reopen: Reopen closed auction with new dates
 */
export default function EditAuctionModal({ auction, isOpen, onClose, onSuccess }) {
    const { t } = useTranslation();

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        startingPrice: "",
        minStep: "",
        reservePrice: "",
        buyNowPrice: ""
    });

    // Reopen form state
    const [reopenData, setReopenData] = useState({
        startDate: "",
        endDate: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // "earlyEnd" | "cancel" | null

    // Initialize form when auction changes
    useEffect(() => {
        if (auction) {
            setFormData({
                title: auction.title || "",
                startingPrice: auction.startingPrice || "",
                minStep: auction.minStep || "",
                reservePrice: auction.reservePrice || "",
                buyNowPrice: auction.buyNowPrice || ""
            });
            setError(null);
            setSuccess(null);
            setConfirmAction(null);
        }
    }, [auction]);

    if (!isOpen || !auction) return null;

    const status = (auction.status || "").toLowerCase();
    const canEdit = status === "open" || status === "scheduled";
    const canEarlyEnd = status === "open";
    const canCancel = status === "open" || status === "scheduled";
    const canReopen = status === "closed" || status === "cancelled"; // Ended cannot be reopened (has winner)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReopenInputChange = (e) => {
        const { name, value } = e.target;
        setReopenData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            // Client-side validation
            const startPrice = formData.startingPrice ? parseFloat(formData.startingPrice) : 0;
            const reservePrice = formData.reservePrice ? parseFloat(formData.reservePrice) : null;
            const buyNowPrice = formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : null;

            if (reservePrice !== null && reservePrice < startPrice) {
                throw new Error("Giá sàn (Reserve) phải lớn hơn hoặc bằng giá khởi điểm");
            }
            if (buyNowPrice !== null && buyNowPrice <= startPrice) {
                throw new Error("Giá mua ngay phải lớn hơn giá khởi điểm");
            }
            if (buyNowPrice !== null && reservePrice !== null && buyNowPrice < reservePrice) {
                throw new Error("Giá mua ngay phải lớn hơn hoặc bằng giá sàn");
            }

            const updateData = {};
            if (formData.title !== auction.title) updateData.title = formData.title;
            if (formData.startingPrice) updateData.startingPrice = startPrice;
            if (formData.minStep) updateData.minStep = parseFloat(formData.minStep);
            if (formData.reservePrice) updateData.reservePrice = reservePrice;
            if (formData.buyNowPrice) updateData.buyNowPrice = buyNowPrice;

            await SellerAuctionApi.editAuction(auction.auctionId, updateData);
            setSuccess("Đã cập nhật thông tin đấu giá thành công!");
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const handleEarlyEnd = async () => {
        setLoading(true);
        setError(null);

        try {
            await SellerAuctionApi.earlyEndAuction(auction.auctionId);
            setSuccess("Đã kết thúc phiên đấu giá sớm! Người đấu giá cao nhất sẽ thắng.");
            setConfirmAction(null);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi kết thúc sớm");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        setError(null);

        try {
            await SellerAuctionApi.cancelAuction(auction.auctionId);
            setSuccess("Đã hủy phiên đấu giá! Tất cả người đấu giá sẽ được hoàn tiền.");
            setConfirmAction(null);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi hủy đấu giá");
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!reopenData.startDate || !reopenData.endDate) {
                throw new Error("Vui lòng chọn thời gian bắt đầu và kết thúc");
            }

            await SellerAuctionApi.reopenAuction(
                auction.auctionId,
                reopenData.startDate + ":00",
                reopenData.endDate + ":00"
            );
            setSuccess("Đã mở lại phiên đấu giá thành công!");
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi mở lại đấu giá");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN").format(amount || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {t("edit_auction") || "Quản lý đấu giá"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Auction Info */}
                    <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            ID: #{auction.auctionId}
                        </div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {auction.title}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            Giá hiện tại: <span className="text-green-600 font-semibold">{formatCurrency(auction.currentPrice)} ₫</span>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-green-700 dark:text-green-400 text-sm">{success}</span>
                        </div>
                    )}

                    {/* Confirm Dialog */}
                    {confirmAction && (
                        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                                        {confirmAction === "earlyEnd" ? "Xác nhận kết thúc sớm?" : "Xác nhận hủy đấu giá?"}
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        {confirmAction === "earlyEnd"
                                            ? "Người đấu giá cao nhất hiện tại sẽ thắng. Những người khác sẽ được hoàn tiền. Hành động này không thể hoàn tác."
                                            : "Tất cả người đấu giá sẽ được hoàn tiền. Hành động này không thể hoàn tác."
                                        }
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={confirmAction === "earlyEnd" ? handleEarlyEnd : handleCancel}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Xác nhận
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction(null)}
                                            disabled={loading}
                                            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                                        >
                                            Hủy bỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Form */}
                    {canEdit && !confirmAction && (
                        <div className="space-y-4 mb-6">
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Chỉnh sửa thông tin
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Slug sẽ được tạo tự động khi thay đổi tiêu đề</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá khởi điểm (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="startingPrice"
                                        value={formData.startingPrice}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Bước giá (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="minStep"
                                        value={formData.minStep}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá sàn (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="reservePrice"
                                        value={formData.reservePrice}
                                        onChange={handleInputChange}
                                        placeholder="Để trống nếu không có"
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Giá mua ngay (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="buyNowPrice"
                                        value={formData.buyNowPrice}
                                        onChange={handleInputChange}
                                        placeholder="Để trống nếu không có"
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Price validation hints */}
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                                <p>• Giá sàn ≥ Giá khởi điểm</p>
                                <p>• Giá mua ngay {'>'} Giá khởi điểm</p>
                                <p>• Giá mua ngay ≥ Giá sàn (nếu có)</p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-2.5 bg-[#e43137] text-white font-semibold rounded-lg hover:bg-[#c42a30] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu thay đổi
                            </button>
                        </div>
                    )}

                    {/* Reopen Form */}
                    {canReopen && !confirmAction && (
                        <div className="space-y-4 mb-6">
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Mở lại phiên đấu giá
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Phiên đấu giá này đã đóng mà không có người thắng. Bạn có thể mở lại với thời gian mới.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Bắt đầu
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={reopenData.startDate}
                                        onChange={handleReopenInputChange}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Kết thúc
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={reopenData.endDate}
                                        onChange={handleReopenInputChange}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#e43137] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleReopen}
                                disabled={loading}
                                className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Mở lại đấu giá
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!confirmAction && (canEarlyEnd || canCancel) && (
                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Hành động nhanh
                            </h3>

                            {canEarlyEnd && (
                                <button
                                    onClick={() => setConfirmAction("earlyEnd")}
                                    disabled={loading}
                                    className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Kết thúc sớm (có người thắng)
                                </button>
                            )}

                            {canCancel && (
                                <button
                                    onClick={() => setConfirmAction("cancel")}
                                    disabled={loading}
                                    className="w-full py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Ban className="w-4 h-4" />
                                    Hủy đấu giá (hoàn tiền tất cả)
                                </button>
                            )}
                        </div>
                    )}

                    {/* Status message for ended auctions */}
                    {status === "ended" && (
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Phiên đấu giá này đã kết thúc với người thắng.
                            </p>
                        </div>
                    )}

                    {status === "cancelled" && (
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
                            <Ban className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Phiên đấu giá này đã bị hủy.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
