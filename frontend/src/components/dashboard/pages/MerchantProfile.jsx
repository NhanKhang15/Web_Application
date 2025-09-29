// src/pages/MerchantProfile.jsx
import React from "react";
import LeftNav from "../slidebar/screens/LeftNav";
import CardShell from "../widget/sceens/CardShell";
import InfoCardBody from "../user_infor/screens/InfoCardBody";
import AuctionSideBar from "../slidebar/screens/AuctionSideBar";
import UserProfileInfo from "../widget/sceens/UserProfileInfo";
import fullLogo from "../../../assets/logo/full_logo.png";
import Logo from "../../../assets/logo/logo.png";
import { Search } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

function AuctionView({ view }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Auction – {view || "Dashboard"}</h2>
      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-600">
          Nội dung của <strong>{view}</strong> (demo). Thay bằng component thật của bạn.
        </p>
      </div>
    </div>
  );
}

function EmptyPage({ title }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex-1 min-h-[300px] rounded-lg border border-dashed border-neutral-300 p-6 text-neutral-400">
        (để trống)
      </div>
    </div>
  );
}

export default function MerchantProfile() {
  const [leftKey, setLeftKey] = React.useState("user");
  const [activeSub, setActiveSub] = React.useState("bell");
  const [auctionView, setAuctionView] = React.useState("Dashboard");
  const [scrolled, setScrolled] = React.useState(false);

  // === Config ===
  const EXPANDED_HEADER_VH = 200; // header lớn
  const COLLAPSED_HEADER_VH = 80; // header nhỏ
  const OVERLAP_VH = 140;         // card cắn vào header ban đầu

  // === Framer Motion ===
  const { scrollY } = useScroll();

  // Header height: 30vh -> 56px
  const headerH = useTransform(
    scrollY,
    [0, 80],
    [`${EXPANDED_HEADER_VH}vh`, `${COLLAPSED_HEADER_VH}px`]
  );

  // Card overlap (negative margin): -12vh -> 0
  const cardOverlap = useTransform(scrollY, [0, 80], [`-${EXPANDED_HEADER_VH - OVERLAP_VH}vh`, `0px`]);

  // Content padding-top to sit below header: 30vh -> 56px
  const contentPadTop = useTransform(
    scrollY,
    [0, 80],
    [`${EXPANDED_HEADER_VH}vh`, `${COLLAPSED_HEADER_VH}px`]
  );

  // Logo transitions
  const logoFullOpacity = useTransform(scrollY, [0, 40], [1, 0]);
  const logoMarkOpacity = useTransform(scrollY, [20, 80], [0, 1]);
  const logoFullScale = useTransform(scrollY, [0, 40], [1, 0.95]);

  // Search size
  const searchWidth = useTransform(scrollY, [0, 80], ["min(640px,60vw)", "min(420px,40vw)"]);
  const searchHeight = useTransform(scrollY, [0, 80], ["40px", "34px"]);

  // Toggle boolean with hysteresis to avoid flicker near the threshold
  // Enter collapsed when y > thresholdHigh, return to expanded when y < thresholdLow
  useMotionValueEvent(scrollY, "change", (y) => {
    const thresholdHigh = 80;
    const thresholdLow = 40;
    setScrolled((prev) => {
      if (!prev && y > thresholdHigh) return true;
      if (prev && y < thresholdLow) return false;
      return prev;
    });
  });

  const renderSubPage = () => {
    switch (activeSub) {
      case "file":
        return <InfoCardBody />;
      case "user":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">User Overview</h2>
            <p className="text-sm text-neutral-500">Trang User (demo).</p>
          </>
        );
      case "wallet":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Wallet</h2>
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-sm text-neutral-600">Ghi chú trống…</p>
            </div>
          </>
        );
      case "chart":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-sm text-neutral-600">Biểu đồ (demo).</p>
            </div>
          </>
        );
      default:
        return <p className="text-sm text-neutral-500">Chọn mục ở sub sidebar.</p>;
    }
  };

  return (
    <div className="bg-[#efeff2] min-h-screen w-full flex flex-col text-[#212121]">
      {/* HEADER (sticky + motion height) */}
      <motion.div
        className="sticky top-0 bg-[#111] w-full z-20"
        style={{ height: headerH, willChange: "height", zIndex: scrolled ? 50 : 20 }}
      >
        <div className="h-full px-6 flex items-center justify-between">
          {/* LEFT: Logo */}
          <div className="flex items-center">
            <motion.img
              src={fullLogo}
              alt="Auction"
              className="object-contain select-none h-28 w-auto"
              style={{ opacity: logoFullOpacity, scale: logoFullScale }}
            />
            <motion.img
              src={Logo}
              alt="A"
              className="object-contain select-none h-12 w-auto"
              style={{ opacity: logoMarkOpacity }}
            />
          </div>

          {/* CENTER: Search */}
          <div className="hidden md:flex flex-1 justify-center">
            <motion.div style={{ width: searchWidth }}>
              <motion.div
                className="flex items-center justify-center w-full rounded-full bg-[#EAEAEA] px-4"
                style={{ height: searchHeight }}
              >
                <Search className="w-4 h-4 text-[#828286] mr-2" />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent text-[#212121] placeholder:text-[#828286] text-center outline-none border-none"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: User chip -> avatar khi collapsed */}
          <div className="flex items-center">
            <UserProfileInfo variant={scrolled ? "avatar" : "chip"} />
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
              `calc(100vh - ${COLLAPSED_HEADER_VH}px)`
            ])
          }}
        >
          {/* Left nav không có scroll riêng */}
          <LeftNav activeKey={leftKey} onChange={setLeftKey} />
        </motion.div>

        <main className="relative flex-1 min-h-0">
          {/* card: overlap -12vh -> 0; padTop 30vh -> 56px */}
          <motion.div
            className="px-3 pb-4"
            style={{
              marginTop: scrolled ? headerH : cardOverlap,
              zIndex: scrolled ? 5 : 30,
              willChange: "margin-top",
            }}
          >
            {leftKey === "auction" ? (
              <CardShell
                variant="custom"
                customLeft={<AuctionSideBar active={auctionView} onSelect={setAuctionView} />}
                plClass="pl-0 md:pl-[20vw] lg:pl-[22vw]"
              >
                <AuctionView view={auctionView} />
              </CardShell>
            ) : leftKey === "user" ? (
              <CardShell subKey={activeSub} onSubChange={setActiveSub} plClass="pl-0 md:pl-[4%]" stickyTop={contentPadTop}>
                <InfoCardBody />
                {renderSubPage()}
              </CardShell>
            ) : (
              <CardShell variant="custom" plClass="pl-0 md:pl-[4%]">
                <EmptyPage title={leftKey} />
              </CardShell>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
