import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FilterSheet({
    open,
    onClose,
    filters,
    setFilters,
    sort,
    setSort,
    onApply,
    onReset,
    // 👇 1. Nhận props dữ liệu động (Mặc định mảng rỗng)
    locationOptions = [],
    categoryOptions = []
}) {
    const { t } = useTranslation();

    const toggleSet = (key, value) => {
        setFilters((prev) => {
            const next = new Set(prev[key] || []);
            next.has(value) ? next.delete(value) : next.add(value);
            return { ...prev, [key]: next };
        });
    };

    const Chip = ({ active, children, onClick }) => (
        <button
            onClick={onClick}
            // CSS GIỮ NGUYÊN
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition shadow-sm hover:shadow-md
            ${active
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"}`}
        >
            {children}
        </button>
    );

    // CSS GIỮ NGUYÊN
    const translateClass = open ? "translate-x-0" : "translate-x-full";
    const headerInlineStyle = { ["--hdr-h"]: "48px" };

    const inputBase =
        "rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm " +
        "text-[clamp(11px,1vw,12px)] leading-none " +
        "h-[clamp(32px,4.2vh,38px)] px-[1vw] min-w-0 " +
        "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100";

    return (
        <>
            {/* backdrop GIỮ NGUYÊN */}
            <div
                onClick={onClose}
                className={`fixed left-0 right-0 top-0 h-[25vh] z-[58] bg-black/10 dark:bg-white/5 transition-opacity duration-200
                ${open ? "opacity-0 pointer-events-auto" : "opacity-0 pointer-events-none"} hidden md:block`}
            />

            {/* Panel GIỮ NGUYÊN */}
            <aside
                role="dialog"
                aria-modal="true"
                className={[
                    "absolute left-0 right-0 top-0 z-[60]",
                    "h-auto min-h-[35vh] w-full",
                    "bg-white dark:bg-neutral-900",
                    "border-b border-neutral-200 dark:border-neutral-800",
                    "transform-gpu will-change-transform transition-transform duration-300 ease-out",
                    translateClass,
                ].join(" ")}
            >
                <div className="h-full flex flex-col pb-4">
                    {/* Header GIỮ NGUYÊN */}
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

                    {/* Body GIỮ NGUYÊN */}
                    <div className="flex-1 overflow-visible px-[2vw] py-[1.2vh]">
                        <div className="space-y-[1.5vh]">
                            {/* Row 1 */}
                            <div className="grid w-full gap-x-[2vw] gap-y-[1vh] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                                {/* Branch - Dropdown Select */}
                                <div className="flex items-center gap-[0.6vw] min-w-[220px]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold">
                                        {t('Branch')}
                                    </span>
                                    <div className="relative flex-1 min-w-[160px]">
                                        <select
                                            value={filters.selectedBranch || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFilters((p) => ({
                                                    ...p,
                                                    selectedBranch: val,
                                                    branches: val ? new Set([val]) : new Set()
                                                }));
                                            }}
                                            className={`${inputBase} w-full appearance-none pr-8`}
                                        >
                                            <option value="">{t('All_Locations')}</option>
                                            <option value="An Giang">An Giang</option>
                                            <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                                            <option value="Bắc Giang">Bắc Giang</option>
                                            <option value="Bắc Kạn">Bắc Kạn</option>
                                            <option value="Bạc Liêu">Bạc Liêu</option>
                                            <option value="Bắc Ninh">Bắc Ninh</option>
                                            <option value="Bến Tre">Bến Tre</option>
                                            <option value="Bình Định">Bình Định</option>
                                            <option value="Bình Dương">Bình Dương</option>
                                            <option value="Bình Phước">Bình Phước</option>
                                            <option value="Bình Thuận">Bình Thuận</option>
                                            <option value="Cà Mau">Cà Mau</option>
                                            <option value="Cần Thơ">Cần Thơ</option>
                                            <option value="Cao Bằng">Cao Bằng</option>
                                            <option value="Đà Nẵng">Đà Nẵng</option>
                                            <option value="Đắk Lắk">Đắk Lắk</option>
                                            <option value="Đắk Nông">Đắk Nông</option>
                                            <option value="Điện Biên">Điện Biên</option>
                                            <option value="Đồng Nai">Đồng Nai</option>
                                            <option value="Đồng Tháp">Đồng Tháp</option>
                                            <option value="Gia Lai">Gia Lai</option>
                                            <option value="Hà Giang">Hà Giang</option>
                                            <option value="Hà Nam">Hà Nam</option>
                                            <option value="Hà Nội">Hà Nội</option>
                                            <option value="Hà Tĩnh">Hà Tĩnh</option>
                                            <option value="Hải Dương">Hải Dương</option>
                                            <option value="Hải Phòng">Hải Phòng</option>
                                            <option value="Hậu Giang">Hậu Giang</option>
                                            <option value="Hòa Bình">Hòa Bình</option>
                                            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                            <option value="Hưng Yên">Hưng Yên</option>
                                            <option value="Khánh Hòa">Khánh Hòa</option>
                                            <option value="Kiên Giang">Kiên Giang</option>
                                            <option value="Kon Tum">Kon Tum</option>
                                            <option value="Lai Châu">Lai Châu</option>
                                            <option value="Lâm Đồng">Lâm Đồng</option>
                                            <option value="Lạng Sơn">Lạng Sơn</option>
                                            <option value="Lào Cai">Lào Cai</option>
                                            <option value="Long An">Long An</option>
                                            <option value="Nam Định">Nam Định</option>
                                            <option value="Nghệ An">Nghệ An</option>
                                            <option value="Ninh Bình">Ninh Bình</option>
                                            <option value="Ninh Thuận">Ninh Thuận</option>
                                            <option value="Phú Thọ">Phú Thọ</option>
                                            <option value="Phú Yên">Phú Yên</option>
                                            <option value="Quảng Bình">Quảng Bình</option>
                                            <option value="Quảng Nam">Quảng Nam</option>
                                            <option value="Quảng Ngãi">Quảng Ngãi</option>
                                            <option value="Quảng Ninh">Quảng Ninh</option>
                                            <option value="Quảng Trị">Quảng Trị</option>
                                            <option value="Sóc Trăng">Sóc Trăng</option>
                                            <option value="Sơn La">Sơn La</option>
                                            <option value="Tây Ninh">Tây Ninh</option>
                                            <option value="Thái Bình">Thái Bình</option>
                                            <option value="Thái Nguyên">Thái Nguyên</option>
                                            <option value="Thanh Hóa">Thanh Hóa</option>
                                            <option value="Thừa Thiên Huế">Thừa Thiên Huế</option>
                                            <option value="Tiền Giang">Tiền Giang</option>
                                            <option value="Trà Vinh">Trà Vinh</option>
                                            <option value="Tuyên Quang">Tuyên Quang</option>
                                            <option value="Vĩnh Long">Vĩnh Long</option>
                                            <option value="Vĩnh Phúc">Vĩnh Phúc</option>
                                            <option value="Yên Bái">Yên Bái</option>
                                            <option value="International">International / Quốc tế</option>
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs">
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Date GIỮ NGUYÊN */}
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

                                {/* Time GIỮ NGUYÊN */}
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
                            <div className="flex flex-col gap-[1vh]">
                                {/* Category - SỬA LOGIC MAP DỮ LIỆU */}
                                <div className="flex flex-wrap items-center gap-x-[0.6vw] gap-y-[1vh]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold mr-[0.6vw]">
                                        {t('Category')}
                                    </span>
                                    {/* 👇 Sửa: Map từ categoryOptions. Xử lý cả object {id, name} lẫn string */}
                                    {categoryOptions.length > 0 ? categoryOptions.map((cat) => {
                                        const val = typeof cat === 'object' ? cat.name : cat;
                                        const key = typeof cat === 'object' ? cat.id : cat;
                                        return (
                                            <Chip
                                                key={key}
                                                active={filters.categories?.has(val)}
                                                onClick={() => toggleSet("categories", val)}
                                            >
                                                {val}
                                            </Chip>
                                        );
                                    }) : (
                                        <span className="text-xs text-gray-400 italic">Loading...</span>
                                    )}
                                </div>

                                {/* Type - Tạm giữ cứng hoặc thêm typeOptions sau này */}
                                <div className="flex flex-wrap items-center gap-x-[0.6vw] gap-y-[1vh]">
                                    <span className="text-[clamp(12px,1vw,14px)] text-[#122025] dark:text-neutral-100 font-semibold mr-[0.6vw]">
                                        {t('Type')}
                                    </span>
                                    {["Live", "Inventory", "Deal", "Corporate"].map((t) => (
                                        <Chip
                                            key={t}
                                            active={filters.types?.has(t)}
                                            onClick={() => toggleSet("types", t)}
                                        >
                                            {t}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            {/* Row 3 GIỮ NGUYÊN */}
                            <div className="flex flex-wrap items-center gap-x-[3vw] gap-y-[1vh] pt-1 border-t border-neutral-100 dark:border-neutral-800">
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