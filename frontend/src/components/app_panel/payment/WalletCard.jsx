import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "../user_infor/ui/Button";
import { getToken, API_BASE_URL } from "../../../lib/api_url";
import { RefreshCw, CreditCard, History } from "lucide-react";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useUserProfile } from "../user_infor/lib/useUserProfile";

export default function WalletCard() {
    const { t } = useTranslation();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(""); // Raw numeric value
    const [displayAmount, setDisplayAmount] = useState(""); // Formatted for display
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { profile } = useUserProfile();

    // Format number with thousand separators (Vietnamese style: dots)
    const formatNumberWithSeparator = (value) => {
        if (!value) return "";
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Remove formatting to get raw number
    const parseFormattedNumber = (formattedValue) => {
        return formattedValue.replace(/\./g, "");
    };

    // Handle input change with formatting
    const handleAmountChange = (e) => {
        const rawValue = parseFormattedNumber(e.target.value);
        // Only allow digits
        if (rawValue && !/^\d+$/.test(rawValue)) return;

        setAmount(rawValue);
        setDisplayAmount(formatNumberWithSeparator(rawValue));
    };

    // Handle quick amount buttons
    const handleQuickAmount = (val) => {
        setAmount(val.toString());
        setDisplayAmount(formatNumberWithSeparator(val));
    };

    // Convert number to English words
    const numberToEnglishWords = (num) => {
        if (!num || num === "0" || num === "") return "";

        const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
            "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        const scales = ["", "thousand", "million", "billion", "trillion"];

        const number = parseInt(num.toString().replace(/\./g, ""), 10);
        if (isNaN(number) || number === 0) return "";
        if (number < 0) return "Invalid negative number";

        const readHundreds = (n) => {
            if (n === 0) return "";
            if (n < 20) return ones[n];
            if (n < 100) {
                return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "");
            }
            return ones[Math.floor(n / 100)] + " hundred" + (n % 100 !== 0 ? " " + readHundreds(n % 100) : "");
        };

        const groups = [];
        let temp = number;
        while (temp > 0) {
            groups.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }

        let result = "";
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i] > 0) {
                result += readHundreds(groups[i]) + " " + scales[i] + " ";
            }
        }

        result = result.trim();
        result = result.charAt(0).toUpperCase() + result.slice(1);
        return result + " VND";
    };

    // Convert number to Vietnamese words (like banks)
    const numberToVietnameseWords = (num) => {
        if (!num || num === "0" || num === "") return "";

        const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const positions = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

        const readThreeDigits = (n) => {
            let str = "";
            const hundred = Math.floor(n / 100);
            const ten = Math.floor((n % 100) / 10);
            const unit = n % 10;

            if (hundred > 0) {
                str += units[hundred] + " trăm ";
            }

            if (ten > 1) {
                str += units[ten] + " mươi ";
                if (unit === 1) str += "mốt ";
                else if (unit === 5) str += "lăm ";
                else if (unit > 0) str += units[unit] + " ";
            } else if (ten === 1) {
                str += "mười ";
                if (unit === 5) str += "lăm ";
                else if (unit > 0) str += units[unit] + " ";
            } else if (ten === 0 && hundred > 0 && unit > 0) {
                str += "lẻ " + units[unit] + " ";
            } else if (unit > 0) {
                str += units[unit] + " ";
            }

            return str.trim();
        };

        const number = parseInt(num.toString().replace(/\./g, ""), 10);
        if (isNaN(number) || number === 0) return "";
        if (number < 0) return "Số âm không hợp lệ";

        // Split into groups of 3 digits from right
        const groups = [];
        let temp = number;
        while (temp > 0) {
            groups.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }

        let result = "";
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i] > 0) {
                result += readThreeDigits(groups[i]) + " " + positions[i] + " ";
            }
        }

        result = result.trim();
        // Capitalize first letter
        result = result.charAt(0).toUpperCase() + result.slice(1);
        return result + " đồng";
    };

    // Wrapper function that uses the appropriate language
    const numberToWords = (num) => {
        const currentLang = localStorage.getItem("lang") || "vi";
        return currentLang === "en" ? numberToEnglishWords(num) : numberToVietnameseWords(num);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const topupId = params.get("topupId");

        if (topupId) {
            verifyTopup(topupId);
        } else {
            fetchData();
        }
    }, []);

    const verifyTopup = async (topupId) => {
        setRefreshing(true);
        try {
            const token = getToken();
            await fetch(`${API_BASE_URL}/api/topups/verify/${topupId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error(e);
        } finally {
            fetchData();
        }
    };

    // WebSocket for real-time balance update
    useEffect(() => {
        if (!profile?.userId) return;

        const socketFactory = () => new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = Stomp.over(socketFactory);
        stompClient.debug = () => { }; // Disable logs

        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/wallet/${profile.userId}`, (msg) => {
                if (msg.body === "PAYMENT_SUCCESS") {
                    fetchData();
                }
            });
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [profile?.userId]);

    const fetchData = async () => {
        setRefreshing(true);
        await Promise.all([fetchBalance(), fetchTransactions()]);
        setRefreshing(false);
    };

    const fetchBalance = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance);
            }
        } catch (err) {
            console.error("Error fetching balance:", err);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const handleTopup = async () => {
        if (!amount || isNaN(amount) || Number(amount) < 10000) {
            alert(t("wallet_min_error"));
            return;
        }

        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/topups/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(amount) }),
            });

            if (!res.ok) {
                const msg = await res.text();
                alert(t("wallet_error_prefix") + " " + msg);
                setLoading(false);
                return;
            }

            const data = await res.json();
            window.location.href = data.checkoutUrl;
        } catch (err) {
            console.error(err);
            alert(t("wallet_error_generic"));
            setLoading(false);
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6 mt-6">
            {/* Block 1: Balance */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                        {t("wallet_your_wallet")}
                    </h2>
                    <button
                        onClick={fetchData}
                        className={`p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} className="text-neutral-500" />
                    </button>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("wallet_current_balance")}</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatCurrency(balance)}
                </p>
            </motion.div>

            {/* Block 2: Top Up Form */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <CreditCard size={20} /> {t("wallet_topup")}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            {t("wallet_enter_amount")}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("wallet_min_amount")}
                            value={displayAmount}
                            onChange={handleAmountChange}
                            className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                        {amount && (
                            <p className="mt-2 text-sm italic text-neutral-600 dark:text-neutral-400">
                                {t("wallet_amount_in_words")} <span className="font-medium text-blue-600 dark:text-blue-400">{numberToWords(amount)}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[50000, 100000, 200000, 500000].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleQuickAmount(val)}
                                className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                {formatCurrency(val)}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={handleTopup}
                        disabled={loading}
                        className="w-full h-12 text-lg font-semibold !bg-purple-600 hover:!bg-purple-700 !text-white shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? t("wallet_processing") : t("wallet_pay")}
                    </Button>
                    <p className="text-xs text-center text-neutral-500">
                        {t("wallet_stripe_redirect")}
                    </p>
                </div>
            </motion.div>

            {/* Block 3: Transaction History */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <History size={20} /> {t("wallet_transaction_history")}
                </h3>

                {transactions.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">{t("wallet_no_transactions")}</p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-500 scroll-smooth"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgb(163 163 163) transparent'
                        }}
                    >
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">{t("wallet_th_datetime")}</th>
                                    <th className="px-4 py-3 text-right">{t("wallet_th_amount")}</th>
                                    <th className="px-4 py-3">{t("wallet_th_direction")}</th>
                                    <th className="px-4 py-3">{t("wallet_th_stripe_id")}</th>
                                    <th className="px-4 py-3">{t("wallet_th_note")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                            {new Date(tx.updatedAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-semibold ${tx.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${tx.direction === 'IN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {tx.direction === 'IN' ? t("wallet_direction_in") : t("wallet_direction_out")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs">
                                            {tx.stripePaymentIntentId || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                                            {tx.note}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

