import React, { useState, useMemo, useEffect } from "react";
import { CalendarDays, Filter, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";

// Components
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import FilterSheet from "../../wid/FilterSheet.jsx";
import OngoingAuctionTable from "./OngoingAuctionTable.jsx"; // Bảng dữ liệu
import { fetchAuctionItems } from "../../lib/auctionItems.js"; // API

export default function OngoingAuctions() {
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

        // Logic gọi API y hệt Dashboard
        fetchAuctionItems({ 
            page, size: 10, sort, 
            filters: { ...filters, keyword } // Gửi kèm keyword nếu có search
        })
        .then((res) => {
            if (isMounted) {
                setData(res);
                setLoading(false);
            }
        })
        .catch(() => { if (isMounted) setLoading(false); });

        return () => { isMounted = false; };
    }, [page, sort, filters, searchParams]);

    // Map dữ liệu API -> UI Table
    const tableData = useMemo(() => {
        return (data?.content || []).map(item => ({
            id: item.auctionId || item.itemId,
            title: item.title,
            increment: item.minStep,
            trader: item.sellerName,
            basePrice: item.currentPrice || item.startingPrice,
            endsAt: item.endDate,
            statusColor: "bg-blue-500"
        }));
    }, [data]);

    const pageData = data ? { number: data.number, totalPages: data.totalPages, totalElements: data.totalElements } : null;


    // --- 3. RENDER GIAO DIỆN ---
    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">
            
            {/* --- FILTER SHEET (Ẩn/Hiện theo state openFilter) --- */}
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => setOpenFilter(false)} // Đóng khi apply
                onReset={() => setFilters({ ...filters, branches: new Set() })}
            />

            {/* --- NỘI DUNG CHÍNH (Trượt xuống khi Filter mở) --- */}
            <div className={`flex flex-col w-full transition-[padding] duration-300 ease-out ${openFilter ? "pt-[35vh]" : "pt-0"}`}>
                
                <div className="p-6 flex flex-col gap-4">
                    
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
                            <OngoingAuctionTable data={tableData} />
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