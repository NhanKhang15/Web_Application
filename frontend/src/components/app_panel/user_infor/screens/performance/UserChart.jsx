// frontend/src/components/dashboard/user_infor/screens/performance/UserChart.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    ComposedChart,
    Bar,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Avatar from "../../../widget/screens/Avatar.jsx";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

// -- Chart data sample --
const chartData = [
    { date: 'Oct 10, 2025', bidValue: 8000, browsing: 10000 },
    { date: 'Oct 13', bidValue: 12000, browsing: 11000 },
    { date: 'Oct 16', bidValue: 7000, browsing: 13000 },
    { date: 'Oct 19', bidValue: 14000, browsing: 12500 },
    { date: 'Oct 22', bidValue: 10000, browsing: 15000 },
    { date: 'Oct 25', bidValue: 17000, browsing: 14000 },
    { date: 'Oct 28', bidValue: 11000, browsing: 16000 },
    { date: 'Nov 01', bidValue: 13000, browsing: 15500 },
    { date: 'Nov 04', bidValue: 9000, browsing: 17000 },
    { date: 'Nov 07', bidValue: 16000, browsing: 16500 },
    { date: 'Nov 10, 2025', bidValue: 14500, browsing: 18000 },
];

const formatYAxis = (tick) => `$${tick / 1000}K`;

export default function UserChart({ profile }) {
    const { t } = useTranslation();

    useEffect(() => {
        AOS.init({ duration: 600, offset: 100, once: true });
    }, []);

    return (
        <div className="flex flex-col gap-6 md:gap-12 pt-4 md:pt-12 pb-8 relative w-full overflow-x-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 pl-2"
                data-aos="fade-up"
            >
                <Avatar
                    size={64}
                    src={profile?.avatarUrl || "https://via.placeholder.com/64"}
                    alt={profile?.fullName || "User"}
                />
                <div className="leading-tight">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile?.fullName || t("unknown_user")}
                    </h2>
                    <p className="text-sm text-neutral-500">
                        {profile?.location || profile?.address || t("location_unknown")}
                    </p>
                </div>
            </motion.div>

            {/* Header (note + filter) */}
            <div className="flex flex-wrap items-center justify-bertween mb-4">
                <div className="flex items-center gap-4">
                    {/* Note */}
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t("bid_activity")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t("browsing_activity")}</span>
                    </div>
                </div>

                {/* Filter */}
                <select className="text-xs text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded p-1 bg-transparent">
                    <option>{t("last_fifteen")}</option>
                    <option>{t("last_30_days")}</option>
                    <option>{t("last_90_days")}</option>
                </select>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 5, right: 10, bottom: 5, left: -25 }}
                    >
                        {/* Grid */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                        {/* X Axis (Date and Month) */}
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />

                        {/* Y Axis (Value) */}
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            domain={[5000, 25000]}
                            ticks={[5000, 10000, 15000, 20000, 25000]}
                        />

                        {/* Tooltip */}
                        <Tooltip
                            formatter={(value) => `$${value.toLocaleString()}`}
                            labelClassName="text-black"
                            contentStyle={{ background: "white", border: "1px solid #CCC", borderRadius: "5px" }}
                        />

                        {/* Purple Line (Browsing Activity) */}
                        <Area
                            type="monotone"
                            dataKey="browsing"
                            stroke="#8B5CF6"
                            fillOpacity={0.1}
                            fill="#8B5CF6"
                            strokeWidth={2}
                        />

                        {/* Gray Colums (Bid Value) */}
                        <Bar
                            dataKey="bidValue"
                            fill="#E5E7EB"
                            barSize={15}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
