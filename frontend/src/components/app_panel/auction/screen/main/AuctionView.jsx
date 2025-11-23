import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

import DashboardStats from "../../wid/componentView/DashboardStats.jsx";
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import AuctionGrid from "../../wid/componentView/AuctionGrid.jsx";
import { useTranslation } from "react-i18next";
import { getJSON } from "../../../../../lib/api_url.js";

export default function AuctionView() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { slug, itemSlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. ĐỌC DỮ LIỆU TỪ URL (Để giữ trạng thái khi F5)
    const keyword = searchParams.get("search") || "";
    const pageParam = parseInt(searchParams.get("page") || "0");
    const sortParam = searchParams.get("sort") || "created_desc";

    const urlCategories = useMemo(() =>
            searchParams.get("category") ? new Set(searchParams.get("category").split(',')) : new Set()
        , [searchParams]);

    const urlBranches = useMemo(() =>
            searchParams.get("branch") ? new Set(searchParams.get("branch").split(',')) : new Set()
        , [searchParams]);

    // 2. STATES
    const [openFilter, setOpenFilter] = useState(false);

    // State chứa dữ liệu bộ lọc từ API (Location, Category...)
    const [filterOptions, setFilterOptions] = useState({ locations: [], categories: [] });

    // State lọc tạm thời (cho FilterSheet)
    const [filters, setFilters] = useState({
        branches: urlBranches,
        categories: urlCategories,
        dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", negotiated: null, types: new Set(),
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Đồng bộ URL vào filters khi URL thay đổi (ví dụ người dùng bấm nút Back)
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            branches: urlBranches,
            categories: urlCategories
        }));
    }, [urlBranches, urlCategories]);

    // AOS init
    useEffect(() => {
        AOS.init({ duration: 550, easing: "ease-out", once: false, offset: 20 });
    }, []);

    // 3. FETCH FILTER OPTIONS (Gọi API 1 lần khi mount)
    useEffect(() => {
        getJSON("/api/auctions/filters")
            .then(res => {
                if(res) setFilterOptions({ locations: res.locations || [], categories: res.categories || [] });
            })
            .catch(console.error);
    }, []);

    // Helper ngày tháng
    const { day, monthYear } = useMemo(() => {
        const now = new Date();
        return {
            day: String(now.getDate()).padStart(2, "0"),
            monthYear: now.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()
        };
    }, []);

    // Map sort UI -> API sort string
    const apiSort = useMemo(() => {
        switch (sortParam) {
            case "created_asc": return "createdAt,asc";
            case "price_asc": return "currentPrice,asc";
            case "price_desc": return "currentPrice,desc";
            case "created_desc": default: return "createdAt,desc";
        }
    }, [sortParam]);

    const combineDateTime = (dateStr, timeStr, isEndOfDay = false) => {
        if (!dateStr) return null; // Nếu không chọn ngày thì thôi
        // Nếu không chọn giờ:
        // - Ngày bắt đầu (from) mặc định 00:00:00
        // - Ngày kết thúc (to) mặc định 23:59:59
        const time = timeStr ? timeStr : (isEndOfDay ? "23:59:59" : "00:00:00");

        // Định dạng gửi lên Server: YYYY-MM-DD HH:mm:ss (Hoặc ISO T)
        // Code input date trả về YYYY-MM-DD
        return `${dateStr} ${time.length === 5 ? time + ":00" : time}`;
    };

    // 4. FETCH DATA CHÍNH (Search hoặc List)
    useEffect(() => {
        if ((!slug || slug === 'main') && !itemSlug) {
            let cancelled = false;
            async function run() {
                setLoading(true);
                setError("");
                try {
                    let res;

                    const fromStr = combineDateTime(filters.dateFrom, filters.timeFrom, false);
                    const toStr = combineDateTime(filters.dateTo, filters.timeTo, true);

                    // Tạo query params cho Date
                    let dateQuery = "";
                    if (fromStr) {
                        dateQuery += `&from=${encodeURIComponent(fromStr)}`;
                    }
                    if (toStr) {
                        dateQuery += `&to=${encodeURIComponent(toStr)}`;
                    }

                    // CASE A: TÌM KIẾM (Có keyword -> Gọi API Search mới có phân trang)
                    if (keyword) {
                        const path = `/api/auctions/search?keyword=${encodeURIComponent(keyword)}&page=${pageParam}&size=16&sort=${apiSort}`;
                        res = await getJSON(path);
                    }
                    // CASE B: DANH SÁCH THƯỜNG
                    else {
                        let path = `/api/auctions/active?page=${pageParam}&size=16&sort=${apiSort}`;
                        // Nối thêm param date
                        path += dateQuery;

                        // Nếu có lọc category (nhưng logic backend ở trên tôi chưa handle filter category + date cùng lúc, bạn tự bổ sung nhé)
                        // if (categoryId) path += `&categoryId=${categoryId}`;

                        res = await getJSON(path);
                    }
                    if (!cancelled) setData(res);
                } catch (e) {
                    if (!cancelled) setError(e?.message || "Failed to load items");
                } finally {
                    if (!cancelled) setLoading(false);
                }
            }
            run();
            return () => { cancelled = true; };
        }
    }, [pageParam, apiSort, slug, itemSlug, keyword, filters]);

    // 5. LỌC CLIENT-SIDE (Kết hợp với kết quả từ Server)
    const list = useMemo(() => {
        let content = data?.content || [];

        // Lọc theo Branch (Lấy từ URL filters)
        if (filters.branches?.size > 0) {
            content = content.filter((x) => x.location && filters.branches.has(x.location));
        }
        // Lọc theo Category
        if (filters.categories?.size > 0) {
            content = content.filter((x) => x.categoryName && filters.categories.has(x.categoryName));
        }

        return content;
    }, [data, filters]);

    // Refresh AOS
    useEffect(() => {
        const id = setTimeout(() => AOS.refresh(), 100);
        return () => clearTimeout(id);
    }, [openFilter, list]);

    // 6. HÀM XỬ LÝ SỰ KIỆN

    // Khi bấm Apply trên FilterSheet -> Đẩy lên URL
    const handleApplyFilter = () => {
        const params = {};
        if (keyword) params.search = keyword;
        if (filters.categories.size > 0) params.category = Array.from(filters.categories).join(',');
        if (filters.branches.size > 0) params.branch = Array.from(filters.branches).join(',');
        params.sort = sortParam;
        params.page = 0; // Reset về trang 1

        setSearchParams(params);
        setOpenFilter(false);
    };

    const handleResetFilter = () => {
        const params = {};
        if (keyword) params.search = keyword;
        setSearchParams(params);

        setFilters({
            branches: new Set(),
            categories: new Set(),
            dateFrom: "",  // Reset ngày
            dateTo: "",
            timeFrom: "",
            timeTo: "",
            negotiated: null,
            types: new Set(),
        });
    };

    const handleSetPage = (newPage) => {
        const current = Object.fromEntries([...searchParams]);
        setSearchParams({ ...current, page: newPage });
    };

    const handleSetSort = (newSort) => {
        const current = Object.fromEntries([...searchParams]);
        setSearchParams({ ...current, sort: newSort, page: 0 });
    };

    const goItem = (it) => {
        const pSlug = it?.slug || it?.Slug;
        if (!pSlug) return;
        navigate(`/dashboard/auctions/main/${encodeURIComponent(pSlug)}`);
    };

    // --- RENDER ---

    if (itemSlug) {
        return (
            <div className="p-6">
                <button onClick={() => navigate(`/dashboard/auctions/main`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 mb-4">
                    <ArrowLeft className="w-4 h-4" /> {t('Back_to_Auctions')}
                </button>
                <AuctionDetail />
            </div>
        );
    }

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
                <p className="text-sm text-neutral-500">Tính năng đang được phát triển.</p>
                <button onClick={() => navigate('/dashboard/auctions/main')} className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md">
                    Về Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full flex flex-col relative overflow-x-hidden bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sortParam} // Dùng sort từ URL
                setSort={handleSetSort} // Hàm set sort đẩy lên URL
                onApply={handleApplyFilter} // Hàm apply đẩy lên URL
                onReset={handleResetFilter}
                // 👇 Truyền dữ liệu động vào FilterSheet
                locationOptions={filterOptions.locations}
                categoryOptions={filterOptions.categories}
            />

            <div className={`flex flex-col w-full transition-[padding] duration-300 ease-out ${openFilter ? "pt-[35vh]" : "pt-0"}`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 px-6 pt-6 flex-shrink-0" data-aos="fade-down">                    <div className="flex items-center gap-32 justify-between">
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

                {keyword && (
                    <div className="px-6 pb-2 flex items-center gap-2">
                     <span className="text-sm text-neutral-500">
                        {t('Results_for')}: <b className="text-neutral-900 dark:text-white">"{keyword}"</b>
                     </span>
                        <button
                            onClick={() => setSearchParams({})} // Xóa hết params = về trang chủ sạch
                            className="text-xs text-red-500 hover:underline"
                        >
                            {t('Clear_search')}
                        </button>
                    </div>
                )}

                <AuctionToolbar
                    sort={sortParam}
                    setSort={handleSetSort}
                    pageData={data ? {...data, content: list} : null} // Hack nhẹ để Toolbar hiển thị đúng số lượng sau khi filter client
                    setPage={handleSetPage}
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
                        sort={sortParam}
                        setSort={handleSetSort}
                        pageData={data}
                        setPage={handleSetPage}
                        loading={loading}
                        hideSort={true}
                    />
                </div>
            </div>
        </div>
    );
}