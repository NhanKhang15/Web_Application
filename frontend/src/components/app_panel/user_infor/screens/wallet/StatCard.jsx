// frontend/src/components/dashboard/user_infor/screens/wallet/StatCard.jsx
import React from 'react';

/**
 * Component tái sử dụng cho một mục chỉ số
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Biểu tượng hiển thị
 * @param {string} props.label - Nhãn của mục chỉ số
 * @param {string} props.value - Giá trị của mục chỉ số
 */
export default function StatCard({ icon, label, value }) {
    return (
        <div className="flex items-center space-x-4">
            {/* Vùng chứa Icon */}
            <div className="flex-shrink-0 text-4xl">
                {icon}
            </div>

            {/* Vùng chứa Text*/}
            <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                </p>
            </div>
        </div>

    )
}
