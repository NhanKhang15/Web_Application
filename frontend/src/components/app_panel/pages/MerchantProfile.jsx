// src/pages/MerchantProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LeftNav from "../slidebar/screens/LeftNav";
import CardShell from "../widget/screens/CardShell";
import AuctionSideBar from "../slidebar/screens/AuctionSideBar";
import UserProfileInfo from "../widget/screens/UserProfileInfo";
import fullLogo from "../../../assets/logo/full_logo.png";
import Logo from "../../../assets/logo/logo.png";
import { Search, X, Globe, ChevronDown } from "lucide-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useMotionValueEvent,
} from "framer-motion";
import { useUserProfile } from "../user_infor/lib/useUserProfile.js";
import UserOverview from "../user_infor/screens/user/UserOverview.jsx";
import UserAttachment from "../user_infor/screens/attachment/UserAttachment.jsx";
import AuctionView from "../auction/screen/onGoing/onGoingView.jsx";
import PlatformUsers from "../trader/screens/PlatformUsers.jsx";
import UserWallet from "../user_infor/screens/wallet/UserWallet.jsx";
import UserChart from "../user_infor/screens/performance/UserChart.jsx";
import Settings from "../settings/Settings.jsx";
import Utilities from "../utils/Utilities.jsx";
import AboutUs from "../about/AboutUs.jsx";
import { SearchDropdown } from "../widget/screens/searchAuction.jsx";
import PostAuction from "../seller/screens/PostAuction.jsx";
import ManageAuction from "../seller/screens/ManageAuction.jsx";
import SellerSideBar from "../slidebar/screens/SellerSideBar.jsx";
import { useNavigate, useParams, createSearchParams } from "react-router-dom";
import { ChatProvider } from "../widget/screens/ChatContext.jsx";
import { navigationItems } from "../slidebar/lib/navigationItems.js";
import { auctionMenu } from "../slidebar/lib/auctionMenu.js";
import { sellerMenu } from "../slidebar/lib/sellerMenu.js";
import { subSidebarItems } from "../slidebar/lib/subSidebarItems.js";
import { useTranslation } from "react-i18next";
import UtilityMenu from "../widget/screens/UtilityMenu.jsx";
import MobileNav from "../slidebar/screens/MobileNav.jsx";
import CurrencySelector from "../widget/screens/CurrencySelector.jsx";

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
    const [auctionView, setAuctionView] = React.useState("Ongoing Auctions");
    const [sellerView, setSellerView] = React.useState("Manage Auction");

    const navigate = useNavigate();
    const params = useParams();
    const category = params?.category
    const slug = params?.slug;

    const [auctionSidebarOpen, setAuctionSidebarOpen] = React.useState(false);
    const [sellerSidebarOpen, setSellerSidebarOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const { profile, email, loading, updateProfile } = useUserProfile();

    // Header height constants (in pixels)
    const EXPANDED_HEADER_PX = 200;
    const COLLAPSED_HEADER_PX = 80;
    const OVERLAP_PX = 140;

    const { scrollY } = useScroll();

    const headerH = useTransform(scrollY, [0, 80], [`${EXPANDED_HEADER_PX}px`, `${COLLAPSED_HEADER_PX}px`]);
    const cardOverlap = useTransform(scrollY, [0, 80], [`-${EXPANDED_HEADER_PX - OVERLAP_PX}px`, `0px`]);
    const contentPadTop = useTransform(scrollY, [0, 80], [`${EXPANDED_HEADER_PX}px`, `${COLLAPSED_HEADER_PX}px`]);

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
    const langBtnRef = useRef(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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
            pathname: "/dashboard/auctions/ongoing",
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
            const foundItem = navigationItems.find(item => item.path === category);
            const key = foundItem ? foundItem.key : "user";
            setLeftKey(key);
        } else if (!category) {
            setLeftKey("user");
        }
    }, [category]);

    useEffect(() => {
        if (category === "auctions") {
            if (!slug) {
                navigate("/dashboard/auctions/ongoing", { replace: true });
            } else {
                const foundItem = auctionMenu.find(item => item.path === slug);
                if (foundItem) {
                    setAuctionView(foundItem.label);
                } else {
                    setAuctionView("Ongoing Auctions");
                }
            }
        } else if (category === "seller") {
            if (!slug) {
                navigate("/dashboard/seller/manage", { replace: true });
            } else {
                const foundItem = sellerMenu.find(item => item.path === slug);
                if (foundItem) {
                    setSellerView(foundItem.label);
                } else {
                    setSellerView("Manage Auction");
                }
            }
        } else if (category === "user") {
            if (!slug) {
                navigate("/dashboard/user/profile", { replace: true });
            } else {
                const foundItem = subSidebarItems.find(item => item.path === slug);
                if (foundItem) {
                    setActiveSub(foundItem.key);
                } else {
                    setActiveSub("user");
                }
            }
        }
    }, [slug, category, navigate]);

    const handleNavigation = (key) => {
        if (navigate) {
            const navItem = navigationItems.find(item => item.key === key);
            let path = navItem?.path || key;
            if (key === "auction") {
                path = "auctions/ongoing";
            } else if (key === "seller") {
                path = "seller/manage";
            }
            navigate(`/dashboard/${path}`);
        } else {
            setLeftKey(key);
        }
    };

    const handleSellerMenuSelect = (label) => {
        const item = sellerMenu.find(i => i.label === label);
        if (item) {
            navigate(`/dashboard/seller/${item.path}`);
        } else {
            setSellerView(label);
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

    const handleUserMenuSelect = (key) => {
        const item = subSidebarItems.find(i => i.key === key);
        if (item) {
            navigate(`/dashboard/user/${item.path}`);
        } else {
            setActiveSub(key);
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
        try {
            const user = JSON.parse(sessionStorage.getItem("user"));
            if (user && user.userId) {
                localStorage.setItem(`lang_${user.userId}`, lng);
            } else {
                localStorage.setItem("lang", lng);
            }
        } catch (e) {
            localStorage.setItem("lang", lng);
        }
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
        <>
            <ChatProvider>
                <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-[#111] text-neutral-900 dark:text-neutral-100 pb-16 md:pb-0">
                    {/* HEADER */}
                    <motion.div
                        className="sticky top-0 w-full z-20 bg-neutral-900 dark:bg-white"
                        style={{
                            height: headerH,
                            willChange: "height, transform",
                            transform: "translateZ(0)",
                            backfaceVisibility: "hidden",
                            zIndex: scrolled ? 50 : 20
                        }}
                    >
                        <div className="h-full px-6 flex items-center justify-between">
                            {/* LEFT: Logo */}
                            <div className="flex items-center">
                                <button onClick={() => { handleNavigation("auction"); setAuctionView("Ongoing Auctions"); }} className="bg-transparent p-0 m-0 flex items-center">
                                    <motion.img src={fullLogo} alt="Auction" className="object-contain select-none h-28 w-auto" style={{ opacity: logoFullOpacity, scale: logoFullScale }} />
                                </button>
                                <button onClick={() => { handleNavigation("auction"); setAuctionView("Ongoing Auctions"); }} className="bg-transparent p-0 m-0 flex items-center">
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

                            {/* Mobile Search Button */}
                            <button
                                onClick={() => setMobileSearchOpen(true)}
                                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-neutral-700 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-700"
                                aria-label="Search"
                            >
                                <Search className="w-4 h-4" />
                            </button>

                            {/* RIGHT: Currency + Lang switch + User chip */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Currency Selector */}
                                <CurrencySelector className="hidden md:block" />

                                {/* Language Selector */}
                                <div className="relative" ref={langBtnRef}>
                                    <button
                                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                        className="flex items-center gap-1.5 bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800 rounded-full px-3 py-1.5 hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">{i18n.language?.startsWith('vi') ? 'VI' : 'EN'}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                <UserProfileInfo variant="chip" profile={profile} email={email} onClick={() => { handleNavigation("user"); setActiveSub("user"); }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile Search Overlay */}
                    <AnimatePresence>
                        {mobileSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: '100%' }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="md:hidden fixed inset-0 z-[60] bg-white dark:bg-neutral-900 flex flex-col"
                            >
                                <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
                                    <button
                                        onClick={() => setMobileSearchOpen(false)}
                                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <X className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                                    </button>
                                    <div className="flex-1 flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 h-10">
                                        <Search className="w-4 h-4 text-neutral-500 mr-2" />
                                        <input
                                            type="text"
                                            placeholder={t("search_placeholder") || "Search auctions..."}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch(query);
                                                    setMobileSearchOpen(false);
                                                }
                                            }}
                                            autoFocus
                                            className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none"
                                        />
                                        {query && (
                                            <button onClick={() => setQuery("")} className="text-neutral-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {searchHistory.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                                                {t("search_history") || "Recent Searches"}
                                            </h3>
                                            <div className="space-y-2">
                                                {searchHistory.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            handleSearch(item);
                                                            setMobileSearchOpen(false);
                                                        }}
                                                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                                                    >
                                                        <span className="text-neutral-700 dark:text-neutral-200">{item}</span>
                                                        <button
                                                            onClick={(e) => removeHistoryItem(e, item)}
                                                            className="text-neutral-400 hover:text-neutral-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* BODY */}
                    <div className="flex flex-1 min-h-0">
                        <motion.div
                            className="hidden md:block shrink-0 sticky"
                            style={{
                                top: contentPadTop,
                                willChange: "top",
                                transform: "translateZ(0)",
                                height: useTransform(scrollY, [0, 160], [`calc(100vh - ${EXPANDED_HEADER_PX}px)`, `calc(100vh - ${COLLAPSED_HEADER_PX}px)`])
                            }}
                        >
                            <LeftNav activeKey={leftKey} onChange={setLeftKey} />
                        </motion.div>

                        <main className="relative flex-1 min-h-0">
                            <motion.div
                                className="px-3 pb-4 min-w-0"
                                style={{
                                    marginTop: scrolled ? headerH : cardOverlap,
                                    zIndex: scrolled ? 5 : 30,
                                    willChange: "margin-top"
                                }}
                            >
                                {leftKey === "auction" ? (
                                    <CardShell variant="custom" customLeft={<AuctionSideBar active={auctionView} onSelect={handleAuctionMenuSelect} isOpen={auctionSidebarOpen} onToggle={() => setAuctionSidebarOpen(!auctionSidebarOpen)} />}>
                                        <AuctionView view={auctionView} />
                                    </CardShell>
                                ) : leftKey === "seller" ? (
                                    <CardShell variant="custom" customLeft={<SellerSideBar active={sellerView} onSelect={handleSellerMenuSelect} isOpen={sellerSidebarOpen} onToggle={() => setSellerSidebarOpen(!sellerSidebarOpen)} />}>
                                        {sellerView === "Manage Auction" ? <ManageAuction /> : <PostAuction />}
                                    </CardShell>
                                ) : leftKey === "user" ? (
                                    <CardShell subKey={activeSub} onSubChange={handleUserMenuSelect} plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>
                                        {renderSubPage()}
                                    </CardShell>
                                ) : leftKey === "trader" ? (
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

                    {/* Mobile Bottom Navigation */}
                    <MobileNav activeKey={leftKey} onChange={handleNavigation} />

                    <UtilityMenu currentUserId={profile?.userId} />

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
            </ChatProvider>

            {/* Language Dropdown Portal - rendered outside header for z-index */}
            {
                langDropdownOpen && langBtnRef.current && createPortal(
                    <div
                        className="fixed z-[9999] bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden min-w-[130px]"
                        style={{
                            top: langBtnRef.current.getBoundingClientRect().bottom + 8,
                            right: window.innerWidth - langBtnRef.current.getBoundingClientRect().right
                        }}
                    >
                        <button
                            onClick={() => { changeLang('vi'); setLangDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-800 dark:text-neutral-200 ${i18n.language?.startsWith('vi') ? 'bg-neutral-100 dark:bg-neutral-700 font-semibold' : ''}`}
                        >
                            <span>🇻🇳</span> Tiếng Việt
                        </button>
                        <button
                            onClick={() => { changeLang('en'); setLangDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-800 dark:text-neutral-200 ${!i18n.language?.startsWith('vi') ? 'bg-neutral-100 dark:bg-neutral-700 font-semibold' : ''}`}
                        >
                            <span>🇺🇸</span> English
                        </button>
                    </div>,
                    document.body
                )
            }
        </>
    );
}