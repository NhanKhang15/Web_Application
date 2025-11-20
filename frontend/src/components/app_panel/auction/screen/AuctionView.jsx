// File: AuctionView.jsx (Component cha - ĐÃ ĐƯỢC TỐI ƯU HOÀN TOÀN)
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CalendarDays,
    Filter,
    ArrowLeft,
} from "lucide-react";
import FilterSheet from "../wid/FilterSheet.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import AuctionDetail from "./AuctionDetail.jsx";
import { fetchAuctionItems } from "../lib/auctionItems";

// --- IMPORT CÁC COMPONENT CON MỚI ---
import DashboardStats from "../wid/componentView/DashboardStats.jsx";
import AuctionToolbar from "../wid/componentView/AuctionToolbar.jsx";
import AuctionGrid from "../wid/componentView/AuctionGrid.jsx";
import { useTranslation } from "react-i18next";
// ------------------------------------

export default function AuctionView() {
    const { t } = useTranslation();

    const [openFilter, setOpenFilter] = useState(false);
    const [filters, setFilters] = useState({
        branches: new Set(),
        dateFrom: "",
        dateTo: "",
        timeFrom: "",
        timeTo: "",
        negotiated: null,
        types: new Set(),
    });
    const [sort, setSort] = useState("created_desc");
    const navigate = useNavigate();
    const { slug } = useParams();

    // --- State quản lý dữ liệu ---
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(16);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // AOS init
    useEffect(() => {
        AOS.init({
            duration: 550,
            easing: "ease-out",
            once: false,
            offset: 20,
        });
    }, []);

    const { day, monthYear } = useMemo(() => {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, "0");
        const my = now
            .toLocaleString("en-US", { month: "long", year: "numeric" })
            .toUpperCase();
        return { day: d, monthYear: my };
    }, []);

    // Map sort UI -> API sort string
    const apiSort = useMemo(() => {
        switch (sort) {
            case "created_asc":
                return "createdAt,asc";
            case "created_desc":
            default:
                return "createdAt,desc";
        }
    }, [sort]);

    // Fetch data
    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoading(true);
            setError("");
            try {
                const res = await fetchAuctionItems({ page, size, sort: apiSort });
                if (!cancelled) setData(res);
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load items");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => {
            cancelled = true;
        };
    }, [page, size, apiSort]);

    // Lọc client (nếu có)
    const list = useMemo(() => {
        const content = data?.content || [];
        if (!filters.branches || filters.branches.size === 0) return content;
        return content.filter((x) => x.location && filters.branches.has(x.location));
    }, [data, filters]);

    // Refresh AOS khi filter hoặc list thay đổi
    useEffect(() => {
        const id = setTimeout(() => AOS.refresh(), 100);
        return () => clearTimeout(id);
    }, [openFilter, list]);

    const resetFilters = () =>
        setFilters({
            branches: new Set(),
            dateFrom: "",
            dateTo: "",
            timeFrom: "",
            timeTo: "",
            negotiated: null,
            types: new Set(),
        });

    // Hàm điều hướng
    const goItem = (it) => {
        const slug = it?.slug || it?.Slug;
        // Default category to "auctions" if missing, or use item's category if available
        const category = it?.categoryName || "auctions";
        if (!slug) return;
        navigate(`/dashboard/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);
    };

    // --- RENDER ---

    // 1. Nếu có slug, hiển thị trang Chi tiết (Detail)
    if (slug) {
        return (
            <div className="p-6">
                <button
                    onClick={() => navigate(`/dashboard/auctions`)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('Back_to_Auctions')}
                </button>
                <AuctionDetail />
            </div>
        );
    }

    // 2. Nếu không có slug, hiển thị trang Danh sách (View)
    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl">
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => { }}
                onReset={resetFilters}
            />

            <div className={`flex flex-col h-full transition-[padding] duration-300 ease-out ${openFilter ? "pt-[28vh]" : "pt-0"}`}>                {/* Header (Date + Filter button) */}
                <div
                    className="flex flex-wrap items-center justify-between gap-4 mb-4 px-6 pt-6 flex-shrink-0"
                    data-aos="fade-down"
                >
                    <div className="flex items-center gap-32 justify-between">
                        <div
                            className="flex items-center rounded-md bg-[#ECEFF1] dark:bg-[#1A1F25] px-2 py-1 shadow-sm"
                            data-aos="zoom-in"
                        >
                            <CalendarDays className="w-4 h-4 mr-2 text-[#96A0AE] dark:text-gray-400" />
                            <div className="flex items-center">
                                <div className="bg-white dark:bg-[#0F141A] border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-[12px] font-semibold mr-2">
                                    {day}
                                </div>
                                <span className="text-[12px] font-semibold tracking-wide text-[#212121] dark:text-gray-200">
                                    {monthYear}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpenFilter(true)}
                        className="inline-flex items-center gap-2 text-[12px] font-medium text-[#9AA3B2] dark:text-gray-400 rounded-md px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-[#1E242A]"
                        data-aos="fade-left"
                    >
                        <Filter className="w-4 h-4" />
                        {t('Filter')}
                    </button>
                </div>

                {/* --- COMPONENT CON THỨ 1 --- */}
                <DashboardStats />

                {/* --- COMPONENT CON THỨ 2 --- */}
                <AuctionToolbar
                    sort={sort}
                    setSort={setSort}
                    pageData={data}
                    setPage={setPage}
                    loading={loading}
                />

                {/* --- COMPONENT CON THỨ 3 --- */}
                <AuctionGrid
                    list={list}
                    goItem={goItem}
                    loading={loading}
                    error={error}
                />

                {/* --- MỚI: Toolbar dưới --- */}
                {/* Toolbar này sẽ nằm cố định ở đáy màn hình (dưới Grid) */}
                <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 pt-2 bg-gray-50 dark:bg-[#0B0F13]">
                    <AuctionToolbar
                        sort={sort}
                        setSort={setSort} // Vẫn cần truyền dù bị ẩn để tránh lỗi props
                        pageData={data}
                        setPage={setPage}
                        loading={loading}
                        hideSort={true} // Ẩn nút sort đi
                    />
                </div>
            </div>
        </div>
    );
}