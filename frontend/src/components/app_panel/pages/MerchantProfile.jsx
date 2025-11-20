// src/pages/MerchantProfile.jsx
import React, {useEffect} from "react";
import LeftNav from "../slidebar/screens/LeftNav";
import CardShell from "../widget/sceens/CardShell";
import AuctionSideBar from "../slidebar/screens/AuctionSideBar";
import UserProfileInfo from "../widget/sceens/UserProfileInfo";
import fullLogo from "../../../assets/logo/full_logo.png";
import Logo from "../../../assets/logo/logo.png";
import { Search, Globe } from "lucide-react"; // 🌐 thêm Globe icon
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
import CalculatorWidget from "../widget/sceens/CalculatorWidget.jsx";
import {searchAuction, SearchDropdown } from "../widget/sceens/searchAuction.jsx";
import PostAuction from "../postAuction/screen/PostAuction.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {NAV_URL_MAPPING} from "../slidebar/lib/NAV_URL_MAPPING.js";
import { auctionMenu } from "../slidebar/lib/auctionMenu.js";

// 🌍 import i18n
import { useTranslation } from "react-i18next";

function EmptyPage({ title }) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex-1 min-h-[300px] rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-neutral-400 dark:text-neutral-500">
                (để trống)
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

    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState([]);
    const searchRef = React.useRef(null);

    useEffect(() => {
        if (category) {
            // Reverse lookup: Find which key maps to this URL path
            const mapping = NAV_URL_MAPPING || {};
            const foundEntry = Object.entries(mapping).find(([k, v]) => v === category);
            const key = foundEntry ? foundEntry[0] : "user";
            setLeftKey(key);
        } else if (!category) {
            // If no category (e.g. /dashboard root)
            setLeftKey("user");
        }
    }, [category]);

    useEffect(() => {
        if (leftKey === "auction") {
            if (!slug) {
                // 👇 MỚI: Nếu vào /dashboard/auctions mà không có slug
                // -> Tự động chuyển hướng sang /dashboard/auctions/main
                navigate("/dashboard/auctions/main", { replace: true });
            } else {
                // Logic cũ: Tìm tên menu để highlight
                const foundItem = auctionMenu.find(item => item.path === slug);
                if (foundItem) {
                    setAuctionView(foundItem.label);
                }
                // Nếu slug là 'main' hoặc tên sản phẩm, set mặc định là Dashboard
                else {
                    setAuctionView("Dashboard");
                }
            }
        }
    }, [slug, leftKey, navigate]);

    const handleNavigation = (key) => {
        if (navigate) {
            let path = NAV_URL_MAPPING?.[key] || key;

            // 👇 MỚI: Nếu bấm vào tab 'auction', ép buộc vào đường dẫn 'main'
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

    // 🌍 i18next setup
    const { t , i18n} = useTranslation();
    const changeLang = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng);
    };

    const renderSubPage = () => {
        if (loading) {
            return <p className="text-neutral-500 dark:text-neutral-400">Loading profile...</p>;
        }
        if (!profile) {
            return <p className="text-red-500">Failed to load user data</p>;
        }

        switch (activeSub) {
            case "user":
                return (
                    <UserOverview
                        profile={profile}
                        email={email}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        updateProfile={updateProfile}
                    />
                );
            case "file":
                return <UserAttachment profile={profile} />;
            case "wallet":
                return (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Wallet</h2>
                        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Ghi chú trống…</p>
                        </div>
                    </>
                );
            case "chart":
                return (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
                        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Biểu đồ (demo).</p>
                        </div>
                    </>
                );
            default:
                return (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Chọn mục ở sub sidebar.
                    </p>
                );
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-[#111] text-neutral-900 dark:text-neutral-100">
            {/* HEADER */}
            <motion.div
                className="sticky top-0 w-full z-20 bg-neutral-900 dark:bg-white"
                style={{ height: headerH, willChange: "height", zIndex: scrolled ? 50 : 20 }}
            >
                <div className="h-full px-6 flex items-center justify-between">
                    {/* LEFT: Logo */}
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                handleNavigation("auction");
                                setAuctionView("Dashboard");
                            }}
                            className="bg-transparent p-0 m-0 flex items-center"
                        >
                            <motion.img
                                src={fullLogo}
                                alt="Auction"
                                className="object-contain select-none h-28 w-auto"
                                style={{ opacity: logoFullOpacity, scale: logoFullScale }}
                            />
                        </button>

                        <button
                            onClick={() => {
                                handleNavigation("auction");
                                setAuctionView("Dashboard");
                            }}
                            className="bg-transparent p-0 m-0 flex items-center"
                        >
                            <motion.img
                                src={Logo}
                                alt="A"
                                className="object-contain select-none h-12 w-auto"
                                style={{ opacity: logoMarkOpacity }}
                            />
                        </button>
                    </div>

                    {/* CENTER: Search */}
                    <div className="hidden md:flex flex-1 justify-center relative">
                        <motion.div style={{ width: searchWidth }}>
                            <motion.div
                                ref={searchRef}
                                className="flex items-center justify-center w-full rounded-full
                                bg-neutral-200 dark:bg-neutral-800 px-4 relative overflow-visible"
                                style={{ height: searchHeight }}
                            >
                                <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder={t("search_placeholder")}
                                    value={query}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setQuery(val);
                                        const res = searchAuction(val);
                                        setResults(res);
                                    }}
                                    className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 text-center outline-none"
                                />
                            </motion.div>

                            {results.length > 0 && (
                                <SearchDropdown
                                    anchorRef={searchRef}
                                    results={results}
                                    onSelect={(r) => {
                                        alert(`Bạn đã chọn ${r.name}`);
                                        setResults([]); // ẩn dropdown khi chọn
                                    }}
                                    onClose={() => setResults([])} // đóng khi click ra ngoài
                                />
                            )}

                            {results.length === 0 && query && <p className="absolute top-12 bg-white p-2 shadow rounded text-sm text-black">{t("search_no_results")}</p>}
                        </motion.div>
                    </div>

                    {/* RIGHT: User chip + Lang switch */}
                    <div className="flex items-center gap-4">
                        {/* 🌐 Language switcher */}
                        <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-neutral-400" />
                            <select
                                value={i18n.language ? i18n.language.split('-')[0] : "vi"}
                                onChange={(e) => changeLang(e.target.value)}
                                className="bg-transparent text-sm text-neutral-200 dark:text-neutral-700 border border-neutral-700 dark:border-neutral-300 rounded-md px-2 py-1 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors duration-200"
                            >
                                <option value="vi">🇻🇳 VI</option>
                                <option value="en">🇺🇸 EN</option>
                            </select>
                        </div>

                        {/* 👤 User chip */}
                        <UserProfileInfo
                            variant="chip"
                            profile={profile}
                            email={email}
                            onClick={() => {
                                handleNavigation("user");
                                setActiveSub("user");
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* BODY */}
            <div className="flex flex-1 min-h-0">
                <motion.div
                    className="hidden md:block shrink-0 sticky"
                    style={{
                        top: contentPadTop,
                        willChange: "top",
                        height: useTransform(scrollY, [0, 160], [
                            `calc(100vh - ${EXPANDED_HEADER_VH}vh)`,
                            `calc(100vh - ${COLLAPSED_HEADER_VH}px)`,
                        ]),
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
                            willChange: "margin-top",
                        }}
                    >
                        {leftKey === "auction" ? (
                            <CardShell
                                variant="custom"
                                customLeft={
                                    <AuctionSideBar
                                        active={auctionView}
                                        onSelect={handleAuctionMenuSelect}
                                        isOpen={auctionSidebarOpen}
                                        onToggle={() => setAuctionSidebarOpen(!auctionSidebarOpen)}
                                    />
                                }
                                // Class padding thay đổi dựa trên trạng thái open/close
                                plClass={`transition-all duration-500 ${auctionSidebarOpen ? "!pl-[220px]" : "!pl-4"}`}
                            >
                                <AuctionView view={auctionView} />
                            </CardShell>
                        ) : leftKey === "post" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>
                                <PostAuction />
                            </CardShell>
                        ): leftKey === "user" ? (
                            <CardShell
                                subKey={activeSub}
                                onSubChange={setActiveSub}
                                plClass="pl-0 md:pl-[4%]"
                                stickyTop={contentPadTop}
                            >
                                {renderSubPage()}
                            </CardShell>
                        ) : leftKey === "settings" ? (
                            <CardShell plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>
                                <Settings />
                            </CardShell>
                        ) : leftKey === "utils" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]">
                                <Utilities />
                            </CardShell>
                        ) : leftKey === "about" ? (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>
                                <AboutUs />
                            </CardShell>
                        ) : (
                            <CardShell variant="custom" plClass="pl-0 md:pl-[4%]">
                                <EmptyPage title={leftKey} />
                            </CardShell>
                        )}
                    </motion.div>
                </main>
            </div>
            <CalculatorWidget />
        </div>
    );
}
