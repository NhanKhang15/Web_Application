// src/components/dashboard/trader/screens/PlatformUsers.jsx

import React, { useEffect } from "react";
import { ArrowLeft, Search, ChevronDown, MoreHorizontal, Star, ShieldCheck, Ban } from "lucide-react"; // Icon
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

// --- Dữ liệu giả lập (Mock Data) ---
const users = [
  { id: 1, name: "Mary Ann Wells", role: "Freelancer", avatar: "https://i.pravatar.cc/150?img=1", status: "active", rating: 4.8 },
  { id: 2, name: "Chris Fox", role: "Freelancer", avatar: "https://i.pravatar.cc/150?img=2", status: "pending", rating: 4.5 },
  { id: 3, name: "Amber Ford", role: "Freelancer", avatar: "https://i.pravatar.cc/150?img=3", status: "banned", rating: 0 },
  { id: 4, name: "Larry Foster", role: "Freelancer", avatar: "https://i.pravatar.cc/150?img=4", status: "active", rating: 4.2 },
  { id: 5, name: "Kelly Stanley", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=5", status: "active", rating: 4.9 },
  { id: 6, name: "Lori Wagner", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=9", status: "pending", rating: 4.3 },
  { id: 7, name: "Patrick Williamson", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=7", status: "banned", rating: 0 },
  { id: 8, name: "Rose Elliot", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=8", status: "active", rating: 4.6 },
  { id: 9, name: "Amanda Gomez", role: "Dubai", avatar: "https://i.pravatar.cc/150?img=10", status: "active", rating: 4.7 },
  { id: 10, name: "Beverly Sullivan", role: "Dubai", avatar: "https://i.pravatar.cc/150?img=11", status: "pending", rating: 4.4 },
  { id: 11, name: "Matthew Porter", role: "Dubai", avatar: "https://i.pravatar.cc/150?img=12", status: "banned", rating: 0 },
  { id: 12, name: "Dan Carpenter", role: "Dubai", avatar: "https://i.pravatar.cc/150?img=13", status: "active", rating: 4.1 },
  { id: 13, name: "Rose Hawkins", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=20", status: "active", rating: 4.5 },
  { id: 14, name: "Doris Marshall", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=15", status: "pending", rating: 4.0 },
  { id: 15, name: "Jessica Fox", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=16", status: "banned", rating: 0 },
  { id: 16, name: "Elizabeth Diaz", role: "Abu Dhabi", avatar: "https://i.pravatar.cc/150?img=17", status: "active", rating: 4.8 },
];

export default function PlatformUsers() {
  useEffect(() => {
    AOS.init({ duration: 600, offset: 50, once: true });
  }, []);

  // Hàm render Badge trạng thái
  const renderStatus = (status) => {
    switch (status) {
      case "active":
        return <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending</span>;
      case "banned":
        return <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Ban className="w-3 h-3" /> Banned</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full pt-2 pb-8 px-4">

      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-8">
        <button className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>
        <div className="flex gap-2">
          {/* Thêm nút Add User nếu muốn */}
          <button className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
            + Add User
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Title & Filter */}
      <div className="mb-8" data-aos="fade-up">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Platform Users
        </h3>
        <div className="relative inline-block">
          <button className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2 shadow-sm hover:shadow transition-shadow">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              All Users
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            // Thêm class group và relative để xử lý hover
            className="relative flex flex-col p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Action Menu (Hiện khi hover) */}
            <button className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                {/* Online/Offline dot (Optional) */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              {/* Info */}
              <div className="flex flex-col overflow-hidden w-full">
                <h4 className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {user.role}
                </p>

                {/* Status Badge */}
                <div className="flex items-center justify-between mt-1">
                  {renderStatus(user.status)}

                  {/* Rating Star */}
                  {user.rating > 0 && (
                    <div className="flex items-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400 mr-1" />
                      {user.rating}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}