// src/pages/MerchantProfile.jsx
import React from "react";
import LeftNav from "../slidebar/screens/LeftNav";
import CardShell from "../widget/sceens/CardShell";
import InfoCardBody from "../user_infor/screens/InfoCardBody";
import AuctionSideBar from "../slidebar/screens/AuctionSideBar";
import UserProfileInfo from "../widget/sceens/UserProfileInfo";

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


  const HEADER_H = "h-[32vh] md:h-[36vh] lg:h-[40vh]";
  const OVERLAP_CLASS = "-mt-[16vh] md:-mt-[18vh] lg:-mt-[20vh]";
  const PROFILE_W = "w-[18vw] md:w-[16vw] lg:w-[12vw]";

  const renderSubPage = () => {
    switch (activeSub) {
      case "bell":
        return <InfoCardBody />;
      case "user":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">User Overview</h2>
            <p className="text-sm text-neutral-500">Trang User (demo).</p>
          </>
        );
      case "note":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
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
      {/* Header */}
      <div className={`${HEADER_H} bg-black w-full relative z-0`}>
        <div
          className={`absolute inset-y-0 left-0 ${PROFILE_W} flex items-start justify-center z-0 pointer-events-none`}
        >
          <UserProfileInfo />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block">
          <LeftNav activeKey={leftKey} onChange={setLeftKey} />
        </div>

        <main className="relative flex-1 h-full min-h-0">
          <div className={`${OVERLAP_CLASS} px-4 pb-4 relative z-[60]`}>
            <div className="h-[calc(100vh-32px)]">
              {leftKey === "auction" ? (
                <CardShell
                  variant="custom"
                  customLeft={<AuctionSideBar active={auctionView} onSelect={setAuctionView} />}
                  // Left padding proportional to screen for desktop, none on small screens
                  plClass="pl-0 md:pl-[20vw] lg:pl-[22vw]"
                >
                  <AuctionView view={auctionView} />
                </CardShell>
              ) : leftKey === "user" ? (
                <CardShell
                  subKey={activeSub}
                  onSubChange={setActiveSub}
                  // Percentage-based padding for desktop
                  plClass="pl-0 md:pl-[4%]"
                >
                  {renderSubPage()}
                </CardShell>
              ) : (
                <CardShell variant="custom" plClass="pl-0 md:pl-[4%]">
                  <EmptyPage title={leftKey} />
                </CardShell>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
