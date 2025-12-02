import React from "react";
import { CheckCircle2, XCircle, Eye, DollarSign, User } from "lucide-react";

// Helper format tiền
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Component con: Dòng dữ liệu (Row)
const ClosedAuctionRow = ({ item }) => {
    return (
        <tr className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
            {/* ID */}
            <td className="px-6 py-4">
                <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-[10px] font-bold dark:bg-gray-700 dark:text-gray-300">
                    {item.id}
                </span>
            </td>
            
            {/* Title */}
            <td className="px-6 py-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 w-56 truncate" title={item.title}>
                    {item.title}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                    Ended: {new Date(item.endsAt).toLocaleDateString()}
                </div>
            </td>

            {/* Final Price */}
            <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                {formatCurrency(item.finalPrice)}
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                {item.isSold ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Sold
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                        <XCircle className="w-3 h-3" /> Unsold
                    </span>
                )}
            </td>

            {/* Winner */}
            <td className="px-6 py-4">
                {item.winner ? (
                    <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <User className="w-3 h-3 text-gray-400" />
                        {item.winner}
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm italic">—</span>
                )}
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="w-3 h-3" /> View Result
                </button>
            </td>
        </tr>
    );
};

// Component chính: Table Container
export default function ClosedAuctionTable({ data }) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[900px]">
                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-800/50 border-b dark:border-neutral-800">
                        <tr>
                            <th className="px-6 py-4 font-medium">Id</th>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Final Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Winner</th>
                            <th className="px-6 py-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <ClosedAuctionRow key={item.id} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}