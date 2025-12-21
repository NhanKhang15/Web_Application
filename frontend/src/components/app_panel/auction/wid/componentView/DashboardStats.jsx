import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToken, API_BASE_URL } from "../../../../../lib/api_url";
import { useCurrency } from "../../../widget/screens/CurrencyContext";

export default function DashboardStats() {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
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

        fetchBalance();
    }, []);

    const priceDisplay = formatPrice(balance);

    return (
        <div className="flex flex-wrap gap-4 md:gap-8 items-start justify-start mb-6 md:mb-8 px-3 md:px-6 flex-shrink-0">
            <div
                className="flex flex-col min-w-[140px] md:min-w-[180px]"
                data-aos="fade-up"
            >
                <p className="uppercase text-[10px] md:text-[11px] tracking-wider text-[#9AA3B2] dark:text-gray-400 font-semibold mb-1">
                    {t("balance") || "Balance"}
                </p>
                <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-500" />
                    <div className="flex flex-col">
                        <p className="text-[18px] md:text-[24px] font-extrabold text-green-600 dark:text-green-400">
                            {priceDisplay.primary}
                        </p>
                        {priceDisplay.secondary && (
                            <span className="text-sm md:text-base font-medium text-green-500/80 dark:text-green-400/70">
                                {priceDisplay.secondary}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
