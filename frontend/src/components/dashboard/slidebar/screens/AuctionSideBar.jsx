import React from "react";
import { auctionMenu } from "../lib/auctionMenu";

export default function AuctionSideBar({ active, onSelect }) {
  return (
    <aside
      className="
        absolute left-6 top-8 bottom-6
        w-[260px] overflow-auto
        bg-[#1f1f21] text-white rounded-[12px]
        shadow-xl ring-1 ring-black/20 z-10
      "
      role="navigation"
      aria-label="Auction navigation"
    >
      <ul className="py-3">
        {auctionMenu.map((label) => {
          const isActive = active === label;
          return (
            <li key={label}>
              <button
                role="menuitem"
                onClick={() => onSelect?.(label)}
                className={`w-full text-left px-3 md:px-4 py-2 text-sm outline-none transition
                  ${isActive ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"}`}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
