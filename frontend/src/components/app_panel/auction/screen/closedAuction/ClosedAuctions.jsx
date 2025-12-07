import React, { useState, useMemo, useEffect } from "react";
import { CalendarDays, Filter, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";

// Components
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import FilterSheet from "../../wid/FilterSheet.jsx";
import ClosedAuctionTable from "./ClosedAuctionTable.jsx"; // Import bảng Closed

import { fetchClosedAuctionItems } from "../../lib/closedAuctionItems.js";
import { getJSON } from "../../../../../lib/api_url.js";

export default function ClosedAuctions() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("search") || "";

    // State
    const [openFilter, setOpenFilter] = useState(false);
    const [sort, setSort] = useState("created_desc");
    const [page, setPage] = useState(0);
    
    // State for data
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // State for Filter Options
    const [filterOptions, setFilterOptions] = useState({
        locations: [],
        categories: []
    });

    // Draft filters (used by FilterSheet) and applied filters (used for fetch)
    const [draftFilters, setDraftFilters] = useState({
        branches: new Set(), categories: new Set(), types: new Set(), negotiated: null,
        dateFrom: "", dateTo: "", timeFrom: "", timeTo: ""
    });
    const [appliedFilters, setAppliedFilters] = useState(draftFilters);

    // Helper Date
    const { day, monthYear } = useMemo(() => {
        const now = new Date();
        return {
            day: String(now.getDate()).padStart(2, "0"),
            monthYear: now.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()
        };
    }, []);

    // AOS Refresh
    useEffect(() => {
        AOS.refresh();
    }, [openFilter]);

    // Direct to Item detail (use same target as AuctionView.goItem)
    const [modalItem, setModalItem] = useState(null);

    const handleViewResult = async (item) => {
        const slug = item?.slug;

        // If slug exists and is not purely numeric, navigate as usual
        if (slug && !/^\d+$/.test(String(slug))) {
            navigate(`/dashboard/auctions/ongoing/${encodeURIComponent(slug)}`);
            return;
        }

        // Otherwise, try to probe the backend: if backend can resolve the item by id/slug,
        // navigate to the detail route. If probe fails, show the fallback modal we already have.
        const probe = slug || item?.id || item?.auctionId || item?.itemId;
        if (!probe) {
            setModalItem(item);
            return;
        }

        try {
            // Try resolving using existing API. If backend accepts numeric id, this will succeed.
            const detail = await getJSON(`/api/auctions/detail/${encodeURIComponent(probe)}`);
            const targetSlug = detail?.slug || probe;
            navigate(`/dashboard/auctions/ongoing/${encodeURIComponent(targetSlug)}`);
        } catch (err) {
            // Backend couldn't resolve probe (would cause 500 or 404) — show modal instead.
            setModalItem(item);
        }
    };

    // Fetch Filter Options
    useEffect(() => {
        getJSON("/api/auctions/filters")
            .then(res => {
                if (res) {
                    setFilterOptions({
                        locations: res.locations || [], 
                        categories: res.categories || [] 
                    });
                }
            })
            .catch(err => console.error("Failed to load filter options", err));
    }, []);

    // Map Data Function
    const mapDataToUI = (apiItem) => ({
        id: apiItem.auctionId || apiItem.itemId,
        title: apiItem.title || "Untitled",
        slug: apiItem.slug || apiItem.itemId,
        finalPrice: apiItem.currentPrice || apiItem.startingPrice || 0,
        endsAt: apiItem.endDate,
        isSold: apiItem.status === 'SOLD' || !!apiItem.winnerId, 
        winner: apiItem.winnerName || (apiItem.winnerId ? `User #${apiItem.winnerId}` : null),
        location: apiItem.location || "Unknown",
        category: apiItem.categoryName
    });

    // Fetch Real Data via API
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const apiFilters = {
            categories: appliedFilters.categories,
            branches: appliedFilters.branches,
            dateFrom: appliedFilters.dateFrom,
            dateTo: appliedFilters.dateTo,
            negotiated: appliedFilters.negotiated,
            keyword: keyword 
        };

        fetchClosedAuctionItems({ 
            page, 
            size: 10, 
            sort, 
            filters: apiFilters 
        })
        .then((res) => {
            if (isMounted) {
                const rawContent = res.content || [];
                setAuctions(rawContent.map(mapDataToUI));
                setTotalPages(res.totalPages || 1);
                setTotalElements(res.totalElements || 0);
                setLoading(false);
            }
        })
        .catch((err) => {
            console.error("Error fetching closed auctions:", err);
            if (isMounted) setLoading(false);
        });

        return () => { isMounted = false; };
    }, [page, sort, appliedFilters, keyword]);

    const pageData = { number: page, totalPages, totalElements };

    // Apply / Reset filter handlers (sync URL like AuctionView)
    const handleApplyFilter = () => {
        // Commit draft -> applied
        setAppliedFilters(draftFilters);
        setPage(0);

        // Sync some params to URL for back/refresh behavior
        const params = {};
        if (keyword) params.search = keyword;
        if (draftFilters.categories && draftFilters.categories.size > 0) params.category = Array.from(draftFilters.categories).join(',');
        if (draftFilters.branches && draftFilters.branches.size > 0) params.branch = Array.from(draftFilters.branches).join(',');
        params.sort = sort;
        params.page = 0;
        setSearchParams(params);
    };

    const handleResetFilter = () => {
        const resetState = {
            branches: new Set(), categories: new Set(), types: new Set(), negotiated: null,
            dateFrom: "", dateTo: "", timeFrom: "", timeTo: ""
        };
        setDraftFilters(resetState);
        setAppliedFilters(resetState);
        setPage(0);

        const params = {};
        if (keyword) params.search = keyword;
        setSearchParams(params);
    };

    // --- RENDER ---
    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">
            
            {/* 1. FILTER SHEET */}
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={draftFilters}
                setFilters={setDraftFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => { handleApplyFilter(); setOpenFilter(false); }}
                onReset={() => { handleResetFilter(); setOpenFilter(false); }}
                locationOptions={filterOptions.locations}
                categoryOptions={filterOptions.categories}
            />

            {/* 2. MAIN CONTENT */}
            <div className={`flex flex-col w-full transition-[padding] duration-300 ease-out ${openFilter ? "pt-[35vh]" : "pt-0"}`}>
                
                <div className="p-6 flex flex-col gap-4">
                    {/* HEADER ROW */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-md bg-[#ECEFF1] dark:bg-[#1A1F25] px-2 py-1 shadow-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-[#96A0AE] dark:text-gray-400" />
                                <span className="text-[12px] font-semibold tracking-wide text-[#212121] dark:text-gray-200">{day} {monthYear}</span>
                            </div>
                        </div>
                        <button onClick={() => setOpenFilter(!openFilter)} className={`inline-flex items-center gap-2 text-[12px] font-medium rounded-md px-3 py-1.5 transition-colors ${openFilter ? "bg-black text-white dark:bg-white dark:text-black" : "text-[#9AA3B2] dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1E242A]"}`}>
                            <Filter className="w-4 h-4" /> {t('Filter') || "Filter"}
                        </button>
                    </div>

                    {/* TOOLBAR TRÊN */}
                    <div className="bg-white dark:bg-neutral-900 rounded-t-xl shadow-sm pt-2 border-b border-neutral-100 dark:border-neutral-800">
                        <AuctionToolbar sort={sort} setSort={setSort} pageData={pageData} setPage={setPage} loading={false} hideSort={false} />
                    </div>

                    {/* TABLE (Dùng bảng Closed) */}
                    <div className="bg-white dark:bg-neutral-900 shadow-sm border-x border-neutral-200 dark:border-neutral-800 overflow-hidden min-h-[300px]">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading closed auctions...</div>
                        ) : auctions.length > 0 ? (
                             <ClosedAuctionTable data={auctions} onViewResult={handleViewResult} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">No closed auctions found.</div>
                        )}
                    </div>

                    {/* TOOLBAR DƯỚI */}
                    <div className="bg-white dark:bg-neutral-900 rounded-b-xl shadow-sm pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <AuctionToolbar sort={sort} setSort={setSort} pageData={pageData} setPage={setPage} loading={false} hideSort={true} />
                    </div>

                </div>
            </div>

            {/* Fallback modal when slug is unavailable (frontend-only) */}
            {modalItem && (
                <div className="fixed inset-0 z-70 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModalItem(null)} />
                    <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-lg w-full p-6 z-80">
                        <h3 className="text-lg font-semibold mb-2">{modalItem.title || t('view_result')}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{t('ended_on')} {new Date(modalItem.endsAt).toLocaleString()}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-xs text-neutral-500">{t('th_final_price')}</div>
                                <div className="font-semibold">{modalItem.finalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(modalItem.finalPrice) : '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-neutral-500">{t('th_winner')}</div>
                                <div className="font-semibold">{modalItem.winner || '—'}</div>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">{t('no_slug_detail_message') || 'Detail page unavailable for this item (missing slug). You can contact the admin or view limited info here).'}</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setModalItem(null)} className="px-4 py-2 rounded-md border">{t('Close') || 'Close'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}