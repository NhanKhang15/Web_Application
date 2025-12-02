import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../user_infor/ui/Button";
import { getToken, API_BASE_URL } from "../../../lib/api_url";
import { RefreshCw, CreditCard, History } from "lucide-react";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useUserProfile } from "../user_infor/lib/useUserProfile";

export default function WalletCard() {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { profile } = useUserProfile();

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
            alert("Số tiền nạp tối thiểu 10.000 VND");
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
                alert("Lỗi: " + msg);
                setLoading(false);
                return;
            }

            const data = await res.json();
            window.location.href = data.checkoutUrl;
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
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
                        Ví của bạn
                    </h2>
                    <button
                        onClick={fetchData}
                        className={`p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} className="text-neutral-500" />
                    </button>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Số dư hiện tại</p>
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
                    <CreditCard size={20} /> Nạp tiền vào ví
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Nhập số tiền (VND)
                        </label>
                        <input
                            type="number"
                            placeholder="Tối thiểu 10.000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[50000, 100000, 200000, 500000].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
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
                        {loading ? "Processing..." : "Pay"}
                    </Button>
                    <p className="text-xs text-center text-neutral-500">
                        Bạn sẽ được chuyển hướng đến trang thanh toán an toàn của Stripe.
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
                    <History size={20} /> Lịch sử giao dịch
                </h3>

                {transactions.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">Chưa có giao dịch nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Ngày giờ</th>
                                    <th className="px-4 py-3 text-right">Số tiền</th>
                                    <th className="px-4 py-3">Chiều</th>
                                    <th className="px-4 py-3">Stripe ID</th>
                                    <th className="px-4 py-3">Ghi chú</th>
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
                                                {tx.direction === 'IN' ? 'Nạp vào' : 'Rút ra'}
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
