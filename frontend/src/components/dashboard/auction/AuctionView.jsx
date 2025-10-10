import React, { useMemo, useState, useEffect } from "react";
import { ArrowUp, CalendarDays, Filter, CircleDollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import FilterSheet from "./FilterSheet.jsx";
import AOS from "aos";
import "aos/dist/aos.css";

const stats = [
    {
        label: "TOTAL REVENUE",
        value: "$50,000",
        icon: <CircleDollarSign className="w-5 h-5 text-red-500" />,
        className: "text-red-600 dark:text-red-400",
    },
    {
        label: "SALES",
        value: "$40,250",
        icon: <ShoppingCart className="w-5 h-5 text-gray-800 dark:text-gray-200" />,
        className: "text-black dark:text-white",
    },
    {
        label: "PROFIT",
        value: "+25,600",
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        className: "text-green-600 dark:text-green-400",
    },
];

const auctions = [
    { id: 1, price: "12,560 AED", user: "Sijo Wayn", location: "Dubai", car: "Nissan 650fs", year: "1998", img: "https://auto.hindustantimes.com/htmobile1/nissan_xtrail/images/exterior_nissan-x-trail_front-left-side_600x400.jpg?imwidth=420", amount: "$1690.00" },
    { id: 2, price: "650 AED", user: "Beccy Harold", location: "Sharjah", car: "Mustang black", year: "2017", img: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwY2FyfGVufDB8fDB8fHww", amount: "$1590.00" },
    { id: 3, price: "1350 AED", user: "Barbara Rivera", location: "Abu Dhabi", car: "BMW m5 super sport", year: "2016", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6gZg4Z3OiDLAM15xpJIH59Uznh4ZxbMaQtw&s", amount: "$1599.00" },
    { id: 5, price: "12,560 AED", user: "Sijo Wayn", location: "Dubai", car: "Nissan 650fs", year: "1998", img: "https://auto.hindustantimes.com/htmobile1/nissan_xtrail/images/exterior_nissan-x-trail_front-left-side_600x400.jpg?imwidth=420", amount: "$1690.00" },
    { id: 6, price: "650 AED", user: "Beccy Harold", location: "Sharjah", car: "Mustang black", year: "2017", img: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwY2FyfGVufDB8fDB8fHww", amount: "$1590.00" },
    { id: 7, price: "1350 AED", user: "Barbara Rivera", location: "Abu Dhabi", car: "BMW m5 super sport", year: "2016", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6gZg4Z3OiDLAM15xpJIH59Uznh4ZxbMaQtw&s", amount: "$1599.00" },
    { id: 9, price: "12,560 AED", user: "Sijo Wayn", location: "Dubai", car: "Nissan 650fs", year: "1998", img: "https://auto.hindustantimes.com/htmobile1/nissan_xtrail/images/exterior_nissan-x-trail_front-left-side_600x400.jpg?imwidth=420", amount: "$1690.00" },
    { id: 10, price: "650 AED", user: "Beccy Harold", location: "Sharjah", car: "Mustang black", year: "2017", img: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwY2FyfGVufDB8fDB8fHww", amount: "$1590.00" },
    { id: 11, price: "1350 AED", user: "Barbara Rivera", location: "Abu Dhabi", car: "BMW m5 super sport", year: "2016", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6gZg4Z3OiDLAM15xpJIH59Uznh4ZxbMaQtw&s", amount: "$1599.00" },
    { id: 13, price: "12,560 AED", user: "Sijo Wayn", location: "Dubai", car: "Nissan 650fs", year: "1998", img: "https://auto.hindustantimes.com/htmobile1/nissan_xtrail/images/exterior_nissan-x-trail_front-left-side_600x400.jpg?imwidth=420", amount: "$1690.00" },
    { id: 14, price: "650 AED", user: "Beccy Harold", location: "Sharjah", car: "Mustang black", year: "2017", img: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwY2FyfGVufDB8fDB8fHww", amount: "$1590.00" },
    { id: 15, price: "1350 AED", user: "Barbara Rivera", location: "Abu Dhabi", car: "BMW m5 super sport", year: "2016", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6gZg4Z3OiDLAM15xpJIH59Uznh4ZxbMaQtw&s", amount: "$1599.00" },
];

// helpers
const toNum = (v) => Number(String(v).replace(/[^\d.]/g, "")) || 0;

export default function AuctionView() {
    const [range, setRange] = useState("today");
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
    const [sort, setSort] = useState("price_desc");

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
        const my = now.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase();
        return { day: d, monthYear: my };
    }, []);

    const list = useMemo(() => {
        let arr = [...auctions];
        if (filters.branches.size > 0) arr = arr.filter((x) => filters.branches.has(x.location));

        arr.sort((a, b) => {
            switch (sort) {
                case "price_desc": return toNum(b.price) - toNum(a.price);
                case "price_asc": return toNum(a.price) - toNum(b.price);
                case "year_desc": return Number(b.year) - Number(a.year);
                case "year_asc": return Number(a.year) - Number(b.year);
                default: return 0;
            }
        });
        return arr;
    }, [filters, sort]);

    useEffect(() => {
        const id = setTimeout(() => AOS.refresh(), 100);
        return () => clearTimeout(id);
    }, [openFilter, list]);

    const cardDelay = (i) => (i % 8) * 50;

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0B0F13] text-[#212121] dark:text-gray-200 transition-colors duration-300">

            {/* Filter sliding sheet */}
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

            {/* Top controls */}
            <div
                className="flex flex-wrap items-center justify-between gap-4 mb-4 px-6 pt-6 flex-shrink-0"
                data-aos="fade-down"
            >
                <div className="flex items-center gap-32 justify-between">
                    {/* Calendar badge */}
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

                    {/* Segmented */}
                    <div
                        className="flex items-center rounded-md bg-white dark:bg-[#0F141A] border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden"
                        data-aos="fade-up"
                    >
                        {[
                            { key: "today", label: "Today" },
                            { key: "week", label: "Week" },
                            { key: "month", label: "Month" },
                        ].map((b) => {
                            const active = range === b.key;
                            return (
                                <button
                                    key={b.key}
                                    onClick={() => setRange(b.key)}
                                    className={`px-3 py-1.5 text-[12px] font-medium transition 
                                        ${active
                                        ? "bg-[#101418] dark:bg-gray-100 text-white dark:text-black"
                                        : "text-[#7E8896] dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1E242A]"
                                    }`}
                                >
                                    {b.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter button */}
                <button
                    type="button"
                    onClick={() => setOpenFilter(true)}
                    className="inline-flex items-center gap-2 text-[12px] font-medium text-[#9AA3B2] dark:text-gray-400
               rounded-md px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-[#1E242A] border border-transparent"
                    data-aos="fade-left"
                >
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            <div
                className={`transition-[height] duration-300 ease-out flex-shrink-0 ${openFilter ? "h-[25vh]" : "h-0"}`}
                aria-hidden="true"
            />

            {/* Header Stats */}
            <div className="flex flex-wrap gap-16 items-start justify-start mb-8 px-6 flex-shrink-0">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className="flex flex-col min-w-[160px]"
                        data-aos="fade-up"
                        data-aos-delay={i * 100}
                    >
                        {/* Label */}
                        <p className="uppercase text-[11px] tracking-wider text-[#9AA3B2] dark:text-gray-400 font-semibold mb-1">
                            {s.label}
                        </p>

                        {/* Icon + Value */}
                        <div className="flex items-center gap-2">
                            {s.icon}
                            <p className={`text-[24px] font-extrabold ${s.className}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Auction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-y-auto px-6 pb-6 min-h-0 max-h-full">
                {list.map((item, i) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-[#14191F] rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col transform-gpu transition-colors"
                        data-aos="fade-up"
                        data-aos-delay={cardDelay(i)}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.price}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                alt={item.user}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <p className="text-sm font-medium">{item.user}</p>
                                <p className="text-xs text-neutral-500 dark:text-gray-400">{item.location}</p>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 items-center justify-center">
                            <img
                                src={item.img}
                                alt={item.car}
                                className="h-32 w-auto object-cover rounded-lg mb-3 transform-gpu"
                                data-aos="zoom-in"
                                data-aos-delay={cardDelay(i) + 80}
                            />
                            <p className="text-sm font-semibold">
                                {item.car} <span className="font-normal">{item.year}</span>
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-gray-400">{item.amount}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
