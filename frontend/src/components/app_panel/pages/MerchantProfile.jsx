import React, { useEffect, useRef, useState } from "react";
import LeftNav from "../slidebar/screens/LeftNav";
import CardShell from "../widget/screens/CardShell";
import AuctionSideBar from "../slidebar/screens/AuctionSideBar";
import UserProfileInfo from "../widget/screens/UserProfileInfo";
import fullLogo from "../../../assets/logo/full_logo.png";
import Logo from "../../../assets/logo/logo.png";
import { Search, Globe, X } from "lucide-react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValueEvent,
} from "framer-motion";
import { useUserProfile } from "../user_infor/lib/useUserProfile.js";
import UserOverview from "../user_infor/screens/user/UserOverview.jsx";
import UserAttachment from "../user_infor/screens/attachment/UserAttachment.jsx";
import AuctionView from "../auction/screen/main/AuctionView.jsx";
import Settings from "../settings/Settings.jsx";
import Utilities from "../utils/Utilities.jsx";
import AboutUs from "../about/AboutUs.jsx";
import CalculatorWidget from "../widget/screens/CalculatorWidget.jsx";
import { SearchDropdown } from "../widget/screens/searchAuction.jsx";
import PostAuction from "../postAuction/screen/PostAuction.jsx";
import { useNavigate, useParams, createSearchParams } from "react-router-dom";
import { NAV_URL_MAPPING } from "../slidebar/lib/NAV_URL_MAPPING.js";
import { auctionMenu } from "../slidebar/lib/auctionMenu.js";
import { useTranslation } from "react-i18next";
import PlatformUsers from "../trader/screens/PlatformUsers.jsx";
import UserWallet from "../user_infor/screens/wallet/UserWallet.jsx";
import UserChart from "../user_infor/screens/performance/UserChart.jsx";

function EmptyPage({ title }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex-1 min-h-[300px] rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-neutral-400 dark:text-neutral-500">
                {t ? t('empty_state') : "(empty)"}
            </div>
        </div>
    );
}

