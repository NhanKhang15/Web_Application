// File: AuctionView.jsx (Component cha - ĐÃ ĐƯỢC TỐI ƯU HOÀN TOÀN)
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CalendarDays,
    Filter,
    ArrowLeft,
    Construction,
} from "lucide-react";
import FilterSheet from "../../wid/FilterSheet.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import AuctionDetail from "./AuctionDetail.jsx";
import { fetchAuctionItems } from "../../lib/auctionItems.js";
import {auctionMenu} from "../../../slidebar/lib/auctionMenu.js";

// --- IMPORT CÁC COMPONENT CON MỚI ---
import DashboardStats from "../../wid/componentView/DashboardStats.jsx";
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import AuctionGrid from "../../wid/componentView/AuctionGrid.jsx";
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
        categories: new Set(),
    });
    const [sort, setSort] = useState("created_desc");
    const navigate = useNavigate();
    const { slug, itemSlug } = useParams();

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
        if ((!slug || slug === 'main') && !itemSlug) {
            let cancelled = false;

            async function run() {
                setLoading(true);
                setError("");
                try {
                    const res = await fetchAuctionItems({page, size, sort: apiSort});
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
        }
    }, [page, size, apiSort, slug, itemSlug]);

    // Lọc client (nếu có)
    const list = useMemo(() => {
        let content = data?.content || [];
        // 1. Lọc theo Branch (Location)
        if (filters.branches && filters.branches.size > 0) {
            content = content.filter((x) => x.location && filters.branches.has(x.location));
        }

        // 2. Lọc theo Category (MỚI THÊM)
        // Lưu ý: Cần đảm bảo API trả về trường categoryName hoặc bạn map categoryId tương ứng
        if (filters.categories && filters.categories.size > 0) {
            content = content.filter((x) => {
                // Kiểm tra xem item có categoryName không, nếu không thì thử check categoryId hoặc logic tương ứng
                // Giả sử x.categoryName trả về chuỗi giống trong FilterSheet (VD: "Electronics")
                return x.categoryName && filters.categories.has(x.categoryName);
            });
        }

        // 3. Lọc theo Type (MỚI THÊM)
        if (filters.types && filters.types.size > 0) {
            // Giả sử API trả về trường 'type' hoặc 'auctionType'
            // content = content.filter(x => x.type && filters.types.has(x.type));
        }

        return content;
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
        const pSlug = it?.slug || it?.Slug;
        if (!pSlug) return;
        // Navigate đến: /dashboard/auctions/main/ten-san-pham
        navigate(`/dashboard/auctions/main/${encodeURIComponent(pSlug)}`);
    };

    // --- RENDER ---

    // 1. CASE CHI TIẾT SẢN PHẨM: Có tham số 'itemSlug'
    if (itemSlug) {
        return (
            <div className="p-6">
                <button
                    // Quay lại trang lưới (main)
                    onClick={() => navigate(`/dashboard/auctions/main`)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('Back_to_Auctions')}
                </button>
                {/* AuctionDetail sẽ tự dùng useParams() để lấy itemSlug (hoặc slug trong code cũ của nó) */}
                <AuctionDetail />
            </div>
        );
    }

    // 2. CASE MENU KHÁC (Ongoing, History...) - Placeholder
    if (slug && slug !== 'main') {
        const currentMenu = auctionMenu.find(item => item.path === slug);
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-10 animate-in fade-in zoom-in duration-300 bg-gray-50 dark:bg-[#0B0F13] rounded-xl">
                <div className="bg-neutral-200 dark:bg-neutral-800 p-6 rounded-full mb-4">
                    <Construction className="w-12 h-12 text-neutral-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-300 mb-2">
                    {currentMenu?.label || slug}
                </h2>
                <p className="text-sm text-neutral-500">
                    Tính năng đang được phát triển.
                </p>
                <button
                    onClick={() => navigate('/dashboard/auctions/main')}
                    className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
                >
                    Về Dashboard
                </button>
            </div>
        );
    }

    // 3. CASE DASHBOARD CHÍNH (Main Grid)
    // (slug = 'main' hoặc không có slug, và không có itemSlug)
    return (
        <div className="w-full min-h-full flex flex-col relative overflow-x-hidden bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => { }}
                onReset={() => setFilters({ branches: new Set(), dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", negotiated: null, types: new Set() })}
            />

            <div className={`flex flex-col w-full transition-[padding] duration-300 ease-out ${openFilter ? "pt-[28vh]" : "pt-0"}`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 px-6 pt-6 flex-shrink-0" data-aos="fade-down">
                    <div className="flex items-center gap-32 justify-between">
                        <div className="flex items-center rounded-md bg-[#ECEFF1] dark:bg-[#1A1F25] px-2 py-1 shadow-sm" data-aos="zoom-in">
                            <CalendarDays className="w-4 h-4 mr-2 text-[#96A0AE] dark:text-gray-400" />
                            <div className="flex items-center">
                                <div className="bg-white dark:bg-[#0F141A] border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-[12px] font-semibold mr-2">
                                    {day}
                                </div>
                                <span className="text-[12px] font-semibold tracking-wide text-[#212121] dark:text-gray-200">{monthYear}</span>
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

                <DashboardStats />

                <AuctionToolbar
                    sort={sort}
                    setSort={setSort}
                    pageData={data}
                    setPage={setPage}
                    loading={loading}
                />

                <AuctionGrid
                    list={list}
                    goItem={goItem}
                    loading={loading}
                    error={error}
                />

                <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 pt-2 bg-gray-50 dark:bg-[#0B0F13]">
                    <AuctionToolbar
                        sort={sort}
                        setSort={setSort}
                        pageData={data}
                        setPage={setPage}
                        loading={loading}
                        hideSort={true}
                    />
                </div>
            </div>
        </div>
    );
}