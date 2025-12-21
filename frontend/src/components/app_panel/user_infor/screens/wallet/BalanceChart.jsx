import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { getToken, API_BASE_URL } from "../../../../../lib/api_url.js";
import { TrendingUp } from "lucide-react";

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isPositive = data.change >= 0;
        const changeFormatted = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Math.abs(data.change));
        const balanceFormatted = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(data.balance);

        return (
            <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 mb-1">
                    {new Date(data.time).toLocaleString('vi-VN')}
                </p>
                <p className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : '-'}{changeFormatted}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-[200px] truncate">
                    {data.description || 'Transaction'}
                </p>
                <p className="text-xs text-neutral-500 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    Số dư: <span className="font-semibold">{balanceFormatted}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function BalanceChart({ refreshTrigger = 0 }) {
    const { t } = useTranslation();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalanceHistory();
    }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

    const fetchBalanceHistory = async () => {
        try {
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/wallet/balance-history`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Transform data for the chart
                const chartData = data.map((item, index) => ({
                    ...item,
                    index, // Unique index for tooltip tracking
                    balance: Number(item.balance),
                    change: Number(item.change),
                    // Determine if this segment goes up or down
                    isUp: index === 0 ? true : Number(item.change) >= 0,
                    // For X-axis label - include time for same-day transactions
                    label: new Date(item.time).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    // Unique key for tick
                    tickLabel: `${index + 1}. ${new Date(item.time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}`,
                }));
                setHistoryData(chartData);
            }
        } catch (err) {
            console.error("Error fetching balance history:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatYAxis = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value;
    };

    // Calculate gradient stops based on data points
    const getGradientOffset = () => {
        if (historyData.length === 0) return { up: 0, down: 0 };

        const dataMax = Math.max(...historyData.map(d => d.balance));
        const dataMin = Math.min(...historyData.map(d => d.balance));

        if (dataMax <= 0) return { up: 0, down: 1 };
        if (dataMin >= 0) return { up: 1, down: 0 };

        return {
            up: dataMax / (dataMax - dataMin),
            down: Math.abs(dataMin) / (dataMax - dataMin)
        };
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
                <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-pulse text-neutral-400">Loading...</div>
                </div>
            </motion.div>
        );
    }

    if (historyData.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} /> {t("wallet_balance_chart") || "Biểu đồ số dư"}
                </h3>
                <div className="flex items-center justify-center h-[200px] text-neutral-500">
                    {t("wallet_no_chart_data") || "Chưa có dữ liệu giao dịch"}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 md:p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
        >
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                {t("wallet_balance_chart") || "Biểu đồ số dư"}
            </h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={historyData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="tickLabel"
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                            domain={[
                                dataMin => Math.floor(dataMin * 0.95), // 5% padding below min
                                dataMax => Math.ceil(dataMax * 1.05)   // 5% padding above max
                            ]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#22c55e"
                            strokeWidth={2.5}
                            fill="url(#colorBalance)"
                            isAnimationActive={false}
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                const isUp = payload.change >= 0;
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={4}
                                        fill={isUp ? "#22c55e" : "#ef4444"}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                );
                            }}
                            activeDot={(props) => {
                                const { cx, cy, payload } = props;
                                const isUp = payload.change >= 0;
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={6}
                                        fill={isUp ? "#22c55e" : "#ef4444"}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                );
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {t("wallet_income") || "Tiền vào"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {t("wallet_expense") || "Tiền ra"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
