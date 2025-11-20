import React from "react";
import {useTranslation} from "react-i18next";
import { FileText, List } from "lucide-react";

/**
 * Component này hiển thị phần Mô tả và Tính năng
 * Props:
 * - product: Object sản phẩm (đã được useMemo)
 */
export default function AuctionInfo({ product }) {
    const { t } = useTranslation();
    if (!product) return null;

    return (
        <div className="bg-white dark:bg-[#14191F] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">

            {/* Block 1: Description */}
            <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <FileText className="w-5 h-5 text-[#e43137]" />
                    {t('Description')}
                </h2>
                <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description || t('No_description')}
                </div>
            </div>

            {/* Block 2: Features */}
            <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <List className="w-5 h-5 text-[#e43137]" />
                    {t('Features')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.features).map(([k, v]) => (
                        <div
                            key={k}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#1A1F25] border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                        >
                            <span className="font-medium text-gray-500 text-sm">{k}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}