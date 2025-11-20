// File: AuctionToolbar.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuctionToolbar({ sort, setSort, pageData, setPage, loading, hideSort = false }) {
    const { t } = useTranslation();

    const pageNum = pageData ? pageData.number + 1 : 1;
    const totalPages = pageData ? Math.max(1, pageData.totalPages) : 1;

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(0);
    };

    const handlePrev = () => {
        setPage((p) => Math.max(0, p - 1));
    };

    const handleNext = () => {
        setPage((p) => (pageData ? (p + 1 < pageData.totalPages ? p + 1 : p) : p));
    };

    return (
        // Thêm class pb-4 nếu là bottom toolbar để cách lề dưới một chút
        <div className={`flex items-center ${hideSort ? 'justify-end' : 'justify-between'} gap-4 px-6 mb-3 ${hideSort ? 'mt-2 pb-4' : ''}`}>

            {/* Chỉ hiển thị phần Sort nếu hideSort là false */}
            {!hideSort && (
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{t('Sort')}</span>
                    <select
                        value={sort}
                        onChange={handleSortChange}
                        className="border rounded-md px-2 py-1 bg-white dark:bg-[#14191F] border-neutral-200 dark:border-neutral-700"
                    >
                        <option value="created_desc">{t('Newest')}</option>
                        <option value="created_asc">{t('Oldest')}</option>
                    </select>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrev}
                    disabled={loading || (pageData && pageData.number <= 0)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm border rounded-md bg-white dark:bg-[#14191F] border-neutral-200 dark:border-neutral-700 disabled:opacity-50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="w-4 h-4" /> {t('Prev')}
                </button>
                <div className="text-xs text-gray-500 min-w-[60px] text-center">
                    {t('Page')} {pageNum} / {totalPages}
                </div>
                <button
                    onClick={handleNext}
                    disabled={loading || (pageData && pageData.number + 1 >= pageData.totalPages)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm border rounded-md bg-white dark:bg-[#14191F] border-neutral-200 dark:border-neutral-700 disabled:opacity-50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    {t('Next')} <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}