import React from "react";
import { X } from "lucide-react";
import {useTranslation} from "react-i18next";

export default function FilterSheet({
                                        open,
                                        onClose,
                                        filters,
                                        setFilters,
                                        sort,
                                        setSort,
                                        onApply,
                                        onReset,
                                    }) {
    const { t } = useTranslation();

    const toggleSet = (key, value) => {
        setFilters((prev) => {
            const next = new Set(prev[key]);
            next.has(value) ? next.delete(value) : next.add(value);
            return { ...prev, [key]: next };
        });
    };

    const     Chip = ({ active, children, onClick }) => (
        <button
            onClick={onClick}
            className={`px-[1vw] py-[0.7vh] rounded-md text-[clamp(11px,1vw,12px)] font-medium border transition
        shadow-sm hover:shadow-md
        ${
                active
                    ? "bg-[#111] text-white border-[#111] dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-[#6B7280] border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700"
            }`}
        >
            {children}
        </button>
    );

    const translateClass = open ? "translate-x-0" : "translate-x-full";
    const headerInlineStyle = { ["--hdr-h"]: "48px" };

    const inputBase =
        "rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm " +
        "text-[clamp(11px,1vw,12px)] leading-none " +
        "h-[clamp(32px,4.2vh,38px)] px-[1vw] min-w-0 " +
        "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100";

    return (
        <>
            {/* backdrop */}
            <div
                onClick={onClose}
                className={`fixed left-0 right-0 top-0 h-[25vh] z-[58] bg-black/10 dark:bg-white/5 transition-opacity duration-200
        ${open ? "opacity-0 pointer-events-auto" : "opacity-0 pointer-events-none"} hidden md:block`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                className={[
                    "absolute left-0 right-0 top-0 z-[60]",
                    "h-[28vh] w-full",
                    "bg-white dark:bg-neutral-900",
                    "border-b border-neutral-200 dark:border-neutral-800",
                    "transform-gpu will-change-transform transition-transform duration-300 ease-out",
                    translateClass,
                ].join(" ")}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div
                        style={headerInlineStyle}
                        className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="text-[clamp(12px,0.95vw,13px)] text-[#9AA3B2] dark:text-neutral-400 font-semibold px-[2vw] py-[1.2vh]">
                            {t('Filter')}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-[0.6vh] mr-[2vw] rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-300"
                            aria-label={t('Aria_Close_Filter')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div
                        className="flex-1 overflow-visible px-[2vw] py-[1.2vh]"
                    >
                        <div className="space-y-[1.2vh]">
                            {/* Row 1 */}
                            <div className="grid w-full gap-x-[2vw] gap-y-[1vh] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                                {/* Branch */}
                                <div className="flex items-center flex-wrap gap-[0.6vw]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold mr-[0.6vw]">
                                        {t('Branch')}
                                    </span>
                                    {["Dubai", "Abu Dhabi", "Sharjah"].map((b) => (
                                        <Chip
                                            key={b}
                                            active={filters.branches.has(b)}
                                            onClick={() => toggleSet("branches", b)}
                                        >
                                            {b}
                                        </Chip>
                                    ))}
                                </div>

                                {/* Date */}
                                <div className="flex items-center flex-wrap gap-[0.6vw]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold">
                                        {t('Date')}
                                    </span>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, dateFrom: e.target.value }))
                                        }
                                        className={inputBase}
                                    />
                                    <span className="text-[clamp(10px,0.9vw,12px)] text-neutral-400 dark:text-neutral-500">–</span>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, dateTo: e.target.value }))
                                        }
                                        className={inputBase}
                                    />
                                </div>

                                {/* Time */}
                                <div className="flex items-center flex-wrap gap-[0.6vw]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold">
                                        {t('Time')}
                                    </span>
                                    <input
                                        type="time"
                                        value={filters.timeFrom}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, timeFrom: e.target.value }))
                                        }
                                        className={inputBase}
                                    />
                                    <span className="text-[clamp(10px,0.9vw,12px)] text-neutral-400 dark:text-neutral-500">–</span>
                                    <input
                                        type="time"
                                        value={filters.timeTo}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, timeTo: e.target.value }))
                                        }
                                        className={inputBase}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex flex-wrap items-center gap-x-[0.6vw] gap-y-[1vh]">
                                <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold mr-[0.6vw]">
                                    {t('Type')}
                                </span>
                                {["Live", "Inventory", "Deal", "Corporate"].map((t) => (
                                    <Chip
                                        key={t}
                                        active={filters.types.has(t)}
                                        onClick={() => toggleSet("types", t)}
                                    >
                                        {t}
                                    </Chip>
                                ))}
                            </div>

                            {/* Row 3 */}
                            <div className="flex flex-wrap items-center gap-x-[3vw] gap-y-[1vh]">
                                {/* Negotiated */}
                                <div className="flex items-center gap-[0.6vw]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold">
                                        {t('Negotiated')}
                                    </span>
                                    <Chip
                                        active={filters.negotiated === true}
                                        onClick={() =>
                                            setFilters((p) => ({
                                                ...p,
                                                negotiated: p.negotiated === true ? null : true,
                                            }))
                                        }
                                    >
                                        {t('Yes')}
                                    </Chip>
                                    <Chip
                                        active={filters.negotiated === false}
                                        onClick={() =>
                                            setFilters((p) => ({
                                                ...p,
                                                negotiated: p.negotiated === false ? null : false,
                                            }))
                                        }
                                    >
                                        {t('No')}
                                    </Chip>
                                </div>

                                {/* Sort */}
                                <div className="flex items-center gap-[0.6vw] min-w-[220px]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold">
                                        {t('Sort')}
                                    </span>
                                    <div className="relative flex-1 min-w-[140px]">
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value)}
                                            className={`${inputBase} w-full appearance-none pr-8`}
                                        >
                                            <option value="price_desc">{t('Sort_Price_Desc')}</option>
                                            <option value="price_asc">{t('Sort_Price_Asc')}</option>
                                            <option value="amount_desc">{t('Sort_Amount_Desc')}</option>
                                            <option value="amount_asc">{t('Sort_Amount_Asc')}</option>
                                            <option value="year_desc">{t('Sort_Year_Desc')}</option>
                                            <option value="year_asc">{t('Sort_Year_Asc')}</option>
                                            <option value="name_az">{t('Sort_Name_AZ')}</option>
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs">
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="ml-auto flex items-center gap-[0.8vw]">
                                    <button
                                        onClick={onReset}
                                        className="px-[1.2vw] py-[0.9vh] text-[clamp(11px,1vw,12px)] rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 shadow-sm hover:shadow"
                                    >
                                        {t('Reset')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onApply?.();
                                            onClose?.();
                                        }}
                                        className="px-[1.2vw] py-[0.9vh] text-[clamp(11px,1vw,12px)] rounded-md bg-[#111] dark:bg-white text-white dark:text-black shadow-sm hover:shadow"
                                    >
                                        {t('Apply')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
