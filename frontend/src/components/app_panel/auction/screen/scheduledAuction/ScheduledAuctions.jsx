import React, { useState, useMemo, useEffect } from "react";
import { CalendarDays, Filter, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";

// Components
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import FilterSheet from "../../wid/FilterSheet.jsx";
import ScheduledAuctionTable from "./ScheduledAuctionTable.jsx"; // Bảng dữ liệu
import { fetchScheduledAuctionItems } from "../../lib/scheduledAuctionItems.js"; // API

export default function ScheduledAuctions() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // --- 1. CONFIG & STATE ---
    const [openFilter, setOpenFilter] = useState(false); // Mặc định ĐÓNG (false)
    const [sort, setSort] = useState("created_desc");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    // State bộ lọc (nháp và chính thức)
    const [filters, setFilters] = useState({
        branches: new Set(), categories: new Set(), types: new Set(), negotiated: null,
        dateFrom: "", dateTo: "", timeFrom: "", timeTo: ""
    });

    // Helper ngày tháng
    const { day, monthYear } = useMemo(() => {
        const now = new Date();
        return {
            day: String(now.getDate()).padStart(2, "0"),
            monthYear: now.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()
        };
    }, []);

    // AOS Animation
    useEffect(() => {
        AOS.refresh();
    }, [openFilter]); // Refresh khi mở/đóng filter

    // --- 2. API CALL (Lấy dữ liệu thật) ---
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const keyword = searchParams.get("search") || "";

        // Kiểm tra xem có active filter không
        const hasActiveFilters =
            (filters.categories && filters.categories.size > 0) ||
            (filters.branches && filters.branches.size > 0) ||
            filters.dateFrom ||
            filters.dateTo;

        // Nếu có filter -> fetch trang lớn (100) rồi filter client-side
        // Nếu không -> fetch normal pagination
        const fetchSize = hasActiveFilters ? 100 : 10;
        const fetchPage = hasActiveFilters ? 0 : page;

        fetchScheduledAuctionItems({
            page: fetchPage,
            size: fetchSize,
            sort,
            filters: { ...filters, keyword }
        })
            .then((res) => {
                if (isMounted) {
                    // Nếu có filter, lọc client-side
                    if (hasActiveFilters) {
                        let filtered = res.content || [];

                        // Filter by Category
                        if (filters.categories && filters.categories.size > 0) {
                            const catArray = Array.from(filters.categories).map(c => c.toLowerCase());
                            filtered = filtered.filter(item =>
                                item.categoryName && catArray.includes(item.categoryName.toLowerCase())
                            );
                        }

                        // Filter by Location
                        if (filters.branches && filters.branches.size > 0) {
                            const locArray = Array.from(filters.branches).map(l => l.toLowerCase());
                            filtered = filtered.filter(item =>
                                item.location && locArray.includes(item.location.toLowerCase())
                            );
                        }

                        // Filter by Date Range
                        if (filters.dateFrom || filters.dateTo) {
                            filtered = filtered.filter(item => {
                                if (!item.startDate) return false;
                                const itemDate = new Date(item.startDate);
                                if (filters.dateFrom) {
                                    const fromDate = new Date(filters.dateFrom);
                                    if (itemDate < fromDate) return false;
                                }
                                if (filters.dateTo) {
                                    const toDate = new Date(filters.dateTo);
                                    toDate.setHours(23, 59, 59, 999);
                                    if (itemDate > toDate) return false;
                                }
                                return true;
                            });
                        }

                        setData({
                            content: filtered,
                            number: 0,
                            totalPages: 1,
                            totalElements: filtered.length
                        });
                    } else {
                        setData(res);
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("❌ Error fetching scheduled auctions:", err);
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [page, sort, filters, searchParams]);

    // Map dữ liệu API -> UI Table
    const tableData = useMemo(() => {
        return (data?.content || []).map(item => ({
            id: item.auctionId || item.itemId,
            title: item.title,
            increment: item.minStep,
            trader: item.sellerName,
            base: item.currentPrice || item.startingPrice,
            startsAt: item.startDate, // Lấy startDate để tính thời gian bắt đầu
            statusColor: "bg-blue-500"
        }));
    }, [data]);

    const pageData = data ? { number: data.number, totalPages: data.totalPages, totalElements: data.totalElements } : null;


    // --- 3. RENDER GIAO DIỆN ---
    return (
        <div className="w-full h-full flex flex-col overflow-x-hidden overflow-y-auto relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">

            {/* --- FILTER SHEET (Ẩn/Hiện theo state openFilter) --- */}
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => {
                    setOpenFilter(false);
                    setPage(0); // Reset pagination khi apply filter
                }}
                onReset={() => {
                    setFilters({
                        branches: new Set(),
                        categories: new Set(),
                        types: new Set(),
                        negotiated: null,
                        dateFrom: "",
                        dateTo: "",
                        timeFrom: "",
                        timeTo: ""
                    });
                    setPage(0); // Reset pagination khi reset filter
                }}
            />

            {/* --- NỘI DUNG CHÍNH (Trượt xuống khi Filter mở) --- */}
            <div className={`flex flex-col w-full overflow-x-hidden transition-[padding] duration-300 ease-out ${openFilter ? "pt-[35vh]" : "pt-0"}`}>

                <div className="p-3 md:p-6 flex flex-col gap-4">

                    {/* --- HEADER ROW: Back + Date + Filter Button --- */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-4">
                            {/* Ngày tháng */}
                            <div className="flex items-center rounded-md bg-[#ECEFF1] dark:bg-[#1A1F25] px-2 py-1 shadow-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-[#96A0AE] dark:text-gray-400" />
                                <span className="text-[12px] font-semibold tracking-wide text-[#212121] dark:text-gray-200">
                                    {day} {monthYear}
                                </span>
                            </div>
                        </div>

                        {/* Nút Filter (Toggle) */}
                        <button
                            type="button"
                            onClick={() => setOpenFilter(!openFilter)}
                            className={`inline-flex items-center gap-2 text-[12px] font-medium rounded-md px-3 py-1.5 transition-colors
                                ${openFilter
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "text-[#9AA3B2] dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1E242A]"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {t('Filter') || "Filter"}
                        </button>
                    </div>

                    {/* --- TOOLBAR TRÊN (Sort) --- */}
                    <div className="bg-white dark:bg-neutral-900 rounded-t-xl shadow-sm pt-2 border-b border-neutral-100 dark:border-neutral-800">
                        <AuctionToolbar
                            sort={sort}
                            setSort={setSort}
                            pageData={pageData}
                            setPage={setPage}
                            loading={loading}
                            hideSort={false} // Hiện Sort
                        // onOpenFilter không cần vì nút Filter đã ở Header
                        />
                    </div>

                    {/* --- TABLE DATA --- */}
                    <div className="bg-white dark:bg-neutral-900 shadow-sm border-x border-neutral-200 dark:border-neutral-800 overflow-hidden min-h-[300px]">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
                        ) : (
                            <ScheduledAuctionTable data={tableData} />
                        )}
                    </div>

                    {/* --- TOOLBAR DƯỚI (Pagination) --- */}
                    <div className="bg-white dark:bg-neutral-900 rounded-b-xl shadow-sm pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <AuctionToolbar
                            sort={sort}
                            setSort={setSort}
                            pageData={pageData}
                            setPage={setPage}
                            loading={loading}
                            hideSort={true} // Chỉ hiện Pagination
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}