import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getJSON } from "../../../../lib/api_url";
import { useUserProfile } from "../../user_infor/lib/useUserProfile";
import { PostAuctionApi } from "../lib/PostAuctionApi";
import EditAuctionModal from "./EditAuctionModal";
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    DollarSign,
    Eye,
    Edit3,
    Trash2,
    Loader2,
    AlertCircle,
    TrendingUp
} from "lucide-react";

const FALLBACK_IMAGE = "https://via.placeholder.com/100x100?text=No+Image";

export default function ManageAuction() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile } = useUserProfile();

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all"); // all, active, scheduled, ended

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);

    // Fetch seller's auctions on mount
    useEffect(() => {
        fetchMyAuctions();
    }, []);

    const fetchMyAuctions = async () => {
        setLoading(true);
        setError(null);

        try {
            // Call the new backend API that returns only the authenticated user's auctions
            const data = await getJSON(`/api/seller/my-auctions/all`);
            setAuctions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch auctions:", err);
            // Check if it's an authentication error
            if (err.message?.includes("401") || err.message?.includes("đăng nhập")) {
                setError("Vui lòng đăng nhập để xem danh sách đấu giá của bạn.");
            } else {
                setError(err.message || "Failed to load your auctions");
            }
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter auctions by tab
    const filteredAuctions = auctions.filter(auction => {
        if (activeTab === "all") return true;
        const status = (auction.status || "").toLowerCase();
        if (activeTab === "active") return status === "open";
        if (activeTab === "scheduled") return status === "scheduled";
        if (activeTab === "ended") return status === "ended" || status === "closed";
        return true;
    });

    // Get status badge
    const getStatusBadge = (status) => {
        const statusLower = (status || "").toLowerCase();
        switch (statusLower) {
            case "open":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        {t("status_active") || "Active"}
                    </span>
                );
            case "scheduled":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="w-3 h-3" />
                        {t("status_scheduled") || "Scheduled"}
                    </span>
                );
            case "ended":
            case "closed":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("status_ended") || "Ended"}
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3" />
                        {t("status_cancelled") || "Cancelled"}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {status || "Unknown"}
                    </span>
                );
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Get thumbnail URL - memoized to prevent re-renders
    const getThumbnail = useCallback((auction) => {
        const rawImg = auction.thumbnail || auction.imgUrl;
        if (rawImg && rawImg !== "placeholder.jpg") {
            return PostAuctionApi.getFullImageUrl(rawImg);
        }
        return FALLBACK_IMAGE;
    }, []);

    // Image error handler - prevents infinite loop
    const handleImageError = useCallback((e) => {
        if (e.target.src !== FALLBACK_IMAGE) {
            e.target.src = FALLBACK_IMAGE;
        }
    }, []);

    // View auction detail
    const handleView = (auction) => {
        const slug = auction.slug || auction.itemSlug;
        if (slug) {
            navigate(`/dashboard/auctions/ongoing/${encodeURIComponent(slug)}`);
        }
    };

    // Open edit modal
    const handleEdit = (auction) => {
        setSelectedAuction(auction);
        setEditModalOpen(true);
    };

    // Close edit modal and refresh
    const handleEditSuccess = () => {
        fetchMyAuctions();
    };

    const tabs = [
        { key: "all", label: t("tab_all") || "All", icon: Package },
        { key: "active", label: t("tab_active") || "Active", icon: TrendingUp },
        { key: "scheduled", label: t("tab_scheduled") || "Scheduled", icon: Clock },
        { key: "ended", label: t("tab_ended") || "Ended", icon: CheckCircle2 },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-3 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {t("manage_auction_title") || "Manage Your Auctions"}
                </h1>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mt-1 md:mt-2">
                    {t("manage_auction_desc") || "View and manage all your posted auctions"}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                                transition-all duration-200
                                ${isActive
                                    ? "bg-[#e43137] text-white shadow-lg shadow-[#e43137]/20"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e43137]" />
                    <span className="ml-3 text-neutral-500">{t("loading") || "Loading..."}</span>
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-medium">{error}</p>
                    <button
                        onClick={fetchMyAuctions}
                        className="mt-4 px-4 py-2 bg-[#e43137] text-white rounded-lg hover:bg-[#c42a30] transition-colors"
                    >
                        {t("try_again") || "Try Again"}
                    </button>
                </div>
            ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    <Package className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t("no_auctions_found") || "No auctions found"}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                        {activeTab === "all"
                            ? (t("no_auctions_desc") || "You haven't posted any auctions yet.")
                            : (t("no_auctions_filter") || "No auctions match this filter.")}
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/seller/post")}
                        className="px-6 py-3 bg-[#e43137] text-white font-semibold rounded-lg hover:bg-[#c42a30] transition-colors"
                    >
                        {t("post_first_auction") || "Post Your First Auction"}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAuctions.map((auction, index) => (
                        <div
                            key={auction.auctionId || auction.itemId || index}
                            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Thumbnail */}
                                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 m-4 rounded-lg overflow-hidden">
                                    <img
                                        src={getThumbnail(auction)}
                                        alt={auction.title}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusBadge(auction.status)}
                                                <span className="text-xs text-neutral-500">
                                                    ID: #{auction.auctionId || auction.itemId || "-"}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-1">
                                                {auction.title || t("untitled") || "Untitled"}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-2 md:gap-4 text-sm">
                                                <div>
                                                    <span className="text-neutral-500 dark:text-neutral-400 block">
                                                        {t("starting_price") || "Starting"}
                                                    </span>
                                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {formatCurrency(auction.startingPrice)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500 dark:text-neutral-400 block">
                                                        {t("current_bid") || "Current"}
                                                    </span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        {formatCurrency(auction.currentPrice)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500 dark:text-neutral-400 block">
                                                        {t("start_date") || "Start"}
                                                    </span>
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                        {formatDate(auction.startDate)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500 dark:text-neutral-400 block">
                                                        {t("end_date") || "End"}
                                                    </span>
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                        {formatDate(auction.endDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex md:flex-col gap-2">
                                            <button
                                                onClick={() => handleView(auction)}
                                                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden md:inline">{t("view") || "View"}</span>
                                            </button>
                                            <button
                                                onClick={() => handleEdit(auction)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                title={t("edit") || "Edit"}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span className="hidden md:inline">{t("edit") || "Edit"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Stats */}
            {!loading && auctions.length > 0 && (
                <div className="mt-6 md:mt-8 grid grid-cols-2 gap-2 md:gap-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {auctions.length}
                        </div>
                        <div className="text-sm text-neutral-500">{t("total_auctions") || "Total Auctions"}</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-green-600">
                            {auctions.filter(a => (a.status || "").toLowerCase() === "open").length}
                        </div>
                        <div className="text-sm text-neutral-500">{t("active_auctions") || "Active"}</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-blue-600">
                            {auctions.filter(a => (a.status || "").toLowerCase() === "scheduled").length}
                        </div>
                        <div className="text-sm text-neutral-500">{t("scheduled_auctions") || "Scheduled"}</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-neutral-600">
                            {auctions.filter(a => ["ended", "closed"].includes((a.status || "").toLowerCase())).length}
                        </div>
                        <div className="text-sm text-neutral-500">{t("ended_auctions") || "Ended"}</div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <EditAuctionModal
                auction={selectedAuction}
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedAuction(null);
                }}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