export default function MerchantProfile() {
    const [leftKey, setLeftKey] = React.useState("user");
    const [activeSub, setActiveSub] = React.useState("user");
    const [auctionView, setAuctionView] = React.useState("Dashboard");

    const navigate = useNavigate();
    const params = useParams();
    const category = params?.category
    const slug = params?.slug;

    const [auctionSidebarOpen, setAuctionSidebarOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const { profile, email, loading, updateProfile } = useUserProfile();

    const EXPANDED_HEADER_VH = 200;
    const COLLAPSED_HEADER_VH = 80;
    const OVERLAP_VH = 140;

    const { scrollY } = useScroll();

    const headerH = useTransform(scrollY, [0, 80], [`${EXPANDED_HEADER_VH}vh`, `${COLLAPSED_HEADER_VH}px`]);
    const cardOverlap = useTransform(scrollY, [0, 80], [`-${EXPANDED_HEADER_VH - OVERLAP_VH}vh`, `0px`]);
    const contentPadTop = useTransform(scrollY, [0, 80], [`${EXPANDED_HEADER_VH}vh`, `${COLLAPSED_HEADER_VH}px`]);

    const logoFullOpacity = useTransform(scrollY, [0, 40], [1, 0]);
    const logoMarkOpacity = useTransform(scrollY, [20, 80], [0, 1]);
    const logoFullScale = useTransform(scrollY, [0, 40], [1, 0.95]);

    const searchWidth = useTransform(scrollY, [0, 80], ["min(640px,60vw)", "min(420px,40vw)"]);
    const searchHeight = useTransform(scrollY, [0, 80], ["40px", "34px"]);

    // --- STATE TÌM KIẾM MỚI ---
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const searchRef = useRef(null);

    // 1. Load lịch sử từ LocalStorage (Giữ lại 1 cái duy nhất)
    useEffect(() => {
        const saved = localStorage.getItem("auction_search_history");
        if (saved) {
            setSearchHistory(JSON.parse(saved));
        }
    }, []);

    // 2. Hàm thực hiện tìm kiếm (khi bấm Enter hoặc chọn từ lịch sử)
    const handleSearch = (keyword) => {
        if (!keyword.trim()) return;

        // Lưu vào lịch sử
        const newHistory = [keyword, ...searchHistory.filter(k => k !== keyword)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem("auction_search_history", JSON.stringify(newHistory));

        setShowDropdown(false);
        setQuery(keyword);

        // Điều hướng
        navigate({
            pathname: "/dashboard/auctions/main",
            search: `?${createSearchParams({ search: keyword })}`,
        });
    };

    // 3. Hàm xóa 1 item lịch sử
    const removeHistoryItem = (e, item) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(k => k !== item);
        setSearchHistory(newHistory);
        localStorage.setItem("auction_search_history", JSON.stringify(newHistory));
    };

    // 🗑 Đã XÓA HOÀN TOÀN useEffect debounce gọi API searchAuction tại đây

    // --- LOGIC NAVIGATION GIỮ NGUYÊN ---
    useEffect(() => {
        if (category) {
            const mapping = NAV_URL_MAPPING || {};
            const foundEntry = Object.entries(mapping).find(([k, v]) => v === category);
            const key = foundEntry ? foundEntry[0] : "user";
            setLeftKey(key);
        } else if (!category) {
            setLeftKey("user");
        }
    }, [category]);

    useEffect(() => {
        if (category === "auctions") {
            if (!slug) {
                navigate("/dashboard/auctions/main", { replace: true });
            } else {
                const foundItem = auctionMenu.find(item => item.path === slug);
                if (foundItem) {
                    setAuctionView(foundItem.label);
                } else {
                    setAuctionView("Dashboard");
                }
            }
        } else if (category === "user") {
            // Reset activeSub to 'user' when navigating to /dashboard/user
            setActiveSub("user");
        }
    }, [slug, category, navigate]);

    const handleNavigation = (key) => {
        if (navigate) {
            let path = NAV_URL_MAPPING?.[key] || key;
            if (key === "auction") {
                path = "auctions/main";
            }
            navigate(`/dashboard/${path}`);
        } else {
            setLeftKey(key);
        }
    };

    const handleAuctionMenuSelect = (label) => {
        const item = auctionMenu.find(i => i.label === label);
        if (item) {
            navigate(`/dashboard/auctions/${item.path}`);
        } else {
            setAuctionView(label);
        }
    };

    useMotionValueEvent(scrollY, "change", (y) => {
        const thresholdHigh = 80;
        const thresholdLow = 40;
        setScrolled((prev) => {
            if (!prev && y > thresholdHigh) return true;
            if (prev && y < thresholdLow) return false;
            return prev;
        });
    });

    const { t, i18n } = useTranslation();
    const changeLang = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng);
    };

    const renderSubPage = () => {
        if (loading) return <p className="text-neutral-500 dark:text-neutral-400">{t('loading_profile')}</p>;
        if (!profile) return <p className="text-red-500">{t('loading_profile')}</p>;

        switch (activeSub) {
            case "user":
                return <UserOverview profile={profile} email={email} isEditing={isEditing} setIsEditing={setIsEditing} updateProfile={updateProfile} />;
            case "file":
                return <UserAttachment profile={profile} />;
            case "wallet":
                return <UserWallet profile={profile} />;
            case "chart":
                return <UserChart profile={profile} />;
            default:
                return <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('select_sidebar_item')}</p>;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-[#111] text-neutral-900 dark:text-neutral-100">
            {/* HEADER */}
            <motion.div className="sticky top-0 w-full z-20 bg-neutral-900 dark:bg-white" style={{ height: headerH, willChange: "height", zIndex: scrolled ? 50 : 20 }}>
                <div className="h-full px-6 flex items-center justify-between">
                    {/* LEFT: Logo */}
                    <div className="flex items-center">
                        <button onClick={() => { handleNavigation("auction"); setAuctionView("Dashboard"); }} className="bg-transparent p-0 m-0 flex items-center">
                            <motion.img src={fullLogo} alt="Auction" className="object-contain select-none h-28 w-auto" style={{ opacity: logoFullOpacity, scale: logoFullScale }} />
                        </button>
                        <button onClick={() => { handleNavigation("auction"); setAuctionView("Dashboard"); }} className="bg-transparent p-0 m-0 flex items-center">
                            <motion.img src={Logo} alt="A" className="object-contain select-none h-12 w-auto" style={{ opacity: logoMarkOpacity }} />
                        </button>
                    </div>

                    {/* CENTER: Search */}
                    <div className="hidden md:flex flex-1 justify-center relative">
                        <motion.div style={{ width: searchWidth }}>
                            <motion.div ref={searchRef} className="flex items-center justify-center w-full rounded-full bg-neutral-200 dark:bg-neutral-800 px-4 relative overflow-visible" style={{ height: searchHeight }}>
                                <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder={t("search_placeholder") || "Search auctions..."}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    // 👇 Sự kiện Enter để Search
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch(query);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 text-center outline-none"
                                />
                                {query && (
                                    <button
                                        onClick={() => { setQuery(""); setShowDropdown(false); }}
                                        className="ml-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </motion.div>

                            {/* 👇 SỬA LẠI DROPDOWN: Chỉ truyền history, bỏ results/loading */}
                            {showDropdown && (
                                <SearchDropdown
                                    anchorRef={searchRef}
                                    history={searchHistory} // Truyền history
                                    onSelect={(keyword) => handleSearch(keyword)} // Chọn history thì search luôn
                                    onRemove={removeHistoryItem}
                                    onClose={() => setShowDropdown(false)}
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* RIGHT: User chip + Lang switch */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-neutral-400" />
                            <select value={i18n.language ? i18n.language.split('-')[0] : "vi"} onChange={(e) => changeLang(e.target.value)} className="bg-transparent text-sm text-neutral-200 dark:text-neutral-700 border border-neutral-700 dark:border-neutral-300 rounded-md px-2 py-1 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors duration-200">
                                <option value="vi">🇻🇳 VI</option>
                                <option value="en">🇺🇸 EN</option>
                            </select>
                        </div>
                        <UserProfileInfo variant="chip" profile={profile} email={email} onClick={() => { handleNavigation("user"); setActiveSub("user"); }} />
                    </div>
                </div>
            </motion.div>

            {/* BODY */}
            <div className="flex flex-1 min-h-0">
                <motion.div className="hidden md:block shrink-0 sticky" style={{ top: contentPadTop, willChange: "top", height: useTransform(scrollY, [0, 160], [`calc(100vh - ${EXPANDED_HEADER_VH}vh)`, `calc(100vh - ${COLLAPSED_HEADER_VH}px)`]) }}>
                    <LeftNav activeKey={leftKey} onChange={setLeftKey} />
                </motion.div>

                <main className="relative flex-1 min-h-0">
                    <motion.div className="px-3 pb-4 min-w-0" style={{ marginTop: scrolled ? headerH : cardOverlap, zIndex: scrolled ? 5 : 30, willChange: "margin-top" }}>
                        {leftKey === "auction" ? (
                            <CardShell variant="custom" customLeft={<AuctionSideBar active={auctionView} onSelect={handleAuctionMenuSelect} isOpen={auctionSidebarOpen} onToggle={() => setAuctionSidebarOpen(!auctionSidebarOpen)} />} plClass={`transition-all duration-500 ${auctionSidebarOpen ? "!pl-[220px]" : "!pl-4"}`}>
                                <AuctionView view={auctionView} />
                            </CardShell>
                        ) : leftKey === "post" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}><PostAuction /></CardShell>
                        ) : leftKey === "user" ? (
                            <CardShell subKey={activeSub} onSubChange={setActiveSub} plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>{renderSubPage()}</CardShell>
                        ): leftKey === "trader" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}><PlatformUsers /></CardShell>
                        ) : leftKey === "settings" ? (
                            <CardShell plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}><Settings /></CardShell>
                        ) : leftKey === "utils" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]"><Utilities /></CardShell>
                        ) : leftKey === "about" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}><AboutUs /></CardShell>
                        ) : (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]"><EmptyPage title={leftKey} /></CardShell>
                        )}
                    </motion.div>
                </main>
            </div>
            <CalculatorWidget />

            <style>{`
                ::-webkit-scrollbar {
                    width: 7px; /* Độ rộng vừa phải cho trang chính */
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #d1d5db; /* Màu sáng (Gray-300) */
                    border-radius: 20px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color: #9ca3af; /* Hover đậm hơn */
                }
                /* Dark Mode */
                :is(.dark) ::-webkit-scrollbar-thumb {
                    background-color: #4b5563; /* Màu tối (Gray-600) */
                }
                :is(.dark) ::-webkit-scrollbar-thumb:hover {
                    background-color: #6b7280;
                }
            `}</style>
        </div>
    );
}