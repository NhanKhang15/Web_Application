import React from "react";
import {useTranslation} from "react-i18next";

/**
 * Component này hiển thị phần Mô tả và Tính năng
 * Props:
 * - product: Object sản phẩm (đã được useMemo)
 */
export default function AuctionInfo({ product }) {
    const { t } = useTranslation();
    if (!product) return null;

    return (
        <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-bold mb-3 uppercase">{t('Description')}</h2>
            <h3 className="font-semibold mb-2 text-md">{t('Features')} - {product.name}</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                {Object.entries(product.features).map(([key, value]) => (
                    <p key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                    </p>
                ))}
            </div>
        </div>
    );
}