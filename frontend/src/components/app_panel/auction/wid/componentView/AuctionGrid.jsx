// File: AuctionGrid.jsx (Component con MỚI)
import React from "react";
import AuctionCard from "../componentView/AuctionCard.jsx";
import { useTranslation } from "react-i18next"; // Import thẻ Card

/**
 * Component này hiển thị Lưới các vật phẩm
 * Props:
 * - list: Mảng các vật phẩm để map
 * - goItem: Hàm (nhận item) để điều hướng khi bấm vào
 * - loading: (Boolean)
 * - error: (String) tin nhắn lỗi
 */
export default function AuctionGrid({ list, goItem, loading, error }) {
    const { t } = useTranslation();

    // States
    if (loading) {
        return <div className="px-6 pb-6 text-sm text-gray-500">{t('Loading_items')}</div>;
    }
    if (error) {
        return <div className="px-6 pb-6 text-sm text-red-500">{t('Error')}: {error}</div>;
    }
    if (list.length === 0) {
        return <div className="px-6 pb-6 text-sm text-gray-500">{t('No_items_found')}</div>;
    }

    // Tính delay cho animation
    const cardDelay = (i) => (i % 8) * 50;

    // Grid
    return (
        <div className="
        grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6
        px-3 md:px-6 pb-6">
            {list.map((item, i) => (
                <AuctionCard
                    key={item.itemId}
                    item={item}
                    onClick={() => goItem(item)}
                    aosDelay={cardDelay(i)}
                />
            ))}
        </div>
    );
}