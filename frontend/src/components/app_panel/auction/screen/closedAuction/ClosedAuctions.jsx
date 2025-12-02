import React, { useState, useMemo, useEffect } from "react";
import { CalendarDays, Filter, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";

// Components
import AuctionToolbar from "../../wid/componentView/AuctionToolbar.jsx";
import FilterSheet from "../../wid/FilterSheet.jsx";
import ClosedAuctionTable from "./ClosedAuctionTable.jsx"; // Import bảng Closed

// --- MOCK DATA (Dữ liệu đã kết thúc) ---
const MOCK_CLOSED_DATA = [
  { id: "009001", title: "2018 Honda Civic RS", finalPrice: 15000, endsAt: Date.now() - 86400000, isSold: true, winner: "User_123", location: "Dubai", category: "Vehicles" },
  { id: "009002", title: "MacBook Air M1", finalPrice: 750, endsAt: Date.now() - 172800000, isSold: true, winner: "Tech_Guru", location: "New York", category: "Electronics" },
  { id: "009003", title: "Sony PlayStation 5", finalPrice: 450, endsAt: Date.now() - 43200000, isSold: false, winner: null, location: "Tokyo", category: "Electronics" },
  { id: "009004", title: "Ford F-150 Raptor", finalPrice: 45000, endsAt: Date.now() - 259200000, isSold: true, winner: "Truck_Lover", location: "London", category: "Vehicles" },
  { id: "009005", title: "Rolex Submariner", finalPrice: 12000, endsAt: Date.now() - 604800000, isSold: true, winner: "Luxury_Collector", location: "Dubai", category: "Electronics" },
];

const MOCK_LOCATIONS = ["New York", "London", "Dubai", "Tokyo"];
const MOCK_CATEGORIES = [{ id: 1, name: "Vehicles" }, { id: 2, name: "Electronics" }];

export default function ClosedAuctions() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("search") || "";

    // State
    const [openFilter, setOpenFilter] = useState(false);
    const [sort, setSort] = useState("created_desc");
    const [page, setPage] = useState(0);
    
    // Filter State
    const [filters, setFilters] = useState({
        branches: new Set(), categories: new Set(), types: new Set(), negotiated: null,
        dateFrom: "", dateTo: "", timeFrom: "", timeTo: ""
    });

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

    // --- CLIENT-SIDE FILTER LOGIC ---
    const filteredData = useMemo(() => {
        let data = MOCK_CLOSED_DATA;
        
        // 1. Search
        if (keyword) {
            data = data.filter(item => item.title.toLowerCase().includes(keyword.toLowerCase()));
        }
        
        // 2. Filter Location
        if (filters.branches.size > 0) {
            data = data.filter(item => filters.branches.has(item.location));
        }
        
        // 3. Filter Category
        if (filters.categories.size > 0) {
            // Lưu ý: Mock data category ở đây là string, filter là object {id, name}
            // Cần map cho đúng hoặc sửa mock data. Ở đây giả sử filter lưu tên category.
            const catNames = new Set(Array.from(filters.categories));
            // data = data.filter(item => catNames.has(item.category)); 
        }

        // 4. Sort
        if (sort === "price_asc") data.sort((a, b) => a.finalPrice - b.finalPrice);
        if (sort === "price_desc") data.sort((a, b) => b.finalPrice - a.finalPrice);

        return data;
    }, [keyword, filters, sort]);

    // Pagination Logic
    const pageSize = 5;
    const paginatedData = useMemo(() => {
        return filteredData.slice(page * pageSize, (page + 1) * pageSize);
    }, [filteredData, page]);

    const pageData = { number: page, totalPages: Math.ceil(filteredData.length / pageSize), totalElements: filteredData.length };

    // --- RENDER ---
    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300 rounded-xl pb-10">
            
            {/* 1. FILTER SHEET */}
            <FilterSheet
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                onApply={() => setOpenFilter(false)}
                onReset={() => setFilters({ ...filters, branches: new Set() })}
                locationOptions={MOCK_LOCATIONS}
                categoryOptions={MOCK_CATEGORIES}
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
                         <ClosedAuctionTable data={paginatedData} />
                    </div>

                    {/* TOOLBAR DƯỚI */}
                    <div className="bg-white dark:bg-neutral-900 rounded-b-xl shadow-sm pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <AuctionToolbar sort={sort} setSort={setSort} pageData={pageData} setPage={setPage} loading={false} hideSort={true} />
                    </div>

                </div>
            </div>
        </div>
    );
}