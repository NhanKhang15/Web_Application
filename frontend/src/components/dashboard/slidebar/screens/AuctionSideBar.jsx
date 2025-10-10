import React from "react";
import { auctionMenu } from "../lib/auctionMenu";

export default function AuctionSideBar({ active, onSelect }) {
    return (
        <aside
            className="
        fixed
        top-[170px]
        left-[150px]
        w-[240px]
        rounded-[12px]
        shadow-lg ring-1
        ring-black/10 dark:ring-white/10
        bg-white text-neutral-900
        dark:bg-[#1f1f21] dark:text-white
        transition-colors duration-300
        z-[1000]
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
                                className={`w-full text-left px-4 py-2 text-sm rounded-md outline-none transition
                  ${
                                    isActive
                                        ? "bg-neutral-900/10 dark:bg-white/15 text-neutral-900 dark:text-white"
                                        : "text-neutral-700 hover:bg-neutral-100 dark:text-white/80 dark:hover:bg-white/10"
                                }`}
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
